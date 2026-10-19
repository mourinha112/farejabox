"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { PlanoId } from "./config";
import type { Respostas } from "./diagnostico";

type PerfilCheckout = { respostas: Respostas; plano: PlanoId };
const CHAVE = "fareja:checkout:perfil";
const EVENTO = "fareja:checkout:perfil-atualizado";
const SSR = "__ssr__";

function lerBruto(): string | null {
  try { return window.sessionStorage.getItem(CHAVE); } catch { return null; }
}

export function salvarPerfilCheckout(respostas: Respostas, plano: PlanoId): boolean {
  try {
    window.sessionStorage.setItem(CHAVE, JSON.stringify({ respostas, plano }));
    window.dispatchEvent(new Event(EVENTO));
    return true;
  } catch { return false; }
}

function assinar(avisar: () => void) {
  window.addEventListener(EVENTO, avisar);
  window.addEventListener("storage", avisar);
  return () => {
    window.removeEventListener(EVENTO, avisar);
    window.removeEventListener("storage", avisar);
  };
}

export function usePerfilCheckout(): { carregado: boolean; perfil: PerfilCheckout | null } {
  const bruto = useSyncExternalStore(assinar, lerBruto, () => SSR);
  return useMemo(() => {
    if (bruto === SSR) return { carregado: false, perfil: null };
    try {
      const perfil: PerfilCheckout | null = bruto ? JSON.parse(bruto) : null;
      if (!perfil?.respostas?.nomePet || !["cachorro", "gato"].includes(perfil.respostas.especie) || !["mensal", "trimestral"].includes(perfil.plano)) {
        return { carregado: true, perfil: null };
      }
      return { carregado: true, perfil };
    } catch { return { carregado: true, perfil: null }; }
  }, [bruto]);
}
