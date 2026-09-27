import type { PlanoId } from "./config";

// Disparos do funil a partir do navegador. Falha de rede nunca trava a tela.

function enviar(corpo: object): void {
  fetch("/api/evento", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
    keepalive: true,
  }).catch(() => {});
}

export function avisarInicio(): void {
  enviar({ tipo: "inicio" });
}

export function avisarInteresse(whatsapp: string, plano: PlanoId, origem: "resultado" | "mapa" | "app"): void {
  enviar({ tipo: "interesse", whatsapp, plano, origem });
}
