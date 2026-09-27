"use server";

import { redirect } from "next/navigation";
import { abrirSessao, fecharSessao, senhaCorreta } from "@/lib/sessao";

export async function entrar(_anterior: string, formulario: FormData): Promise<string> {
  const senha = formulario.get("senha");
  if (typeof senha !== "string" || !senhaCorreta(senha)) {
    // Atraso fixo para desencorajar tentativa em massa.
    await new Promise((resolver) => setTimeout(resolver, 800));
    return "Senha incorreta.";
  }
  await abrirSessao();
  redirect("/admin");
}

export async function sair(): Promise<void> {
  await fecharSessao();
  redirect("/admin");
}
