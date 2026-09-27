// Recebe o lead do quiz: grava no banco do funil (se conectado) e encaminha
// para LEAD_WEBHOOK_URL (CRM, planilha, n8n, Make...) quando configurado.

import { bancoConfigurado, registrarLead } from "@/lib/banco";

type Corpo = {
  respostas?: Record<string, unknown>;
  plano?: unknown;
  indice?: unknown;
  suplemento?: unknown;
};

function texto(valor: unknown, limite: number): string {
  return typeof valor === "string" ? valor.trim().slice(0, limite) : "";
}

export async function POST(request: Request) {
  let corpo: Corpo;
  try {
    corpo = await request.json();
  } catch {
    return Response.json({ ok: false, erro: "JSON inválido" }, { status: 400 });
  }

  const r = corpo?.respostas ?? {};
  const whatsapp = texto(r.whatsapp, 20).replace(/\D/g, "");
  const tutor = texto(r.tutor, 40);
  const nomePet = texto(r.nomePet, 24);
  if (!tutor || !nomePet || whatsapp.length < 10 || whatsapp.length > 11) {
    return Response.json({ ok: false, erro: "Dados incompletos" }, { status: 400 });
  }

  let salvo = false;
  if (bancoConfigurado) {
    try {
      await registrarLead({
        whatsapp,
        tutor,
        nomePet,
        especie: texto(r.especie, 12),
        foco: texto(r.foco, 16),
        indice: Math.max(0, Math.min(100, Number(corpo.indice) || 0)),
        suplemento: texto(corpo.suplemento, 40),
        plano: corpo.plano === "mensal" ? "mensal" : "trimestral",
        criadoEm: new Date().toISOString(),
      });
      salvo = true;
    } catch (erro) {
      console.error("Falha ao gravar lead", erro);
    }
  }

  let encaminhado = false;
  const destino = process.env.LEAD_WEBHOOK_URL;
  if (destino) {
    try {
      const resposta = await fetch(destino, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...corpo, origem: "quiz", recebidoEm: new Date().toISOString() }),
        signal: AbortSignal.timeout(8000),
      });
      encaminhado = resposta.ok;
    } catch (erro) {
      console.error("Falha ao encaminhar lead", erro);
    }
  }

  return Response.json({ ok: true, salvo, encaminhado });
}
