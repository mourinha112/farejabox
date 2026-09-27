"use client";

import { useActionState } from "react";
import { entrar } from "./acoes";

export default function Login() {
  const [erro, acao, enviando] = useActionState(entrar, "");

  return (
    <form action={acao} className="flex flex-col gap-3">
      <label htmlFor="senha" className="text-[13px] font-bold text-casca">
        Senha do painel
      </label>
      <input
        id="senha"
        name="senha"
        type="password"
        autoComplete="current-password"
        required
        className="h-[54px] rounded-[14px] border-2 border-linha bg-white px-4 text-base focus:border-faro focus:outline-none"
      />
      <p role="alert" className="min-h-5 text-[13px] font-bold text-[#b3261e]">
        {erro}
      </p>
      <button
        type="submit"
        disabled={enviando}
        className="h-[56px] rounded-full bg-faro font-display text-lg font-extrabold text-areia hover:bg-faro-escuro disabled:opacity-60"
      >
        {enviando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
