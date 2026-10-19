import type { Metadata } from "next";
import type { PlanoId } from "@/lib/config";
import Checkout from "./Checkout";

export const metadata: Metadata = {
  title: "Seu pedido",
  description: "Revise o box do seu pet, escolha seu plano e informe a entrega em poucos passos.",
  robots: { index: false, follow: false },
};

export default async function PaginaCheckout({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const solicitado = Array.isArray(params.plano) ? params.plano[0] : params.plano;
  const plano: PlanoId | undefined = solicitado === "mensal" || solicitado === "trimestral" ? solicitado : undefined;

  return <Checkout key={`${plano ?? "salvo"}-${params.perfil === "novo"}`} planoInicial={plano} perfilNovo={params.perfil === "novo"} />;
}
