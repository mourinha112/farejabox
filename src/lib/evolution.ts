import "server-only";
import { planos } from "./config";
import { formatarDinheiro, type ClientePedido, type ReciboPedido } from "./pedido";

function configuracao() {
  const base = process.env.EVOLUTION_API_URL?.trim();
  const chave = process.env.EVOLUTION_API_KEY?.trim();
  const instancia = process.env.EVOLUTION_INSTANCE?.trim();
  if (!base || !chave || !instancia) return null;
  try {
    const url = new URL(base);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) return null;
    return { base: url.toString().replace(/\/+$/, ""), chave, instancia };
  } catch { return null; }
}

export function evolutionConfigurada(): boolean { return Boolean(configuracao()); }

/** Evolution v2: POST /message/sendText/{instance}, header apikey, body number/text. */
export async function enviarConfirmacaoPedido(cliente: ClientePedido, pedido: ReciboPedido): Promise<string> {
  const config = configuracao();
  if (!config) throw new Error("Evolution indisponível");
  const resposta = await fetch(`${config.base}/message/sendText/${encodeURIComponent(config.instancia)}`, {
    method: "POST",
    headers: { apikey: config.chave, "Content-Type": "application/json" },
    body: JSON.stringify({
      number: cliente.whatsapp,
      text: `FAREJA 🐾\n\nSeu pedido ${pedido.id} foi registrado com sucesso!\n${planos[pedido.plano].nome} · ${formatarDinheiro(pedido.totalCentavos)}\nFrete grátis.\n\nStatus: aguardando pagamento. Nenhuma cobrança foi realizada. A equipe FAREJA valida a seleção dos suplementos antes da preparação do box.`,
      linkPreview: false,
    }),
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(7000),
  });
  if (!resposta.ok) throw new Error("Não foi possível confirmar a notificação");
  const dado = await resposta.json() as { key?: { id?: unknown }; status?: unknown };
  if (typeof dado.key?.id !== "string" || !dado.key.id || dado.status === "ERROR") throw new Error("Notificação sem confirmação da API");
  // Aceita pela API não significa entregue ou lida no aparelho do cliente.
  return dado.key.id;
}
