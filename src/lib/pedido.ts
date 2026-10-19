import type { PlanoId } from "./config";
import type { Respostas } from "./diagnostico";

export type ClientePedido = { nome: string; email: string; whatsapp: string };
export type EnderecoPedido = { cep: string; logradouro: string; numero: string; complemento: string; bairro: string; cidade: string; uf: string };
export type MetodoPagamento = "pix" | "cartao";
export type CriarPedidoEntrada = {
  chaveIdempotencia: string;
  plano: PlanoId;
  respostas: Respostas;
  cliente: ClientePedido;
  endereco: EnderecoPedido;
  metodoPagamento: MetodoPagamento;
  notificarWhatsApp: boolean;
};
export type ReciboPedido = {
  id: string;
  criadoEm: string;
  plano: PlanoId;
  subtotalCentavos: number;
  freteCentavos: number;
  totalCentavos: number;
  status: "aguardando_pagamento";
  pagamento: { status: "aguardando_integracao"; metodo: MetodoPagamento };
  notificacao: "enviada" | "pendente" | "nao_solicitada" | "nao_configurada";
};

const ddds = new Set("11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99".split(" "));
export const estadosBrasil = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");

export function formatarDinheiro(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(centavos / 100);
}

/** Retorna telefone brasileiro com DDI, ou vazio quando inválido. */
export function normalizarWhatsApp(valor: string): string {
  let numero = valor.replace(/\D/g, "");
  if ((numero.length === 12 || numero.length === 13) && numero.startsWith("55")) numero = numero.slice(2);
  if (!ddds.has(numero.slice(0, 2))) return "";
  if (!/^\d{2}(?:9\d{8}|[2-5]\d{7})$/.test(numero)) return "";
  if (/^(\d)\1+$/.test(numero.slice(2))) return "";
  return `55${numero}`;
}

function objeto(valor: unknown): Record<string, unknown> {
  return valor !== null && typeof valor === "object" && !Array.isArray(valor) ? valor as Record<string, unknown> : {};
}

function texto(valor: unknown, minimo: number, maximo: number): string {
  if (typeof valor !== "string") return "";
  const limpo = valor.trim().replace(/\s+/g, " ");
  return limpo.length >= minimo && limpo.length <= maximo && !/[\u0000-\u001f\u007f<>]/.test(limpo) ? limpo : "";
}

export function validarPedido(entrada: unknown): { ok: true; valor: CriarPedidoEntrada } | { ok: false; erro: string } {
  const e = objeto(entrada);
  const falha = (erro: string): { ok: false; erro: string } => ({ ok: false, erro });
  if (typeof e.chaveIdempotencia !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(e.chaveIdempotencia)) return falha("Atualize a página e tente confirmar seu pedido novamente.");
  if (e.plano !== "mensal" && e.plano !== "trimestral") return falha("Escolha um dos planos disponíveis.");
  if (e.metodoPagamento !== "pix" && e.metodoPagamento !== "cartao") return falha("Escolha sua preferência de pagamento.");
  if (typeof e.notificarWhatsApp !== "boolean") return falha("Informe sua preferência de atualizações pelo WhatsApp.");

  const c = objeto(e.cliente);
  const nome = texto(c.nome, 2, 80);
  const email = texto(c.email, 5, 254).toLowerCase();
  const whatsapp = typeof c.whatsapp === "string" && c.whatsapp.length <= 24 ? normalizarWhatsApp(c.whatsapp) : "";
  if (!nome || !/\p{L}/u.test(nome)) return falha("Informe seu nome para identificarmos o pedido.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return falha("Confira seu e-mail.");
  if (!whatsapp) return falha("Confira seu WhatsApp com DDD.");

  const a = objeto(e.endereco);
  const cep = typeof a.cep === "string" && /^[\d -]{8,10}$/.test(a.cep) ? a.cep.replace(/\D/g, "") : "";
  const endereco: EnderecoPedido = {
    cep, logradouro: texto(a.logradouro, 3, 120), numero: texto(a.numero, 1, 16),
    complemento: texto(a.complemento, 0, 100), bairro: texto(a.bairro, 2, 80), cidade: texto(a.cidade, 2, 80), uf: texto(a.uf, 2, 2).toUpperCase(),
  };
  if (!/^\d{8}$/.test(cep) || /^(\d)\1{7}$/.test(cep)) return falha("Confira o CEP de entrega.");
  if (!endereco.logradouro || !endereco.numero || !endereco.bairro || !endereco.cidade || !estadosBrasil.includes(endereco.uf)) return falha("Complete o endereço de entrega, incluindo número, bairro, cidade e estado.");
  if (typeof a.complemento !== "string" || a.complemento.length > 100 || (a.complemento.trim() && !endereco.complemento)) return falha("Confira o complemento do endereço.");

  const r = objeto(e.respostas);
  const nomePet = texto(r.nomePet, 1, 40);
  const opcoes = {
    especie: ["cachorro", "gato"], porte: ["pequeno", "medio", "grande", "gigante"], fase: ["filhote", "adulto", "senior"],
    foco: ["pelagem", "ansiedade", "articulacao", "digestao", "bucal", "mimar"], frequencia: ["as-vezes", "toda-semana", "todo-dia"],
    alimentacao: ["racao", "mista", "natural", "caseira"], atividade: ["baixa", "media", "alta"], mastigacao: ["roedor", "moderado", "delicado"],
  };
  if (!nomePet || Object.entries(opcoes).some(([campo, valores]) => typeof r[campo] !== "string" || !valores.includes(r[campo] as string))) return falha("Complete o perfil do pet antes de confirmar o pedido.");
  const respostas = Object.fromEntries(Object.keys(opcoes).map((campo) => [campo, r[campo]])) as Omit<Respostas, "nomePet" | "tutor" | "whatsapp">;
  return { ok: true, valor: {
    chaveIdempotencia: e.chaveIdempotencia.toLowerCase(), plano: e.plano,
    respostas: { ...respostas, nomePet, tutor: nome, whatsapp: whatsapp.slice(2) },
    cliente: { nome, email, whatsapp }, endereco, metodoPagamento: e.metodoPagamento, notificarWhatsApp: e.notificarWhatsApp,
  } };
}
