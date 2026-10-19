import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Quiz from "./Quiz";

export const metadata: Metadata = {
  title: "Perfil do pet",
  description:
    "Conte sobre seu pet em 4 etapas e veja uma prévia personalizada antes de deixar seu nome e WhatsApp.",
};

export default async function PaginaQuiz({ searchParams }: PageProps<"/quiz">) {
  const params = await searchParams;
  const pedido = Array.isArray(params.plano) ? params.plano[0] : params.plano;
  if (pedido === "mensal" || pedido === "trimestral") redirect(`/assinar?plano=${pedido}`);

  return (
    <div className="flex flex-1 justify-center bg-linha">
      <main className="w-full max-w-[460px] bg-areia shadow-[0_0_60px_rgba(42,30,23,0.12)]">
        <Quiz />
      </main>
    </div>
  );
}
