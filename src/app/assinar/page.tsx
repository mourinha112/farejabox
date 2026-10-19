import type { Metadata } from "next";
import type { PlanoId } from "@/lib/config";
import Quiz from "../quiz/Quiz";

export const metadata: Metadata = {
  title: "Personalizar minha assinatura",
  description: "Escolha seu plano, personalize o box pelo perfil do pet e conclua seu pedido no checkout da FAREJA.",
};

export default async function PaginaAssinar({ searchParams }: PageProps<"/assinar">) {
  const params = await searchParams;
  const pedido = Array.isArray(params.plano) ? params.plano[0] : params.plano;
  const plano: PlanoId = pedido === "trimestral" ? "trimestral" : "mensal";

  return (
    <div className="flex flex-1 justify-center bg-linha">
      <main className="w-full max-w-[460px] bg-areia shadow-[0_0_60px_rgba(42,30,23,0.12)]">
        <Quiz key={plano} planoInicial={plano} />
      </main>
    </div>
  );
}
