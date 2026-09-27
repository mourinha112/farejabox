import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "fareja_admin";
const senha = process.env.ADMIN_PASSWORD ?? "";

export const senhaConfigurada = senha.length >= 8;

function assinatura(): string {
  return createHmac("sha256", senha).update("fareja-admin-v1").digest("hex");
}

function iguais(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function senhaCorreta(tentativa: string): boolean {
  return senhaConfigurada && iguais(tentativa, senha);
}

export async function abrirSessao(): Promise<void> {
  const jarro = await cookies();
  jarro.set(COOKIE, assinatura(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function fecharSessao(): Promise<void> {
  const jarro = await cookies();
  jarro.delete(COOKIE);
}

export async function logado(): Promise<boolean> {
  if (!senhaConfigurada) return false;
  const jarro = await cookies();
  const valor = jarro.get(COOKIE)?.value;
  return Boolean(valor) && iguais(valor!, assinatura());
}
