import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { planos, site } from "./config";
import { enviarConfirmacaoPedido, evolutionConfigurada } from "./evolution";
import type { CriarPedidoEntrada, MetodoPagamento, ReciboPedido } from "./pedido";
import { logado } from "./sessao";

export class ErroPedido extends Error {
  constructor(message: string, public status = 503) { super(message); }
}

export type PedidoRegistrado = {
  recibo: ReciboPedido;
  cliente: CriarPedidoEntrada["cliente"];
  endereco: CriarPedidoEntrada["endereco"];
  respostas: CriarPedidoEntrada["respostas"];
  notificarWhatsApp: boolean;
  assinaturaEntrada: string;
  notificacaoDetalhe?: { iniciadaEm: string; mensagemId?: string; concluidaEm?: string };
};

function configuracaoBanco() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/+$/, ""), token } : null;
}

export function pedidosConfigurados(): boolean { return Boolean(configuracaoBanco()); }

/** Ponto de integração do gateway: adicionar criação de sessão apenas após persistir o pedido.
 * O estado pago deverá vir exclusivamente de um webhook autenticado do provedor.
 */
export function prepararPagamento(metodo: MetodoPagamento): ReciboPedido["pagamento"] {
  return { status: "aguardando_integracao", metodo };
}

async function comando(itens: (string | number)[]): Promise<unknown> {
  const config = configuracaoBanco();
  if (!config) throw new ErroPedido("O checkout está sendo preparado. Seus dados continuam aqui; tente novamente em instantes.");
  const resposta = await fetch(config.url, {
    method: "POST", headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(itens), cache: "no-store", redirect: "error", signal: AbortSignal.timeout(6500),
  });
  if (!resposta.ok) throw new ErroPedido("Não conseguimos registrar seu pedido agora. Tente novamente; a mesma tentativa não cria um pedido duplicado.");
  const dado = await resposta.json() as { result?: unknown; error?: unknown };
  if (dado.error) throw new ErroPedido("O checkout está temporariamente indisponível. Tente novamente em instantes.");
  return dado.result;
}

export async function checkoutDisponivel(): Promise<boolean> {
  if (!pedidosConfigurados()) return false;
  try { return await comando(["PING"]) === "PONG"; } catch { return false; }
}

const prefixo = "fareja:{pedidos}:";
const gravarPedido = `
local existente = redis.call('GET', KEYS[1])
if existente then return {0, redis.call('GET', existente)} end
redis.call('SET', KEYS[2], ARGV[1])
redis.call('SET', KEYS[1], KEYS[2])
redis.call('ZADD', KEYS[3], ARGV[2], ARGV[3])
return {1, ARGV[1]}
`;
const iniciarNotificacao = `
local raw = redis.call('GET', KEYS[1])
if not raw then return 0 end
local pedido = cjson.decode(raw)
if pedido.recibo.notificacao ~= 'pendente' or pedido.notificacaoDetalhe then return 0 end
pedido.notificacaoDetalhe = { iniciadaEm = ARGV[1] }
redis.call('SET', KEYS[1], cjson.encode(pedido))
return 1
`;
const concluirNotificacao = `
local raw = redis.call('GET', KEYS[1])
if not raw then return 0 end
local pedido = cjson.decode(raw)
if not pedido.notificacaoDetalhe then return 0 end
pedido.recibo.notificacao = 'enviada'
pedido.notificacaoDetalhe.mensagemId = ARGV[1]
pedido.notificacaoDetalhe.concluidaEm = ARGV[2]
redis.call('SET', KEYS[1], cjson.encode(pedido))
return 1
`;
const limitarTentativas = `
local numero = redis.call('INCR', KEYS[1])
if numero == 1 then redis.call('EXPIRE', KEYS[1], 600) end
return numero
`;

export async function limitarPedidos(identificador: string): Promise<void> {
  const hash = createHash("sha256").update(identificador).digest("hex");
  const numero = await comando(["EVAL", limitarTentativas, 1, `${prefixo}limite:${hash}`]);
  if (Number(numero) > 12) throw new ErroPedido("Recebemos muitas tentativas. Aguarde alguns minutos antes de tentar novamente.", 429);
}

