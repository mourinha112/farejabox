import type { Metadata } from "next";
import AppTutor from "./AppTutor";

export const metadata: Metadata = {
  title: "App do tutor",
  description: "Acompanhe a caixa do mês e a saúde do seu pet.",
  robots: { index: false },
};

export default function PaginaApp() {
  return (
    <div className="flex flex-1 justify-center bg-linha">
      <div className="w-full max-w-[460px] bg-areia shadow-[0_0_60px_rgba(42,30,23,0.12)]">
        <AppTutor />
      </div>
    </div>
  );
}
