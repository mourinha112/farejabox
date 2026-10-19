// Eventos do funil: início, prévia sem contato e interesse no box.

import { bancoConfigurado, registrarInicio, registrarInteresse, registrarPrevia } from "@/lib/banco";

const origens = ["resultado", "mapa", "app"];

export async function POST(request: Request) {
  let corpo: { tipo?: unknown; whatsapp?: unknown; plano?: unknown; origem?: unknown };
  try {
    corpo = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  if (!corpo || typeof corpo !== "object") return Response.json({ ok: false }, { status: 400 });
  if (corpo.tipo === "previa" && corpo.origem !== "quiz" && corpo.origem !== "assinatura") {
    return Response.json({ ok: false }, { status: 400 });
  }
  if (!bancoConfigurado) return Response.json({ ok: true, salvo: false });

  try {
    if (corpo.tipo === "inicio") {
      await registrarInicio();
      return Response.json({ ok: true, salvo: true });
    }
    if (corpo.tipo === "previa" && (corpo.origem === "quiz" || corpo.origem === "assinatura")) {
      await registrarPrevia(corpo.origem);
      return Response.json({ ok: true, salvo: true });
    }
    if (corpo.tipo === "interesse") {
      const whatsapp = typeof corpo.whatsapp === "string" ? corpo.whatsapp.replace(/\D/g, "") : "";
      if (whatsapp.length < 10 || whatsapp.length > 11) return Response.json({ ok: false }, { status: 400 });
      const plano = corpo.plano === "mensal" ? "mensal" : "trimestral";
      const origem = origens.includes(corpo.origem as string) ? (corpo.origem as string) : "resultado";
      await registrarInteresse(whatsapp, plano, origem);
      return Response.json({ ok: true, salvo: true });
    }
  } catch (erro) {
    console.error("Falha ao gravar evento", erro);
    return Response.json({ ok: false }, { status: 502 });
  }
  return Response.json({ ok: false }, { status: 400 });
}
