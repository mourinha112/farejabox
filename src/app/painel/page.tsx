import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logado } from "@/lib/sessao";
import Painel from "./Painel";

// Sessão e números são lidos a cada visita.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Painel · gerar acesso",
  robots: { index: false, follow: false },
};

export default async function PaginaPainel() {
  if (!(await logado())) redirect("/admin");

  return (
    <>
      <p className="mx-auto w-full max-w-[760px] px-5 pt-6">
        <Link href="/admin" className="text-sm font-bold text-coleira underline">
          ← Voltar ao funil
        </Link>
      </p>
      <Painel />
    </>
  );
}
