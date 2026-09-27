"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { IconeWhatsApp, LogoLink, Pata } from "@/components/brand";
import { planos, site, type PlanoId } from "@/lib/config";
import {
  diagnosticar,
  faseLabel,
  focoLabel,
  porteLabel,
  suplementos,
  type Alimentacao,
  type Atividade,
  type Especie,
  type Fase,
  type Foco,
  type Frequencia,
  type Mastigacao,
  type Porte,
  type Respostas,
} from "@/lib/diagnostico";
import { avisarInicio, avisarInteresse } from "@/lib/funil";
import { linkDeAcesso, novoCadastro, salvarDados } from "@/lib/storage";
import { linkWhatsApp, mascaraWhatsApp, mensagemPedido, mensagemResultado, whatsappValido } from "@/lib/whatsapp";

type Rascunho = Partial<Respostas>;
const TOTAL = 5;

const focos: { id: Foco; icone: React.ReactNode }[] = [
  {
    id: "pelagem",
    icone: <path d="M6 24 C 6 14, 10 8, 15 6 C 20 8, 24 14, 24 24 M10 18 L 6 15 M20 18 L 24 15 M12 12 L 9 9 M18 12 L 21 9" />,
  },
  {
    id: "ansiedade",
    icone: (
      <path d="M15 4 C 9 4, 5 9, 5 14 C 5 21, 11 26, 15 26 C 19 26, 25 21, 25 14 C 25 9, 21 4, 15 4 Z M11 13 Q 12.5 11.5 14 13 M16 13 Q 17.5 11.5 19 13 M11 19 Q 15 16.5 19 19" />
    ),
  },
  {
    id: "articulacao",
    icone: <path d="M8 4 L 8 12 C 8 16, 11 18, 14 18 L 14 26 M22 4 L 22 10 C 22 15, 18 16, 14 18" strokeLinejoin="round" />,
  },
  {
    id: "digestao",
    icone: (
      <>
        <ellipse cx="15" cy="15" rx="10" ry="11" />
        <path d="M10 15 C 12 12, 14 18, 16 15 C 18 12, 20 18, 21 15" />
      </>
    ),
  },
  {
    id: "bucal",
    icone: (
      <>
        <path d="M6 20 Q 15 8 24 20 M9 20 Q 15 12.5 21 20" />
        <circle cx="15" cy="22" r="2" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    id: "mimar",
    icone: (
      <path
        d="M15 26 C 8 20, 3 15, 5 9.5 C 6.6 5, 12 4.5, 15 9 C 18 4.5, 23.4 5, 25 9.5 C 27 15, 22 20, 15 26 Z"
        strokeLinejoin="round"
      />
    ),
  },
];

const frequencias: { id: Frequencia; nome: string }[] = [
  { id: "as-vezes", nome: "Às vezes" },
  { id: "toda-semana", nome: "Toda semana" },
  { id: "todo-dia", nome: "Todo dia" },
];

const alimentacoes: { id: Alimentacao; nome: string }[] = [
  { id: "racao", nome: "Só ração" },
  { id: "mista", nome: "Ração + petiscos" },
  { id: "natural", nome: "Alimentação natural" },
  { id: "caseira", nome: "Comida caseira" },
];

const mastigacoes: { id: Mastigacao; nome: string }[] = [
  { id: "roedor", nome: "Roedor entusiasmado" },
  { id: "moderado", nome: "Mastiga na medida" },
  { id: "delicado", nome: "Delicado" },
];

function atividades(especie: Especie): { id: Atividade; nome: string }[] {
  return especie === "gato"
    ? [
        { id: "baixa", nome: "Quase não brinca" },
        { id: "media", nome: "Brinca às vezes" },
        { id: "alta", nome: "Brinca todo dia" },
      ]
    : [
        { id: "baixa", nome: "Quase não passeia" },
        { id: "media", nome: "Algumas vezes na semana" },
        { id: "alta", nome: "Passeia todo dia" },
      ];
}

function Progresso({ etapa }: { etapa: number }) {
  const x = 4 + ((338 - 40) * etapa) / TOTAL;
  return (
    <svg
      viewBox="0 0 342 26"
      fill="none"
      className="h-[26px] w-full"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={TOTAL}
      aria-valuenow={etapa}
      aria-label={`Passo ${etapa} de ${TOTAL}`}
    >
      <path d="M4 16 L 338 16" stroke="#E8D9BE" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 10" />
      <path d={`M4 16 L ${x} 16`} stroke="#F4622F" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 10" />
      <g transform={`translate(${x - 4} 2)`} fill="#F4622F">
        <circle cx="5" cy="10" r="3.4" />
        <circle cx="12.5" cy="5.5" r="3.4" />
        <circle cx="20" cy="5.5" r="3.4" />
        <circle cx="27.5" cy="10" r="3.4" />
        <ellipse cx="16" cy="16.5" rx="7.5" ry="5.5" />
      </g>
    </svg>
  );
}

function Opcoes<T extends string>({
  legenda,
  nome,
  opcoes,
  valor,
  aoEscolher,
  colunas = "grid-cols-1",
}: {
  legenda: string;
  nome: string;
  opcoes: { id: T; nome: string; detalhe?: string }[];
  valor: T | undefined;
  aoEscolher: (id: T) => void;
  colunas?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="mb-2.5 text-[13px] font-bold text-casca">{legenda}</legend>
      <div className={`grid gap-2.5 ${colunas}`}>
        {opcoes.map((opcao) => (
          <label
            key={opcao.id}
            className={`flex min-h-[52px] cursor-pointer flex-col justify-center rounded-[14px] border-[3px] bg-white px-4 py-2 has-focus-visible:outline-[3px] has-focus-visible:outline-offset-2 has-focus-visible:outline-coleira ${
              valor === opcao.id ? "border-faro" : "border-linha"
            }`}
          >
            <input
              type="radio"
              name={nome}
              value={opcao.id}
              checked={valor === opcao.id}
              onChange={() => aoEscolher(opcao.id)}
              className="sr-only"
            />
            <span className={`font-display text-base font-bold ${valor === opcao.id ? "text-faro-texto" : ""}`}>
              {opcao.nome}
            </span>
            {opcao.detalhe && <span className="text-xs text-casca">{opcao.detalhe}</span>}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function Quiz() {
  const [etapa, setEtapa] = useState(1);
  const [r, setR] = useState<Rascunho>({ especie: "cachorro", nomePet: "", tutor: "", whatsapp: "" });
  const [erro, setErro] = useState("");
  const [final, setFinal] = useState<{ respostas: Respostas; plano: PlanoId } | null>(null);
  const topo = useRef<HTMLDivElement>(null);
  const iniciou = useRef(false);

  const especie = r.especie ?? "cachorro";
  const nome = r.nomePet?.trim() || "seu pet";

  function mudar(parte: Rascunho) {
    setR((atual) => ({ ...atual, ...parte }));
    setErro("");
  }

  function irPara(proxima: number) {
    setErro("");
    setEtapa(proxima);
    topo.current?.focus();
    window.scrollTo({ top: 0 });
  }

  function validar(): string {
    if (etapa === 1 && !r.nomePet?.trim()) return "Conta pra gente o nome do bichinho.";
    if (etapa === 2 && (!r.porte || !r.fase)) return "Escolha o porte e a fase.";
    if (etapa === 3 && !r.foco) return "Toque na principal queixa.";
    if (etapa === 3 && r.foco !== "mimar" && !r.frequencia) return "Marque com que frequência isso aparece.";
    if (etapa === 4 && (!r.alimentacao || !r.atividade || !r.mastigacao)) return "Responda as três perguntas da rotina.";
    if (etapa === 5 && !r.tutor?.trim()) return "Digite o seu nome.";
    if (etapa === 5 && !whatsappValido(r.whatsapp ?? "")) return "Digite um WhatsApp válido, com DDD.";
    return "";
  }

  function continuar(evento: React.FormEvent) {
    evento.preventDefault();
    const problema = validar();
    if (problema) {
      setErro(problema);
      return;
    }
    if (etapa < TOTAL) {
      if (!iniciou.current) {
        iniciou.current = true;
        avisarInicio();
      }
      irPara(etapa + 1);
      return;
    }

    const respostas: Respostas = {
      especie,
      nomePet: r.nomePet!.trim(),
      porte: r.porte!,
      fase: r.fase!,
      foco: r.foco!,
      frequencia: r.foco === "mimar" ? "as-vezes" : r.frequencia!,
      alimentacao: r.alimentacao!,
      atividade: r.atividade!,
      mastigacao: r.mastigacao!,
      tutor: r.tutor!.trim(),
      whatsapp: r.whatsapp!,
    };
    const pedido = new URLSearchParams(window.location.search).get("plano");
    const plano: PlanoId = pedido === "mensal" ? "mensal" : "trimestral";

    salvarDados(novoCadastro(respostas, plano));
    const d = diagnosticar(respostas);
    // O lead só sai do aparelho se houver webhook configurado no servidor.
    fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ respostas, plano, indice: d.indice, suplemento: suplementos[d.suplemento].nome }),
      keepalive: true,
    }).catch(() => {});

    setFinal({ respostas, plano });
    window.scrollTo({ top: 0 });
  }

  if (final) return <Resultado respostas={final.respostas} plano={final.plano} />;

  const portes = (Object.keys(porteLabel[especie]) as Porte[])
    .filter((id) => especie === "cachorro" || id !== "gigante")
    .map((id) => ({ id, ...porteLabel[especie][id] }));
  const fases = (Object.keys(faseLabel) as Fase[]).map((id) => ({ id, ...faseLabel[id] }));

  return (
    <form onSubmit={continuar} noValidate className="flex min-h-dvh flex-col bg-areia">
      <div className="flex flex-col gap-2.5 px-6 pt-[22px] pb-3.5">
        <div className="flex items-center justify-between">
          <LogoLink className="text-[22px]" />
          <p className="text-[11px] font-bold tracking-[0.14em] text-mel">
            PASSO {etapa} DE {TOTAL}
          </p>
        </div>
        <Progresso etapa={etapa} />
      </div>

      <div ref={topo} tabIndex={-1} key={etapa} className="entrada flex flex-1 flex-col gap-5 px-6 pt-3 pb-6 outline-none">
        {etapa === 1 && (
          <>
            <div className="flex flex-col gap-1.5">
              <h1 className="font-display text-[30px] leading-[1.1] font-extrabold">Quem vamos mimar?</h1>
              <p className="text-[14.5px] text-casca">Leva 2 minutinhos e o resultado sai na hora.</p>
            </div>
            <fieldset>
              <legend className="sr-only">Espécie</legend>
              <div className="grid grid-cols-2 gap-3.5">
                {(["cachorro", "gato"] as Especie[]).map((id) => {
                  const ativo = especie === id;
                  const cor = id === "cachorro" ? "text-faro-texto" : "text-coleira";
                  return (
                    <label
                      key={id}
                      className={`flex cursor-pointer flex-col items-center gap-2.5 rounded-[18px] border-[3px] bg-white px-3 py-[22px] has-focus-visible:outline-[3px] has-focus-visible:outline-offset-2 has-focus-visible:outline-coleira ${
                        ativo ? (id === "cachorro" ? "border-faro" : "border-coleira") : "border-linha"
                      }`}
                    >
                      <input
                        type="radio"
                        name="especie"
                        value={id}
                        checked={ativo}
                        onChange={() => mudar({ especie: id, porte: undefined })}
                        className="sr-only"
                      />
                      <svg
                        width="54"
                        height="54"
                        viewBox="0 0 54 54"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={id === "cachorro" ? "text-faro" : "text-coleira"}
                        aria-hidden="true"
                      >
                        {id === "cachorro" ? (
                          <>
                            <path d="M14 20 C 10 12, 16 7, 21 11 L 24 14 L 30 14 L 33 11 C 38 7, 44 12, 40 20" />
                            <path d="M14 20 C 10 30, 13 42, 27 42 C 41 42, 44 30, 40 20 C 37 15, 17 15, 14 20 Z" />
                            <circle cx="21.5" cy="26" r="2.4" fill="currentColor" stroke="none" />
                            <circle cx="32.5" cy="26" r="2.4" fill="currentColor" stroke="none" />
                            <path d="M23.5 34 Q 27 37.5 30.5 34" />
                          </>
                        ) : (
                          <>
                            <path d="M15 21 L 12 9 L 21 14 M39 21 L 42 9 L 33 14" />
                            <path d="M15 21 C 11 31, 14 42, 27 42 C 40 42, 43 31, 39 21 C 36 14, 18 14, 15 21 Z" />
                            <circle cx="21.5" cy="27" r="2.2" fill="currentColor" stroke="none" />
                            <circle cx="32.5" cy="27" r="2.2" fill="currentColor" stroke="none" />
                            <path d="M18 33 L 10 32 M18 35.5 L 11 37 M36 33 L 44 32 M36 35.5 L 43 37" strokeWidth="2.2" />
                          </>
                        )}
                      </svg>
                      <span className={`font-display text-xl font-extrabold ${cor}`}>
                        {id === "cachorro" ? "Cachorro" : "Gato"}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <div className="flex flex-col gap-2">
              <label htmlFor="nomePet" className="text-[13px] font-bold text-casca">
                Nome do bichinho
              </label>
              <input
                id="nomePet"
                type="text"
                autoComplete="off"
                maxLength={24}
                placeholder="Thor"
                value={r.nomePet ?? ""}
                onChange={(e) => mudar({ nomePet: e.target.value })}
                className="h-[54px] rounded-[14px] border-2 border-linha bg-white px-[18px] font-display text-[19px] font-bold placeholder:text-[#b8a488] focus:border-faro focus:outline-none"
              />
            </div>
          </>
        )}

        {etapa === 2 && (
          <>
            <div className="flex flex-col gap-1.5">
              <h1 className="font-display text-[28px] leading-[1.12] font-extrabold">Como é {nome}?</h1>
              <p className="text-sm text-casca">Porte e idade definem porção, dureza e dose.</p>
            </div>
            <Opcoes
              legenda="Porte"
              nome="porte"
              opcoes={portes}
              valor={r.porte}
              aoEscolher={(porte) => mudar({ porte })}
              colunas="grid-cols-2"
            />
            <Opcoes
              legenda="Fase da vida"
              nome="fase"
              opcoes={fases}
              valor={r.fase}
              aoEscolher={(fase) => mudar({ fase })}
              colunas="grid-cols-3"
            />
          </>
        )}

        {etapa === 3 && (
          <>
            <div className="flex flex-col gap-1.5">
              <h1 className="font-display text-[28px] leading-[1.12] font-extrabold">
                O que mais incomoda {nome} hoje?
              </h1>
              <p className="text-sm text-casca">Toque na principal. É o que o box vai atacar primeiro.</p>
            </div>
            <fieldset>
              <legend className="sr-only">Principal queixa</legend>
              <div className="grid grid-cols-2 gap-3">
                {focos.map((foco) => {
                  const ativo = r.foco === foco.id;
                  const mimo = foco.id === "mimar";
                  return (
                    <label
                      key={foco.id}
                      className={`flex min-h-[92px] cursor-pointer flex-col gap-2 rounded-2xl border-[3px] px-3.5 py-4 has-focus-visible:outline-[3px] has-focus-visible:outline-offset-2 has-focus-visible:outline-coleira ${
                        mimo ? "bg-petisco-suave" : "bg-white"
                      } ${ativo ? "border-faro" : mimo ? "border-petisco" : "border-linha"}`}
                    >
                      <input
                        type="radio"
                        name="foco"
                        value={foco.id}
                        checked={ativo}
                        onChange={() => mudar({ foco: foco.id })}
                        className="sr-only"
                      />
                      <svg
                        width="30"
                        height="30"
                        viewBox="0 0 30 30"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        className={ativo ? "text-faro" : mimo ? "text-[#b8860b]" : "text-coleira"}
                        aria-hidden="true"
                      >
                        {foco.icone}
                      </svg>
                      <span
                        className={`font-display text-base leading-tight font-bold ${
                          ativo ? "text-faro-texto" : mimo ? "text-mel" : ""
                        }`}
                      >
                        {focoLabel(foco.id, especie)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            {r.foco && r.foco !== "mimar" && (
              <div className="entrada">
                <Opcoes
                  legenda="Com que frequência isso aparece?"
                  nome="frequencia"
                  opcoes={frequencias}
                  valor={r.frequencia}
                  aoEscolher={(frequencia) => mudar({ frequencia })}
                  colunas="grid-cols-3"
                />
              </div>
            )}
          </>
        )}

        {etapa === 4 && (
          <>
            <div className="flex flex-col gap-1.5">
              <h1 className="font-display text-[28px] leading-[1.12] font-extrabold">Como é a rotina de {nome}?</h1>
              <p className="text-sm text-casca">Três toques e fechamos o mapa.</p>
            </div>
            <Opcoes
              legenda="O que ele come no dia a dia?"
              nome="alimentacao"
              opcoes={alimentacoes}
              valor={r.alimentacao}
              aoEscolher={(alimentacao) => mudar({ alimentacao })}
              colunas="grid-cols-2"
            />
            <Opcoes
              legenda={especie === "gato" ? "Quanto ele brinca?" : "Quanto ele passeia?"}
              nome="atividade"
              opcoes={atividades(especie)}
              valor={r.atividade}
              aoEscolher={(atividade) => mudar({ atividade })}
            />
            <Opcoes
              legenda="Como ele é com petisco de roer?"
              nome="mastigacao"
              opcoes={mastigacoes}
              valor={r.mastigacao}
              aoEscolher={(mastigacao) => mudar({ mastigacao })}
            />
          </>
        )}

        {etapa === 5 && (
          <>
            <div className="flex flex-col gap-1.5">
              <h1 className="font-display text-[28px] leading-[1.12] font-extrabold">
                Prontinho! Para quem é o resultado de {nome}?
              </h1>
              <p className="text-sm leading-normal text-casca">
                O diagnóstico sai agora na tela. Pelo WhatsApp a gente acompanha {nome} com você.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="tutor" className="text-[13px] font-bold text-casca">
                Seu nome
              </label>
              <input
                id="tutor"
                type="text"
                autoComplete="given-name"
                maxLength={40}
                value={r.tutor ?? ""}
                onChange={(e) => mudar({ tutor: e.target.value })}
                className="h-[54px] rounded-[14px] border-2 border-linha bg-white px-[18px] text-base focus:border-faro focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="whatsapp" className="text-[13px] font-bold text-casca">
                WhatsApp
              </label>
              <div className="flex h-[54px] items-center gap-2.5 rounded-[14px] border-2 border-linha bg-white px-[18px] focus-within:border-faro">
                <IconeWhatsApp className="shrink-0 text-coleira" />
                <input
                  id="whatsapp"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="(21) 9 9999-9999"
                  aria-describedby="whatsapp-ajuda"
                  value={r.whatsapp ?? ""}
                  onChange={(e) => mudar({ whatsapp: mascaraWhatsApp(e.target.value) })}
                  className="h-full w-full bg-transparent text-base font-semibold placeholder:font-medium placeholder:text-[#b8a488] focus:outline-none"
                />
              </div>
              <p id="whatsapp-ajuda" className="text-xs text-palha">
                Só usamos para falar do resultado e do acompanhamento de {nome}. Sem spam.
              </p>
            </div>
            <div className="flex items-start gap-2.5 rounded-[14px] border-2 border-[#bcdfd4] bg-menta-suave px-4 py-3.5">
              <svg width="20" height="20" viewBox="0 0 20 20" className="mt-px shrink-0" aria-hidden="true">
                <path d="M10 2 L 12 7 L 17.5 7.5 L 13.4 11 L 14.7 16.5 L 10 13.6 L 5.3 16.5 L 6.6 11 L 2.5 7.5 L 8 7 Z" fill="#0E7C7B" />
              </svg>
              <p className="text-[12.5px] leading-normal text-[#14544f]">
                Junto com o resultado vem um <strong>cupom de primeiro box</strong>, só pra quem faz a avaliação.
              </p>
            </div>
          </>
        )}
      </div>

      <div className="sticky bottom-0 flex flex-col gap-2.5 bg-areia px-6 pt-3 pb-[26px]">
        <p role="alert" className="min-h-5 text-center text-[13px] font-bold text-[#b3261e]">
          {erro}
        </p>
        <div className="flex items-center gap-3">
          {etapa > 1 && (
            <button
              type="button"
              onClick={() => irPara(etapa - 1)}
              aria-label="Voltar"
              className="flex size-[58px] shrink-0 items-center justify-center rounded-full border-2 border-linha bg-white"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M12.5 4 L 6.5 10 L 12.5 16" stroke="#8A6210" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            className="flex h-[58px] flex-1 items-center justify-center gap-2.5 rounded-full bg-faro font-display text-[19px] font-extrabold text-areia hover:bg-faro-escuro"
          >
            {etapa === TOTAL ? `Farejar o box de ${nome}` : "Continuar"}
            {etapa === TOTAL && (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <path d="M4 11 L 18 11 M12 5 L 18 11 L 12 17" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-center text-[11.5px] text-palha">
          {etapa === TOTAL ? (
            <>
              Ao continuar você aceita o contato pelo WhatsApp informado e a{" "}
              <Link href="/privacidade" className="underline">
                política de privacidade
              </Link>
              .
            </>
          ) : (
            "Gratuito · sem compromisso · resultado na hora"
          )}
        </p>
      </div>
    </form>
  );
}

function Resultado({ respostas, plano }: { respostas: Respostas; plano: PlanoId }) {
  const d = diagnosticar(respostas);
  const nome = respostas.nomePet;
  const suplemento = suplementos[d.suplemento];
  const linkApp = linkDeAcesso(window.location.origin, { v: 1, respostas });
  const escolhido = planos[plano];

  return (
    <div className="fundo-escuro entrada relative flex min-h-dvh flex-col overflow-hidden bg-faro text-areia">
      <Pata size={44} className="absolute top-3 left-4 -rotate-[16deg] text-areia opacity-[0.13]" />
      <Pata size={44} className="absolute top-[150px] right-5 rotate-[14deg] text-areia opacity-[0.13]" />

      <div className="relative flex flex-col gap-2 px-[26px] pt-10">
        <p className="text-xs font-bold tracking-[0.3em] text-faro-claro">FAREJAMOS!</p>
        <h1 className="font-display text-[34px] leading-[1.08] font-extrabold">O box ideal de {nome} está pronto.</h1>
        <p className="text-sm leading-normal text-faro-suave">
          Perfil: <strong>{d.perfil}</strong>
        </p>
      </div>

      <div className="relative mx-[26px] mt-5 flex items-center gap-4 rounded-[20px] bg-faro-escuro px-5 py-4">
        <p className="font-display text-[44px] leading-none font-extrabold text-petisco">
          {d.indice}
          <span className="text-base text-faro-claro">/100</span>
        </p>
        <p className="text-[13px] leading-snug">
          <span className="block font-bold">Índice de bem-estar</span>
          <span className="text-faro-suave">{d.leitura}</span>
        </p>
      </div>

      <div className="relative mx-[26px] mt-4 flex flex-col gap-3.5 rounded-[20px] bg-areia p-[22px] text-focinho">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold tracking-[0.18em] text-faro-texto uppercase">Box de {nome} · todo mês</p>
          <p className="shrink-0 rounded-full bg-petisco px-3 py-1 text-[11px] font-bold">CUPOM ATIVO</p>
        </div>
        <ul className="flex flex-col gap-2.5 text-sm">
          <li className="flex items-center gap-2.5">
            <span className="size-2 shrink-0 rounded-full bg-faro" />
            4 a 6 petiscos naturais desidratados
          </li>
          <li className="flex items-center gap-2.5">
            <span className="size-2 shrink-0 rounded-full bg-coleira" />
            <span>
              Suplemento de <strong>{suplemento.nome}</strong>
              {respostas.foco !== "mimar" && respostas.foco !== "bucal" ? " (o foco dele)" : ""}
            </span>
          </li>
          <li className="flex items-center gap-2.5">
            <span className="size-2 shrink-0 rounded-full bg-petisco" />
            Brinde surpresa + cartinha com o nome dele
          </li>
          <li className="flex items-center gap-2.5">
            <span className="size-2 shrink-0 rounded-full bg-focinho" />
            Acompanhamento da saúde no App
          </li>
        </ul>
        <div className="flex flex-wrap items-baseline gap-2 border-t-2 border-dashed border-linha-forte pt-3">
          <p className="font-display text-[34px] leading-none font-extrabold text-faro-texto">R${escolhido.porMes}</p>
          <p className="text-[13px] text-casca">
            {plano === "trimestral" ? (
              <>
                /mês no plano trimestral <s>R${planos.mensal.preco}</s>
              </>
            ) : (
              "/mês no plano mensal"
            )}
          </p>
        </div>
        <p className="text-xs text-casca">
          Cupom <strong className="text-focinho">{site.cupom.codigo}</strong>: {site.cupom.beneficio}.
        </p>
      </div>

      <div className="relative mt-6 flex flex-col gap-2.5 px-[26px] pb-7">
        <a
          href={linkWhatsApp(mensagemPedido(respostas, plano, linkApp))}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => avisarInteresse(respostas.whatsapp, plano, "resultado")}
          className="flex h-[60px] items-center justify-center rounded-full bg-petisco font-display text-xl font-extrabold text-focinho hover:bg-[#ffd560]"
        >
          Quero o box de {nome}
        </a>
        <Link
          href="/mapa"
          className="flex h-[50px] items-center justify-center rounded-full border-2 border-faro-claro text-[15px] font-bold hover:bg-faro-escuro"
        >
          Ver o Mapa completo de {nome}
        </Link>
        <a
          href={linkWhatsApp(mensagemResultado(respostas, linkApp))}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[50px] items-center justify-center gap-2 rounded-full text-[15px] font-bold underline"
        >
          <IconeWhatsApp size={20} />
          Receber o resultado no WhatsApp
        </a>
        <Link href="/app" className="text-center text-[13px] font-semibold text-faro-suave underline">
          Abrir o app do tutor
        </Link>
      </div>
    </div>
  );
}
