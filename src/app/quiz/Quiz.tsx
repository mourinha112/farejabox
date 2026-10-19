"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconeWhatsApp, LogoLink, Pata } from "@/components/brand";
import { curadoria, planos, site, type PlanoId } from "@/lib/config";
import {
  diagnosticar,
  faseLabel,
  focoLabel,
  porteLabel,
  pilarInfo,
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
import { avisarInicio, avisarInteresse, avisarPrevia } from "@/lib/funil";
import { atualizarCadastro, linkDeAcesso, salvarDados } from "@/lib/storage";
import { salvarPerfilCheckout } from "@/lib/checkout-storage";
import { linkWhatsApp, mascaraWhatsApp, mensagemResultado, whatsappValido } from "@/lib/whatsapp";

type Rascunho = Partial<Respostas>;
type Tela = "perguntas" | "previa" | "contato";
const ETAPAS = 4;

function montarRespostas(r: Rascunho): Respostas {
  const especie = r.especie ?? "cachorro";
  return {
    especie,
    nomePet: r.nomePet!.trim(),
    porte: r.porte!,
    fase: r.fase!,
    foco: r.foco!,
    frequencia: r.foco === "mimar" ? "as-vezes" : r.frequencia!,
    alimentacao: r.alimentacao!,
    atividade: r.atividade!,
    mastigacao: r.mastigacao!,
    tutor: r.tutor?.trim() ?? "",
    whatsapp: r.whatsapp ?? "",
  };
}

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
  const x = 4 + ((338 - 40) * etapa) / ETAPAS;
  return (
    <svg
      viewBox="0 0 342 26"
      fill="none"
      className="h-[26px] w-full"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={ETAPAS}
      aria-valuenow={etapa}
      aria-label={`Etapa ${etapa} de ${ETAPAS}`}
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

export default function Quiz({ planoInicial }: { planoInicial?: PlanoId }) {
  const router = useRouter();
  const [tela, setTela] = useState<Tela>("perguntas");
  const [etapa, setEtapa] = useState(1);
  const [r, setR] = useState<Rascunho>({ especie: "cachorro", nomePet: "", tutor: "", whatsapp: "" });
  const [erro, setErro] = useState("");
  const [plano, setPlano] = useState<PlanoId>(planoInicial ?? "trimestral");
  const intencaoAssinar = Boolean(planoInicial);
  const [final, setFinal] = useState<{ respostas: Respostas; plano: PlanoId } | null>(null);
  const topo = useRef<HTMLDivElement>(null);
  const iniciou = useRef(false);
  const viuPrevia = useRef(false);

  const especie = r.especie ?? "cachorro";
  const nome = r.nomePet?.trim() || "seu pet";

  useEffect(() => {
    topo.current?.focus();
  }, [etapa, tela, final]);

  function mudar(parte: Rascunho) {
    setR((atual) => ({ ...atual, ...parte }));
    setErro("");
  }

  function irPara(proxima: number) {
    setErro("");
    setTela("perguntas");
    setEtapa(proxima);
    window.scrollTo({ top: 0 });
  }

  function irTela(proxima: Tela) {
    setErro("");
    setTela(proxima);
    if (proxima === "previa" && !viuPrevia.current) {
      viuPrevia.current = true;
      avisarPrevia(intencaoAssinar ? "assinatura" : "quiz");
    }
    window.scrollTo({ top: 0 });
  }

  function validar(): string {
    if (tela === "contato") {
      if (!r.tutor?.trim()) return "Digite o seu nome.";
      if (!whatsappValido(r.whatsapp ?? "")) return "Digite um WhatsApp válido, com DDD.";
      return "";
    }
    if (etapa === 1 && !r.nomePet?.trim()) return "Conta pra gente o nome do bichinho.";
    if (etapa === 2 && (!r.porte || !r.fase)) return "Escolha o porte e a fase.";
    if (etapa === 3 && !r.foco) return "Escolha o foco do perfil.";
    if (etapa === 3 && r.foco !== "mimar" && !r.frequencia) return "Marque com que frequência isso aparece.";
    if (etapa === 4 && (!r.alimentacao || !r.atividade || !r.mastigacao)) return "Responda as três perguntas da rotina.";
    return "";
  }

  function finalizar() {
    const respostas = montarRespostas(r);
    salvarDados(atualizarCadastro(respostas, plano));
    const d = diagnosticar(respostas);
    fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ respostas, plano, indice: d.indice, suplemento: suplementos[d.suplemento].nome }),
      keepalive: true,
    }).catch(() => {});
    setFinal({ respostas, plano });
    window.scrollTo({ top: 0 });
  }

  function abrirCheckout() {
    if (!salvarPerfilCheckout(montarRespostas(r), plano)) {
      setErro("Não foi possível guardar seu perfil nesta aba. Permita o armazenamento do site e tente novamente.");
      return;
    }
    router.push(`/checkout?plano=${plano}&perfil=novo`);
  }

  function continuar(evento: React.FormEvent) {
    evento.preventDefault();
    const problema = validar();
    if (problema) {
      setErro(problema);
      return;
    }
    if (tela === "contato") {
      finalizar();
      return;
    }
    if (etapa < ETAPAS) {
      if (!iniciou.current) {
        iniciou.current = true;
        avisarInicio();
      }
      irPara(etapa + 1);
      return;
    }
    irTela("previa");
  }

  if (final) return <Resultado respostas={final.respostas} plano={final.plano} />;
  if (tela === "previa") {
    return (
      <Previa
        respostas={montarRespostas(r)}
        plano={plano}
        intencaoAssinar={intencaoAssinar}
        onPlano={setPlano}
        erro={erro}
        onContinuar={() => intencaoAssinar ? abrirCheckout() : irTela("contato")}
        onVoltar={() => irPara(ETAPAS)}
      />
    );
  }

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
            {tela === "contato" ? "CONTATO" : `ETAPA ${etapa} DE ${ETAPAS}`}
          </p>
        </div>
        {tela !== "contato" && <Progresso etapa={etapa} />}
        {intencaoAssinar && (
          <div className="rounded-[14px] bg-coleira px-4 py-3 text-areia">
            <p className="text-[11px] font-bold tracking-wider text-menta">SUA ASSINATURA</p>
            <p className="mt-1 font-display text-lg font-bold">{planos[plano].nome} · {precoPlano(plano)}</p>
            <p className="mt-1 text-xs text-[#dff2ed]">Perfil do pet → seu box → entrega e pedido</p>
          </div>
        )}
      </div>

      <div ref={topo} tabIndex={-1} key={`${tela}-${etapa}`} className="entrada flex flex-1 flex-col gap-5 px-6 pt-3 pb-6 outline-none">
        {etapa === 1 && tela === "perguntas" && (
          <>
            <div className="flex flex-col gap-1.5">
              <h1 className="font-display text-[30px] leading-[1.1] font-extrabold">
                {intencaoAssinar ? "Quem vai receber o box?" : "Quem vamos mimar?"}
              </h1>
              <p className="text-[14.5px] text-casca">
                {intencaoAssinar
                  ? "Personalize seu box em 4 etapas. Depois, confira a sugestão e conclua seu pedido aqui no site."
                  : "Conte sobre seu pet em 4 etapas e veja uma prévia personalizada. Seu nome e WhatsApp ficam para depois, se quiser continuar."}
              </p>
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

        {etapa === 2 && tela === "perguntas" && (
          <>
            <div className="flex flex-col gap-1.5">
              <h1 className="font-display text-[28px] leading-[1.12] font-extrabold">Como é {nome}?</h1>
              <p className="text-sm text-casca">Porte e fase ajudam a equipe a avaliar os itens do box.</p>
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

        {etapa === 3 && tela === "perguntas" && (
          <>
            <div className="flex flex-col gap-1.5">
              <h1 className="font-display text-[28px] leading-[1.12] font-extrabold">
                Qual é o foco para {nome}?
              </h1>
              <p className="text-sm text-casca">Escolha o que você quer levar em conta na seleção.</p>
            </div>
            <fieldset>
              <legend className="sr-only">Foco do perfil</legend>
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

        {etapa === 4 && tela === "perguntas" && (
          <>
            <div className="flex flex-col gap-1.5">
              <h1 className="font-display text-[28px] leading-[1.12] font-extrabold">Como é a rotina de {nome}?</h1>
              <p className="text-sm text-casca">Três toques e fechamos o perfil.</p>
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

        {tela === "contato" && (
          <>
            <div className="flex flex-col gap-1.5">
              <h1 className="font-display text-[28px] leading-[1.12] font-extrabold">
                {`Quer acompanhar o perfil de ${nome}?`}
              </h1>
              <p className="text-sm leading-normal text-casca">
                Seu perfil já está aqui. Deixe o contato para salvar o acesso ao app e acompanhar a rotina do seu pet.
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
                Para falar sobre o perfil, o box e o acompanhamento de {nome}.
              </p>
            </div>
            <div className="flex items-start gap-2.5 rounded-[14px] border-2 border-[#bcdfd4] bg-menta-suave px-4 py-3.5">
              <svg width="20" height="20" viewBox="0 0 20 20" className="mt-px shrink-0" aria-hidden="true">
                <path d="M10 2 L 12 7 L 17.5 7.5 L 13.4 11 L 14.7 16.5 L 10 13.6 L 5.3 16.5 L 6.6 11 L 2.5 7.5 L 8 7 Z" fill="#0E7C7B" />
              </svg>
              <p className="text-[12.5px] leading-normal text-[#14544f]">
                Seu <strong>perfil e plano de 7 dias são gratuitos</strong>. Acesse o app para começar a acompanhar a rotina.
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
          {(etapa > 1 || tela === "contato") && (
            <button
              type="button"
              onClick={() => (tela === "contato" ? irTela("previa") : irPara(etapa - 1))}
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
            className="flex min-h-[58px] flex-1 items-center justify-center gap-2.5 rounded-full bg-faro px-3 py-3 font-display text-[19px] leading-snug font-extrabold text-areia hover:bg-faro-escuro"
          >
            {tela === "contato"
              ? "Salvar meu perfil e acessar o app"
              : etapa === ETAPAS
                ? `Ver o perfil de ${nome}`
                : "Continuar"}
            {(tela === "contato" || etapa === ETAPAS) && (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <path d="M4 11 L 18 11 M12 5 L 18 11 L 12 17" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-center text-[11.5px] text-palha">
          {tela === "contato" ? (
            <>
              Ao continuar você aceita o contato pelo WhatsApp informado e a{" "}
              <Link href="/privacidade" className="underline">
                política de privacidade
              </Link>
              .
            </>
          ) : (
            "Gratuito · sem compromisso · perfil na hora"
          )}
        </p>
      </div>
    </form>
  );
}

function Previa({
  respostas,
  plano,
  intencaoAssinar,
  onPlano,
  erro,
  onContinuar,
  onVoltar,
}: {
  respostas: Respostas;
  plano: PlanoId;
  intencaoAssinar: boolean;
  onPlano: (plano: PlanoId) => void;
  erro: string;
  onContinuar: () => void;
  onVoltar: () => void;
}) {
  const d = diagnosticar(respostas);
  const nome = respostas.nomePet;
  const suplemento = suplementos[d.suplemento];
  const titulo = useRef<HTMLHeadingElement>(null);
  useEffect(() => { titulo.current?.focus(); }, []);
  const textura =
    respostas.mastigacao === "roedor"
      ? "preferência por texturas mais firmes"
      : respostas.mastigacao === "delicado"
        ? "preferência por petiscos macios e fáceis de partir"
        : "um mix de texturas para variar o estímulo";

  return (
    <div className="entrada flex min-h-dvh flex-col bg-areia">
      <div className="flex items-center justify-between px-6 pt-[22px] pb-3.5">
        <LogoLink className="text-[22px]" />
        <p className="text-[11px] font-bold tracking-[0.14em] text-mel">{intencaoAssinar ? "REVISE SEU BOX" : "PRÉVIA DO PERFIL"}</p>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-6 pb-6">
        <div className="flex flex-col gap-1.5">
          <h1 ref={titulo} tabIndex={-1} className="font-display text-[30px] leading-[1.1] font-extrabold outline-none">
            {intencaoAssinar ? `Seu box, pensado para ${nome}.` : `O perfil de ${nome} já está aqui.`}
          </h1>
          <p className="text-sm text-casca">
            {intencaoAssinar
              ? "Confira o perfil, a sugestão de conteúdo e o plano. Depois, só faltam seus dados e a entrega."
              : "Esta prévia é sua, sem precisar deixar contato. Veja como suas respostas orientam a sugestão do box."}
          </p>
        </div>

        <div className="rounded-[18px] border-2 border-linha bg-white p-5">
          <p className="text-[11px] font-bold tracking-[0.18em] text-faro-texto uppercase">Perfil de {nome}</p>
          <p className="mt-1.5 font-display text-lg leading-snug font-bold">{d.perfil}</p>
          <p className="mt-3 text-[13px] leading-relaxed text-casca">
            {respostas.especie === "gato" ? "Gato" : "Cachorro"} · {porteLabel[respostas.especie][respostas.porte].detalhe} · {faseLabel[respostas.fase].nome}
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-casca">Mastigação: {textura}.</p>
        </div>

        <div className="flex flex-col gap-3 rounded-[18px] bg-coleira p-5 text-areia">
          <p className="text-[11px] font-bold tracking-[0.18em] text-menta uppercase">Sugestão inicial para o box</p>
          <ul className="flex flex-col gap-2 text-sm text-[#dff2ed]">
            <li>4 a 6 petiscos naturais desidratados</li>
            <li>
              Suplemento sugerido: <strong className="text-areia">{suplemento.nome}</strong>
            </li>
            <li>Brinde surpresa + cartinha com o nome dele</li>
          </ul>
          <p className="border-t border-menta/40 pt-3 text-[13px] leading-relaxed text-[#dff2ed]">
            <strong className="text-areia">Por que esta sugestão? </strong>
            {respostas.foco === "mimar" || respostas.foco === "bucal"
              ? `Entre as categorias de suplementos, ${pilarInfo[suplemento.pilar].nome.toLowerCase()} teve a menor pontuação nas regras do questionário. Essa comparação não identifica uma deficiência nutricional.`
              : `Você escolheu ${focoLabel(respostas.foco, respostas.especie).toLowerCase()} como foco. O questionário associa esse foco à categoria ${suplemento.nome}.`}
          </p>
        </div>

        <div className="rounded-[18px] border-2 border-linha p-4">
          <h2 className="font-display text-lg font-bold">Quem valida a seleção?</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-casca">{curadoria.resumo}</p>
          <details className="mt-3 text-[13px] text-casca">
            <summary className="cursor-pointer font-bold text-coleira underline">Entenda os critérios</summary>
            <p className="mt-2 leading-relaxed">{curadoria.detalhe}</p>
          </details>
        </div>
        <EscolhaPlano plano={plano} onPlano={onPlano} />
      </div>

      <div className="sticky bottom-0 flex flex-col gap-2.5 bg-areia px-6 pt-3 pb-[26px]">
        {erro && <p role="alert" className="text-center text-sm font-bold text-[#b3261e]">{erro}</p>}
        <button
          type="button"
          onClick={onContinuar}
          className="flex min-h-[58px] items-center justify-center rounded-full bg-faro px-4 py-3 text-center font-display text-[18px] font-extrabold text-areia hover:bg-faro-escuro"
        >
          {intencaoAssinar ? "Ir para o checkout" : "Salvar meu perfil e acessar o app"}
        </button>
        <p className="text-center text-xs text-casca">
          {intencaoAssinar ? "Contato e entrega em uma tela. Sem repetir o perfil." : "No próximo passo, pedimos seu nome e WhatsApp."}
        </p>
        <button type="button" onClick={onVoltar} className="text-center text-[13px] font-bold text-coleira underline">
          Ajustar as respostas
        </button>
      </div>
    </div>
  );
}

function precoPlano(plano: PlanoId): string {
  return plano === "mensal" ? `R$${planos.mensal.preco}/mês` : `R$${planos.trimestral.preco} a cada 3 meses`;
}

function EscolhaPlano({ plano, onPlano }: { plano: PlanoId; onPlano: (plano: PlanoId) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <Opcoes
        legenda="Seu plano — pode trocar antes de continuar"
        nome="plano"
        opcoes={(["mensal", "trimestral"] as PlanoId[]).map((id) => ({
          id,
          nome: `${planos[id].nome} · ${precoPlano(id)}`,
          detalhe: id === "trimestral" ? `Equivale a R$${planos[id].porMes}/mês · 3 boxes, um por mês` : "Um box por mês · cancelamento livre",
        }))}
        valor={plano}
        aoEscolher={onPlano}
      />
      <p className="text-xs leading-relaxed text-casca">Frete grátis. Confira seus dados e conclua o pedido aqui no site.</p>
    </div>
  );
}

function Resultado({ respostas, plano }: { respostas: Respostas; plano: PlanoId }) {
  const d = diagnosticar(respostas);
  const nome = respostas.nomePet;
  const suplemento = suplementos[d.suplemento];
  const linkApp = linkDeAcesso(window.location.origin, { v: 1, respostas, planoInteresse: plano });
  const escolhido = planos[plano];
  const titulo = useRef<HTMLHeadingElement>(null);
  useEffect(() => { titulo.current?.focus(); }, []);

  return (
    <div className="fundo-escuro entrada relative flex min-h-dvh flex-col overflow-hidden bg-faro text-areia">
      <Pata size={44} className="absolute top-3 left-4 -rotate-[16deg] text-areia opacity-[0.13]" />
      <Pata size={44} className="absolute top-[150px] right-5 rotate-[14deg] text-areia opacity-[0.13]" />

      <div className="relative flex flex-col gap-2 px-[26px] pt-10">
        <p className="text-xs font-bold tracking-[0.3em] text-faro-claro">FAREJAMOS!</p>
        <h1 ref={titulo} tabIndex={-1} className="font-display text-[34px] leading-[1.08] font-extrabold outline-none">O perfil de {nome} está pronto.</h1>
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
          <p className="shrink-0 rounded-full bg-petisco px-3 py-1 text-[11px] font-bold">PRIMEIRO BOX</p>
        </div>
        <ul className="flex flex-col gap-2.5 text-sm">
          <li className="flex items-center gap-2.5">
            <span className="size-2 shrink-0 rounded-full bg-faro" />
            4 a 6 petiscos naturais desidratados
          </li>
          <li className="flex items-center gap-2.5">
            <span className="size-2 shrink-0 rounded-full bg-coleira" />
            <span>
              Sugestão: <strong>{suplemento.nome}</strong>
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
                /mês no plano trimestral
              </>
            ) : (
              "/mês no plano mensal"
            )}
          </p>
        </div>
        <p className="text-xs text-casca">{precoPlano(plano)}. Frete grátis.</p>
        <p className="text-xs text-casca">
          O perfil, o plano de 7 dias e o acesso ao app continuam gratuitos.
        </p>
      </div>

      <div className="relative mt-6 flex flex-col gap-2.5 px-[26px] pb-7">
        <Link
          href={`/checkout?plano=${plano}`}
          onClick={() => avisarInteresse(respostas.whatsapp, plano, "resultado")}
          className="flex h-[60px] items-center justify-center rounded-full bg-petisco font-display text-xl font-extrabold text-focinho hover:bg-[#ffd560]"
        >
          Continuar para o checkout
        </Link>
        <Link
          href="/mapa"
          className="flex h-[50px] items-center justify-center rounded-full border-2 border-faro-claro text-[15px] font-bold hover:bg-faro-escuro"
        >
          Ver o Mapa completo de {nome}
        </Link>
        {site.whatsapp && <a
          href={linkWhatsApp(mensagemResultado(respostas, linkApp))}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[50px] items-center justify-center gap-2 rounded-full text-[15px] font-bold underline"
        >
          <IconeWhatsApp size={20} />
          Receber o resultado no WhatsApp
        </a>}
        <Link href="/app" className="text-center text-[13px] font-semibold text-faro-suave underline">
          Abrir o app do tutor
        </Link>
        <p className="pt-2 text-center text-[12px] leading-relaxed text-faro-suave">{curadoria.resumo}</p>
      </div>
    </div>
  );
}
