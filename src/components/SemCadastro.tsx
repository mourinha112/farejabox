import Link from "next/link";
import { Logo, Pata } from "./brand";

export function Carregando() {
  return (
    <div className="flex min-h-dvh flex-1 items-center justify-center bg-areia" role="status" aria-label="Carregando">
      <Pata size={56} className="animate-pulse text-faro" />
    </div>
  );
}

export function SemCadastro({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-5 bg-areia px-7 text-center">
      <Logo className="text-4xl" />
      <h1 className="font-display text-[28px] leading-tight font-extrabold">{titulo}</h1>
      <p className="max-w-[340px] text-[15px] leading-relaxed text-casca">{texto}</p>
      <Link
        href="/quiz"
        className="flex h-[56px] items-center rounded-full bg-faro px-8 font-display text-lg font-extrabold text-areia hover:bg-faro-escuro"
      >
        Fazer a avaliação gratuita
      </Link>
      <Link href="/" className="text-sm font-bold text-coleira underline">
        Voltar para o site
      </Link>
    </div>
  );
}