export async function criarPedido(entrada: CriarPedidoEntrada): Promise<ReciboPedido> {
  const subtotalCentavos = Math.round(planos[entrada.plano].preco * 100);
  if (subtotalCentavos < Math.round(site.freteGratisAcima * 100)) throw new ErroPedido("A condição de entrega deste plano precisa ser atualizada.");
  const assinaturaEntrada = createHash("sha256").update(JSON.stringify(entrada)).digest("hex");
  const criadoEm = new Date().toISOString();
  const recibo: ReciboPedido = {
    id: `FJ-${randomUUID().toUpperCase()}`, criadoEm, plano: entrada.plano,
    subtotalCentavos, freteCentavos: 0, totalCentavos: subtotalCentavos,
    status: "aguardando_pagamento", pagamento: prepararPagamento(entrada.metodoPagamento),
    notificacao: !entrada.notificarWhatsApp ? "nao_solicitada" : evolutionConfigurada() ? "pendente" : "nao_configurada",
  };
  const pedido: PedidoRegistrado = { recibo, cliente: entrada.cliente, endereco: entrada.endereco, respostas: entrada.respostas, notificarWhatsApp: entrada.notificarWhatsApp, assinaturaEntrada };
  const chavePedido = `${prefixo}pedido:${recibo.id}`;
  const resultado = await comando(["EVAL", gravarPedido, 3, `${prefixo}idempotencia:${entrada.chaveIdempotencia}`, chavePedido, `${prefixo}recentes`, JSON.stringify(pedido), Date.now(), recibo.id]);
  if (!Array.isArray(resultado) || typeof resultado[1] !== "string") throw new ErroPedido("Não conseguimos confirmar o registro. Tente novamente com os mesmos dados.");
  const salvo = JSON.parse(resultado[1]) as PedidoRegistrado;
  if (salvo.assinaturaEntrada !== assinaturaEntrada) throw new ErroPedido("Esta tentativa já foi usada para outro pedido. Revise seus dados e tente novamente.", 409);
  if (Number(resultado[0]) !== 1 || salvo.recibo.notificacao !== "pendente") return salvo.recibo;

  // A trava não expira: timeout pode ocorrer depois de a Evolution aceitar a mensagem.
  // Retentativas do cliente jamais reenviam; um caso ambíguo exige conferência da equipe.
  try {
    const assumiu = await comando(["EVAL", iniciarNotificacao, 1, chavePedido, new Date().toISOString()]);
    if (Number(assumiu) !== 1) return salvo.recibo;
    const mensagemId = await enviarConfirmacaoPedido(salvo.cliente, salvo.recibo);
    const concluiu = await comando(["EVAL", concluirNotificacao, 1, chavePedido, mensagemId, new Date().toISOString()]);
    if (Number(concluiu) === 1) salvo.recibo.notificacao = "enviada";
  } catch {
    // O pedido já está persistido. Falha de mensagem não desfaz sua confirmação.
    console.warn("Notificação de pedido pendente; consultar painel e provedor antes de reenviar.");
  }
  return salvo.recibo;
}

/** Disponível apenas no servidor e com sessão administrativa válida. */
export async function listarPedidosRecentes(): Promise<PedidoRegistrado[]> {
  if (!await logado()) throw new ErroPedido("Acesso restrito à equipe FAREJA.", 401);
  const ids = await comando(["ZRANGE", `${prefixo}recentes`, 0, 99, "REV"]);
  if (!Array.isArray(ids) || !ids.length) return [];
  const registros = await comando(["MGET", ...ids.map((id) => `${prefixo}pedido:${String(id)}`)]);
  if (!Array.isArray(registros)) throw new ErroPedido("Não foi possível consultar os pedidos.");
  return registros.filter((item): item is string => typeof item === "string").map((item) => JSON.parse(item) as PedidoRegistrado);
}
