import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand";
import { bancoConfigurado, lerResumo, type Resumo } from "@/lib/banco";
import { logado, senhaConfigurada } from "@/lib/sessao";
import { mascaraWhatsApp } from "@/lib/whatsapp";
import { sair } from "./acoes";
import Login from "./Login";

// Sessão e números são lidos a cada visita.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Painel",
  robots: { index: false, follow: false },
};

const nomesFoco: Record<string, string> = {
  pelagem: "Pelagem",
  ansiedade: "Ansiedade",
  articulacao: "Articulações",
  digestao: "Digestão",
  bucal: "Hálito e dentes",
  mimar: "Só mimar",
};

function Moldura({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center gap-5 px-6 py-12">
      <div>
        <Logo className="text-[40px]" />
        <p className="text-[11px] font-bold tracking-[0.26em] text-coleira">PAINEL</p>
      </div>
      {children}
    </main>
  );
}

function dataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function diaCurto(dia: string): string {
  const [, m, d] = dia.split("-");
  return `${d}/${m}`;
}

export default async function Admin() {
  if (!senhaConfigurada) {
    return (
      <Moldura>
        <h1 className="font-display text-[26px] leading-tight font-extrabold">Falta definir a senha</h1>
        <p className="text-[15px] leading-relaxed text-casca">
          Na Vercel, abra Settings → Environment Variables, crie <strong>ADMIN_PASSWORD</strong> com pelo menos 8
          caracteres e faça um novo deploy.
        </p>
      </Moldura>
    );
  }

  if (!(await logado())) {
    return (
      <Moldura>
        <h1 className="font-display text-[26px] leading-tight font-extrabold">Entrar no painel</h1>
        <Login />
      </Moldura>
    );
  }

  let resumo: Resumo | null = null;
  let falha = "";
  if (bancoConfigurado) {
    try {
      resumo = await lerResumo();
    } catch (erro) {
      console.error("Falha ao ler o funil", erro);
      falha = "Não foi possível ler o banco agora. Tente recarregar.";
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-col gap-7 px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Logo className="text-[30px]" />
          <h1 className="font-display text-[26px] leading-tight font-extrabold">Funil do perfil do pet</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/painel"
            className="flex h-11 items-center rounded-full bg-coleira px-5 font-display text-[15px] font-bold text-areia"
          >
            Gerar acesso do tutor
          </Link>
          <form action={sair}>
            <button type="submit" className="h-11 rounded-full border-2 border-linha px-5 text-sm font-bold text-casca">
              Sair
            </button>
          </form>
        </div>
      </header>

      {!bancoConfigurado && (
        <section className="rounded-[18px] border-2 border-petisco bg-petisco-suave p-6">
          <h2 className="font-display text-xl font-extrabold">Falta conectar o banco</h2>
          <ol className="mt-2 flex list-decimal flex-col gap-1 pl-5 text-[15px] leading-relaxed text-casca">
            <li>Na Vercel, abra o projeto e vá em Storage.</li>
            <li>Crie um banco Upstash Redis e conecte ao projeto.</li>
            <li>Faça um novo deploy. Os números começam a contar a partir daí.</li>
          </ol>
        </section>
      )}

      {falha && <p className="rounded-[14px] border-2 border-[#b3261e] p-4 text-sm font-bold text-[#b3261e]">{falha}</p>}

      {resumo && (
        <>
          <section aria-label="Totais" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[18px] border-2 border-linha bg-white p-6">
              <p className="text-[11px] font-bold tracking-[0.2em] text-mel">INÍCIOS REGISTRADOS</p>
              <p className="mt-1 font-display text-[48px] leading-none font-extrabold">{resumo.inicios}</p>
              <p className="mt-2 text-[13px] text-casca">eventos de avanço do primeiro passo</p>
            </div>
            <div className="rounded-[18px] border-2 border-linha bg-white p-6">
              <p className="text-[11px] font-bold tracking-[0.2em] text-mel">PRÉVIAS EXIBIDAS</p>
              <p className="mt-1 font-display text-[48px] leading-none font-extrabold">{resumo.previas}</p>
              <p className="mt-2 text-[13px] text-casca">
                eventos sem dados de contato · {resumo.previasPorOrigem.quiz} pelo quiz · {resumo.previasPorOrigem.assinatura} pela assinatura
              </p>
            </div>
            <div className="fundo-escuro rounded-[18px] bg-coleira p-6 text-areia">
              <p className="text-[11px] font-bold tracking-[0.2em] text-menta">CONTATOS RECEBIDOS</p>
              <p className="mt-1 font-display text-[48px] leading-none font-extrabold">{resumo.leads}</p>
              <p className="mt-2 text-[13px] text-menta">
                contatos únicos por WhatsApp
              </p>
            </div>
            <div className="fundo-escuro rounded-[18px] bg-faro p-6 text-areia">
              <p className="text-[11px] font-bold tracking-[0.2em] text-faro-claro">QUISERAM O BOX</p>
              <p className="mt-1 font-display text-[48px] leading-none font-extrabold">{resumo.interessados}</p>
              <p className="mt-2 text-[13px] text-faro-suave">
                contatos únicos que clicaram para continuar com o box
              </p>
            </div>
          </section>

          <section className="rounded-[18px] border-2 border-linha bg-white p-6">
            <h2 className="text-[11px] font-bold tracking-[0.2em] text-mel">ÚLTIMOS 14 DIAS</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="text-[12px] text-casca">
                  <tr>
                    <th className="py-2 font-bold">Dia</th>
                    <th className="py-2 text-right font-bold">Inícios</th>
                    <th className="py-2 text-right font-bold">Prévias</th>
                    <th className="py-2 text-right font-bold">Contatos enviados</th>
                    <th className="py-2 text-right font-bold">Cliques no box</th>
                  </tr>
                </thead>
                <tbody>
                  {resumo.dias.map((dia) => (
                    <tr key={dia.dia} className="border-t border-linha">
                      <td className="py-2 font-semibold">{diaCurto(dia.dia)}</td>
                      <td className="py-2 text-right tabular-nums">{dia.inicio}</td>
                      <td className="py-2 text-right tabular-nums">{dia.previa}</td>
                      <td className="py-2 text-right tabular-nums">{dia.concluido}</td>
                      <td className="py-2 text-right font-bold tabular-nums">{dia.interesse}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-casca">
              A tabela conta eventos, que podem se repetir. Nos totais, apenas contatos e interessados são únicos por WhatsApp.
              As prévias começaram a ser contadas com o novo fluxo; contatos anteriores continuam no histórico.
              Sem vincular a prévia anônima ao contato, esses números não representam uma taxa de conversão.
            </p>
          </section>

          <section className="rounded-[18px] border-2 border-linha bg-white p-6">
            <h2 className="text-[11px] font-bold tracking-[0.2em] text-mel">
              LEADS ({resumo.ultimos.length} mais recentes)
            </h2>
            {resumo.ultimos.length === 0 ? (
              <p className="mt-3 text-[15px] text-casca">Ninguém concluiu o quiz ainda.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="text-[12px] text-casca">
                    <tr>
                      <th className="py-2 font-bold">Quando</th>
                      <th className="py-2 font-bold">Tutor</th>
                      <th className="py-2 font-bold">Pet</th>
                      <th className="py-2 font-bold">Foco</th>
                      <th className="py-2 text-right font-bold">Índice</th>
                      <th className="py-2 font-bold">Interesse</th>
                      <th className="py-2 font-bold">WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumo.ultimos.map((lead) => (
                      <tr key={lead.whatsapp} className="border-t border-linha align-top">
                        <td className="py-2.5 whitespace-nowrap text-casca">{dataHora(lead.criadoEm)}</td>
                        <td className="py-2.5 font-bold">{lead.tutor}</td>
                        <td className="py-2.5">
                          {lead.nomePet} <span className="text-casca">({lead.especie})</span>
                        </td>
                        <td className="py-2.5">{nomesFoco[lead.foco] ?? lead.foco}</td>
                        <td className="py-2.5 text-right tabular-nums">{lead.indice}</td>
                        <td className="py-2.5">
                          {lead.interesseEm ? (
                            <span className="inline-block rounded-full bg-petisco px-2.5 py-1 text-[11px] font-bold whitespace-nowrap">
                              Quis o {lead.interessePlano} · {dataHora(lead.interesseEm)}
                            </span>
                          ) : (
                            <span className="text-casca">Só o resultado</span>
                          )}
                        </td>
                        <td className="py-2.5 whitespace-nowrap">
                          <a
                            href={`https://wa.me/55${lead.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-coleira underline"
                          >
                            {mascaraWhatsApp(lead.whatsapp)}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
