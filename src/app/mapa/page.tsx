import type { Metadata } from "next";
import Mapa from "./Mapa";

export const metadata: Metadata = {
  title: "O Mapa do seu pet",
  description: "Perfil do pet, plano gratuito de 7 dias e sugestão de box conforme suas respostas.",
  robots: { index: false },
};

export default function PaginaMapa() {
  return <Mapa />;
}
