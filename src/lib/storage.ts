"use client";

// Dados do tutor ficam no aparelho (localStorage). O link de acesso carrega
// perfil + assinatura dentro da própria URL, então funciona em qualquer aparelho.

import { useMemo, useSyncExternalStore } from "react";
import type { PlanoId } from "./config";
import type { Pilares, Respostas } from "./diagnostico";

export type StatusCaixa = "preparando" | "postado" | "transito" | "entregue";

export type Assinatura = {
  plano: PlanoId;
  status: StatusCaixa;
  mes: string;
  rastreio?: string;
  previsao?: string;
  itens: string[];
};

export type Checkin = { data: string; pilares: Pilares };

export type Dados = {
  respostas: Respostas;
  criadoEm: string;
  planoInteresse?: PlanoId;
  assinatura?: Assinatura;
  checkins: Checkin[];
  doses: string[];
  plano7: boolean[];
};

export type Acesso = { v: 1; respostas: Respostas; assinatura?: Assinatura };

const CHAVE = "fareja:v1";
const EVENTO = "fareja:dados";
const SSR = "__ssr__";

function lerBruto(): string | null {
  try {
    return window.localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

function interpretar(bruto: string | null): Dados | null {
  if (!bruto) return null;
  try {
    const dados = JSON.parse(bruto) as Dados;
    if (!dados?.respostas?.nomePet) return null;
    return {
      ...dados,
      checkins: dados.checkins ?? [],
      doses: dados.doses ?? [],
      plano7: dados.plano7 ?? Array(7).fill(false),
    };
  } catch {
    return null;
  }
}

export function lerDados(): Dados | null {
  return interpretar(lerBruto());
}

export function salvarDados(dados: Dados): void {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(dados));
  } catch {
    // Navegação privada ou armazenamento cheio: a tela segue funcionando na sessão.
  }
  window.dispatchEvent(new Event(EVENTO));
}

export function atualizarDados(mudar: (atual: Dados) => Dados): void {
  const atual = lerDados();
  if (atual) salvarDados(mudar(atual));
}

export function limparDados(): void {
  try {
    window.localStorage.removeItem(CHAVE);
  } catch {
    // sem armazenamento disponível
  }
  window.dispatchEvent(new Event(EVENTO));
}

function assinar(avisar: () => void): () => void {
  window.addEventListener(EVENTO, avisar);
  window.addEventListener("storage", avisar);
  return () => {
    window.removeEventListener(EVENTO, avisar);
    window.removeEventListener("storage", avisar);
  };
}

export function useDados(): { carregado: boolean; dados: Dados | null } {
  const bruto = useSyncExternalStore(assinar, lerBruto, () => SSR);
  return useMemo(
    () => ({ carregado: bruto !== SSR, dados: bruto === SSR ? null : interpretar(bruto) }),
    [bruto],
  );
}

export function novoCadastro(respostas: Respostas, planoInteresse?: PlanoId): Dados {
  return {
    respostas,
    criadoEm: new Date().toISOString(),
    planoInteresse,
    checkins: [],
    doses: [],
    plano7: Array(7).fill(false),
  };
}

function paraBase64Url(texto: string): string {
  const bytes = new TextEncoder().encode(texto);
  let binario = "";
  bytes.forEach((b) => (binario += String.fromCharCode(b)));
  return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function deBase64Url(codigo: string): string {
  const base64 = codigo.replace(/-/g, "+").replace(/_/g, "/");
  const binario = atob(base64);
  const bytes = Uint8Array.from(binario, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function codificarAcesso(acesso: Acesso): string {
  return paraBase64Url(JSON.stringify(acesso));
}

export function decodificarAcesso(codigo: string): Acesso | null {
  try {
    const acesso = JSON.parse(deBase64Url(codigo)) as Acesso;
    if (acesso?.v !== 1 || !acesso.respostas?.nomePet || !acesso.respostas?.especie) return null;
    return acesso;
  } catch {
    return null;
  }
}

export function linkDeAcesso(origem: string, acesso: Acesso): string {
  return `${origem}/app#acesso=${codificarAcesso(acesso)}`;
}

// Entra com o link: mantém o histórico do aparelho quando é o mesmo pet do mesmo tutor.
export function importarAcesso(acesso: Acesso): void {
  const atual = lerDados();
  const mesmoPet =
    atual &&
    atual.respostas.nomePet.toLowerCase() === acesso.respostas.nomePet.toLowerCase() &&
    atual.respostas.whatsapp.replace(/\D/g, "") === acesso.respostas.whatsapp.replace(/\D/g, "");

  const base = mesmoPet && atual ? atual : novoCadastro(acesso.respostas);
  salvarDados({
    ...base,
    respostas: acesso.respostas,
    assinatura: acesso.assinatura ?? base.assinatura,
  });
}

export function hoje(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}
