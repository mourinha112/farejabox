import "server-only";

// Funil do quiz no Upstash Redis (REST). As variáveis são injetadas pela Vercel
// quando o banco é conectado ao projeto na aba Storage.

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const bancoConfigurado = Boolean(url && token);

export type Evento = "inicio" | "previa" | "concluido" | "interesse";

export type Lead = {
  whatsapp: string;
  tutor: string;
  nomePet: string;
  especie: string;
  foco: string;
  indice: number;
  suplemento: string;
  plano: string;
  criadoEm: string;
  interesseEm?: string;
  interessePlano?: string;
  interesseOrigem?: string;
};

export type Resumo = {
  inicios: number;
  previas: number;
  previasPorOrigem: { quiz: number; assinatura: number };
  leads: number;
  interessados: number;
  dias: { dia: string; inicio: number; previa: number; concluido: number; interesse: number }[];
  ultimos: Lead[];
};

type Comando = (string | number)[];

async function pipeline(comandos: Comando[]): Promise<unknown[]> {
  if (!url || !token) throw new Error("Banco não configurado");
  const resposta = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(comandos),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!resposta.ok) throw new Error(`Banco respondeu ${resposta.status}`);
  const itens = (await resposta.json()) as { result?: unknown; error?: string }[];
  return itens.map((item) => {
    if (item.error) throw new Error(item.error);
    return item.result;
  });
}

function diaEmBrasilia(data: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(data);
}

function contar(evento: Evento): Comando[] {
  const chaveDia = `dia:${diaEmBrasilia(new Date())}:${evento}`;
  return [
    ["INCR", `total:${evento}`],
    ["INCR", chaveDia],
    ["EXPIRE", chaveDia, 60 * 60 * 24 * 120],
  ];
}

export async function registrarInicio(): Promise<void> {
  await pipeline(contar("inicio"));
}

export async function registrarPrevia(origem: "quiz" | "assinatura"): Promise<void> {
  await pipeline([...contar("previa"), ["INCR", `total:previa:${origem}`]]);
}

export async function registrarLead(lead: Lead): Promise<void> {
  await pipeline([
    ...contar("concluido"),
    ["SET", `lead:${lead.whatsapp}`, JSON.stringify(lead)],
    ["ZADD", "leads", Date.now(), lead.whatsapp],
  ]);
}

export async function registrarInteresse(whatsapp: string, plano: string, origem: string): Promise<void> {
  const [bruto] = await pipeline([["GET", `lead:${whatsapp}`]]);
  const agora = new Date().toISOString();
  const comandos: Comando[] = [...contar("interesse"), ["SADD", "interessados", whatsapp]];

  if (typeof bruto === "string") {
    const lead = JSON.parse(bruto) as Lead;
    comandos.push([
      "SET",
      `lead:${whatsapp}`,
      JSON.stringify({ ...lead, interesseEm: agora, interessePlano: plano, interesseOrigem: origem }),
    ]);
  }
  await pipeline(comandos);
}

export async function lerResumo(): Promise<Resumo> {
  const dias = Array.from({ length: 14 }, (_, i) => diaEmBrasilia(new Date(Date.now() - i * 86_400_000)));
  const eventos: Evento[] = ["inicio", "previa", "concluido", "interesse"];

  const [inicios, previas, previasQuiz, previasAssinatura, leads, interessados, membros, ...porDia] = await pipeline([
    ["GET", "total:inicio"],
    ["GET", "total:previa"],
    ["GET", "total:previa:quiz"],
    ["GET", "total:previa:assinatura"],
    ["ZCARD", "leads"],
    ["SCARD", "interessados"],
    ["ZRANGE", "leads", 0, 199, "REV"],
    ...dias.flatMap((dia) => eventos.map((evento): Comando => ["GET", `dia:${dia}:${evento}`])),
  ]);

  const whatsapps = Array.isArray(membros) ? (membros as string[]) : [];
  const brutos = whatsapps.length > 0 ? await pipeline([["MGET", ...whatsapps.map((w) => `lead:${w}`)]]) : [[]];
  const ultimos = (brutos[0] as (string | null)[])
    .filter((item): item is string => typeof item === "string")
    .map((item) => JSON.parse(item) as Lead);

  return {
    inicios: Number(inicios ?? 0),
    previas: Number(previas ?? 0),
    previasPorOrigem: { quiz: Number(previasQuiz ?? 0), assinatura: Number(previasAssinatura ?? 0) },
    leads: Number(leads ?? 0),
    interessados: Number(interessados ?? 0),
    dias: dias.map((dia, i) => ({
      dia,
      inicio: Number(porDia[i * eventos.length] ?? 0),
      previa: Number(porDia[i * eventos.length + 1] ?? 0),
      concluido: Number(porDia[i * eventos.length + 2] ?? 0),
      interesse: Number(porDia[i * eventos.length + 3] ?? 0),
    })),
    ultimos,
  };
}
