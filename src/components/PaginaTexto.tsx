import Link from "next/link";
import { LogoLink } from "./brand";

export function PaginaTexto({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-5 py-10">
      <LogoLink className="text-[34px]" />
      <h1 className="font-display text-[34px] leading-tight font-extrabold">{titulo}</h1>
      <div className="flex flex-col gap-4 text-[15.5px] leading-relaxed text-casca [&_h2]:mt-3 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-focinho [&_strong]:text-focinho">
        {children}
      </div>
      <Link href="/" className="text-sm font-bold text-coleira underline">
        Voltar para o site
      </Link>
    </main>
  );
}
