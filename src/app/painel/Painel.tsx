"use client";

import { useState } from "react";
import { Logo } from "@/components/brand";
import { planos, type PlanoId } from "@/lib/config";
import {
  faseLabel,
  focoLabel,
  porteLabel,
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
import { linkDeAcesso, type Assinatura, type StatusCaixa } from "@/lib/storage";
import { linkWhatsApp, mascaraWhatsApp, mensagemLinkDeAcesso, whatsappValido } from "@/lib/whatsapp";

const campo =
  "h-12 w-full rounded-xl border-2 border-linha bg-white px-3 text-[15px] focus:border-faro focus:outline-none";

function Campo({ rotulo, id, children }: { rotulo: string; id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-bold text-casca">
        {rotulo}
      </label>
      {children}
    </div>
  );
}

function Selecao<T extends string>({
  id,
  valor,
  aoMudar,
  opcoes,
}: {
  id: string;
  valor: T;
  aoMudar: (valor: T) => void;
  opcoes: [T, string][];
}) {
  return (
    <select id={id} value={valor} onChange={(e) => aoMudar(e.target.value as T)} className={campo}>
      {opcoes.map(([v, nome]) => (
        <option key={v} value={v}>
          {nome}
        </option>
      ))}
    </select>
  );
}

const mesAtual = new Intl.DateTimeFormat("pt-BR", { month: "long" });

export default function Painel() {
  const [r, setR] = useState<Respostas>({
    especie: "cachorro",
    nomePet: "",
    porte: "medio",
    fase: "adulto",
    foco: "pelagem",
    frequencia: "toda-semana",
    alimentacao: "mista",
    atividade: "media",
    mastigacao: "moderado",
    tutor: "",
    whatsapp: "",
  });
  const [temBox, setTemBox] = useState(true);
  const [plano, setPlano] = useState<PlanoId>("trimestral");
  const [status, setStatus] = useState<StatusCaixa>("preparando");
  const [mes, setMes] = useState(() => mesAtual.format(new Date()));
  const [rastreio, setRastreio] = useState("");
  const [previsao, setPrevisao] = useState("");
  const [itens, setItens] = useState("");
  const [link, setLink] = useState("");
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState(false);

  function mudar(parte: Partial<Respostas>) {
    setR((atual) => ({ ...atual, ...parte }));
    setLink("");
    setCopiado(false);
  }

  function gerar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!r.nomePet.trim() || !r.tutor.trim()) return setErro("Preencha o nome do pet e do tutor.");
    if (!whatsappValido(r.whatsapp)) return setErro("WhatsApp do tutor inválido.");
    setErro("");

    const assinatura: Assinatura | undefined = temBox
      ? {
          plano,
          status,
          mes: mes.trim() || mesAtual.format(new Date()),
          rastreio: rastreio.trim().toUpperCase() || undefined,
          previsao: previsao || undefined,
          itens: itens
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
        }
      : undefined;

    setLink(
      linkDeAcesso(window.location.origin, {
        v: 1,
        respostas: { ...r, nomePet: r.nomePet.trim(), tutor: r.tutor.trim() },
        assinatura,
      }),
    );
    setCopiado(false);
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  const especies: [Especie, string][] = [
    ["cachorro", "Cachorro"],
    ["gato", "Gato"],
  ];
  const portes = (Object.keys(porteLabel[r.especie]) as Porte[])
    .filter((id) => r.especie === "cachorro" || id !== "gigante")
    .map((id): [Porte, string] => [id, `${porteLabel[r.especie][id].nome} (${porteLabel[r.especie][id].detalhe})`]);
  const fases = (Object.keys(faseLabel) as Fase[]).map((id): [Fase, string] => [id, faseLabel[id].nome]);
  const focos = (["pelagem", "ansiedade", "articulacao", "digestao", "bucal", "mimar"] as Foco[]).map(
    (id): [Foco, string] => [id, focoLabel(id, r.especie)],
  );

  return (
    <main className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-5 py-10">
      <div>
        <Logo className="text-[34px]" />
        <h1 className="mt-2 font-display text-[30px] leading-tight font-extrabold">Gerar acesso do tutor</h1>
        <p className="mt-1 text-sm leading-relaxed text-casca">
          Preencha os dados do cliente e da caixa do mês. O link gerado abre o app já com tudo carregado. Mudou o status
          da entrega? Gere um link novo e envie de novo.
        </p>
      </div>

      <form onSubmit={gerar} noValidate className="flex flex-col gap-6">
        <fieldset className="grid gap-4 rounded-[18px] border-2 border-linha bg-white p-5 sm:grid-cols-2">
          <legend className="px-2 text-[11px] font-bold tracking-[0.2em] text-faro-texto">TUTOR E PET</legend>
          <Campo rotulo="Nome do tutor" id="tutor">
            <input id="tutor" className={campo} value={r.tutor} onChange={(e) => mudar({ tutor: e.target.value })} />
          </Campo>
          <Campo rotulo="WhatsApp do tutor" id="whatsapp">
            <input
              id="whatsapp"
              type="tel"
              inputMode="numeric"
              className={campo}
              value={r.whatsapp}
              onChange={(e) => mudar({ whatsapp: mascaraWhatsApp(e.target.value) })}
            />
          </Campo>
          <Campo rotulo="Nome do pet" id="nomePet">
            <input id="nomePet" className={campo} value={r.nomePet} onChange={(e) => mudar({ nomePet: e.target.value })} />
          </Campo>
          <Campo rotulo="Espécie" id="especie">
            <Selecao
              id="especie"
              valor={r.especie}
              aoMudar={(especie) => mudar({ especie, porte: especie === "gato" && r.porte === "gigante" ? "grande" : r.porte })}
              opcoes={especies}
            />
          </Campo>
          <Campo rotulo="Porte" id="porte">
            <Selecao id="porte" valor={r.porte} aoMudar={(porte) => mudar({ porte })} opcoes={portes} />
          </Campo>
          <Campo rotulo="Fase" id="fase">
            <Selecao id="fase" valor={r.fase} aoMudar={(fase) => mudar({ fase })} opcoes={fases} />
          </Campo>
          <Campo rotulo="Foco" id="foco">
            <Selecao id="foco" valor={r.foco} aoMudar={(foco) => mudar({ foco })} opcoes={focos} />
          </Campo>
          <Campo rotulo="Frequência da queixa" id="frequencia">
            <Selecao<Frequencia>
              id="frequencia"
              valor={r.frequencia}
              aoMudar={(frequencia) => mudar({ frequencia })}
              opcoes={[
                ["as-vezes", "Às vezes"],
                ["toda-semana", "Toda semana"],
                ["todo-dia", "Todo dia"],
              ]}
            />
          </Campo>
          <Campo rotulo="Alimentação" id="alimentacao">
            <Selecao<Alimentacao>
              id="alimentacao"
              valor={r.alimentacao}
              aoMudar={(alimentacao) => mudar({ alimentacao })}
              opcoes={[
                ["racao", "Só ração"],
                ["mista", "Ração + petiscos"],
                ["natural", "Alimentação natural"],
                ["caseira", "Comida caseira"],
              ]}
            />
          </Campo>
          <Campo rotulo="Atividade" id="atividade">
            <Selecao<Atividade>
              id="atividade"
              valor={r.atividade}
              aoMudar={(atividade) => mudar({ atividade })}
              opcoes={[
                ["baixa", "Baixa"],
                ["media", "Média"],
                ["alta", "Alta"],
              ]}
            />
          </Campo>
          <Campo rotulo="Mastigação" id="mastigacao">
            <Selecao<Mastigacao>
              id="mastigacao"
              valor={r.mastigacao}
              aoMudar={(mastigacao) => mudar({ mastigacao })}
              opcoes={[
                ["roedor", "Roedor entusiasmado"],
                ["moderado", "Na medida"],
                ["delicado", "Delicado"],
              ]}
            />
          </Campo>
        </fieldset>

        <fieldset className="grid gap-4 rounded-[18px] border-2 border-linha bg-white p-5 sm:grid-cols-2">
          <legend className="px-2 text-[11px] font-bold tracking-[0.2em] text-faro-texto">CAIXA DO MÊS</legend>
          <label className="flex items-center gap-3 text-[15px] font-bold sm:col-span-2">
            <input
              type="checkbox"
              checked={temBox}
              onChange={(e) => {
                setTemBox(e.target.checked);
                setLink("");
              }}
              className="size-5 accent-[#0e7c7b]"
            />
            Cliente tem box ativo
          </label>
          {temBox && (
            <>
              <Campo rotulo="Plano" id="plano">
                <Selecao<PlanoId>
                  id="plano"
                  valor={plano}
                  aoMudar={(v) => {
                    setPlano(v);
                    setLink("");
                  }}
                  opcoes={[
                    ["mensal", planos.mensal.nome],
                    ["trimestral", planos.trimestral.nome],
                  ]}
                />
              </Campo>
              <Campo rotulo="Status da entrega" id="status">
                <Selecao<StatusCaixa>
                  id="status"
                  valor={status}
                  aoMudar={(v) => {
                    setStatus(v);
                    setLink("");
                  }}
                  opcoes={[
                    ["preparando", "Preparando"],
                    ["postado", "Postado"],
                    ["transito", "Em trânsito"],
                    ["entregue", "Entregue"],
                  ]}
                />
              </Campo>
              <Campo rotulo="Mês da caixa" id="mes">
                <input
                  id="mes"
                  className={campo}
                  value={mes}
                  onChange={(e) => {
                    setMes(e.target.value);
                    setLink("");
                  }}
                />
              </Campo>
              <Campo rotulo="Previsão de entrega" id="previsao">
                <input
                  id="previsao"
                  type="date"
                  className={campo}
                  value={previsao}
                  onChange={(e) => {
                    setPrevisao(e.target.value);
                    setLink("");
                  }}
                />
              </Campo>
              <Campo rotulo="Código de rastreio (Correios)" id="rastreio">
                <input
                  id="rastreio"
                  className={campo}
                  placeholder="AA123456789BR"
                  value={rastreio}
                  onChange={(e) => {
                    setRastreio(e.target.value);
                    setLink("");
                  }}
                />
              </Campo>
              <div className="sm:col-span-2">
                <Campo rotulo="Itens da caixa (um por linha, opcional)" id="itens">
                  <textarea
                    id="itens"
                    rows={5}
                    className={`${campo} h-auto py-2.5`}
                    placeholder={"Tubinho de traqueia bovina\nSuplemento Pelagem & pele"}
                    value={itens}
                    onChange={(e) => {
                      setItens(e.target.value);
                      setLink("");
                    }}
                  />
                </Campo>
              </div>
            </>
          )}
        </fieldset>

        <p role="alert" className="min-h-5 text-[13px] font-bold text-[#b3261e]">
          {erro}
        </p>
        <button
          type="submit"
          className="h-[56px] rounded-full bg-faro font-display text-lg font-extrabold text-areia hover:bg-faro-escuro"
        >
          Gerar link de acesso
        </button>
      </form>

      {link && (
        <section className="entrada flex flex-col gap-3 rounded-[18px] border-2 border-coleira bg-menta-suave p-5">
          <h2 className="text-[11px] font-bold tracking-[0.2em] text-coleira">LINK DE {r.nomePet.toUpperCase()}</h2>
          <p className="rounded-xl bg-white p-3 text-[13px] break-all">{link}</p>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={copiar}
              className="h-12 flex-1 rounded-full border-2 border-coleira font-display text-[15px] font-extrabold text-coleira"
            >
              {copiado ? "Copiado!" : "Copiar link"}
            </button>
            <a
              href={linkWhatsApp(mensagemLinkDeAcesso(r, link), `55${r.whatsapp}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 flex-1 items-center justify-center rounded-full bg-coleira font-display text-[15px] font-extrabold text-areia"
            >
              Enviar no WhatsApp do tutor
            </a>
          </div>
        </section>
      )}
    </main>
  );
}
