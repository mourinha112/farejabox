import type { Metadata } from "next";
import Mapa from "./Mapa";

export const metadata: Metadata = {
  title: "O Mapa do seu pet",
  description: "Diagnóstico de bem-estar, plano gratuito de 7 dias e o box indicado para o seu pet.",
  robots: { index: false },
};

export default function PaginaMapa() {
  return <Mapa />;
}
