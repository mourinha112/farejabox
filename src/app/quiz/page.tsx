import type { Metadata } from "next";
import Quiz from "./Quiz";

export const metadata: Metadata = {
  title: "Avaliação gratuita do seu pet",
  description:
    "Responda 5 passos em 2 minutos e descubra o índice de bem-estar do seu pet, um plano gratuito de 7 dias e o box ideal para ele.",
};

export default function PaginaQuiz() {
  return (
    <div className="flex flex-1 justify-center bg-linha">
      <main className="w-full max-w-[460px] bg-areia shadow-[0_0_60px_rgba(42,30,23,0.12)]">
        <Quiz />
      </main>
    </div>
  );
}
