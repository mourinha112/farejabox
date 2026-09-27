"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconeWhatsApp, Logo } from "@/components/brand";
import { Carregando } from "@/components/SemCadastro";
import { planos, site } from "@/lib/config";
import {
  calcularIndice,
  diagnosticar,
  faseLabel,
  focoLabel,
  ordemPilares,
  pilarInfo,
  plano7Dias,
  porteLabel,
  suplementos,
  type PilarId,
  type Pilares,
} from "@/lib/diagnostico";
import { avisarInteresse } from "@/lib/funil";
import {
  atualizarDados,
  decodificarAcesso,
  hoje,
  importarAcesso,
  limparDados,
  linkDeAcesso,
  useDados,
  type Dados,
  type StatusCaixa,
} from "@/lib/storage";
import { linkWhatsApp, mensagemAjuda, mensagemAvaliacao, mensagemPedido } from "@/lib/whatsapp";

type Aba = "inicio" | "caixas" | "saude" | "perfil";

const etapasCaixa: { id: StatusCaixa; nome: string; progresso: number }[] = [
  { id: "preparando", nome: "Preparando", progresso: 15 },
  { id: "postado", nome: "Postado", progresso: 40 },
  { id: "transito", nome: "Em trânsito", progresso: 70 },
  { id: "entregue", nome: "Entregue", progresso: 100 },
];

const coresPilar: Record<PilarId, string> = {
  nutricao: "bg-petisco",
  pele: "bg-faro",
  comportamento: "bg-coleira",
  mobilidade: "bg-mel",
  bucal: "bg-coleira-escuro",
};

function extrairCodigo(texto: string): string {
  const achado = texto.match(/acesso=([A-Za-z0-9_-]+)/);
  return achado ? achado[1] : texto.trim();
}

function diasAte(data: string): number {
  const [a, m, d] = data.split("-").map(Number);
  const [ha, hm, hd] = hoje().split("-").map(Number);
  return Math.round((Date.UTC(a, m - 1, d) - Date.UTC(ha, hm - 1, hd)) / 86_400_000);
}

function dataCurta(data: string): string {
  const [a, m, d] = data.split("-");
  return `${d}/${m}/${a}`;
}

function pilaresAtuais(dados: Dados): { base: Pilares; atual: Pilares } {
  const base = diagnosticar(dados.respostas).pilares;
  const ultimo = dados.checkins[dados.checkins.length - 1];
  return { base, atual: ultimo?.pilares ?? base };
}

function Cartao({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[18px] border-2 border-linha bg-white p-5 ${className}`}>{children}</section>;
}

function Rotulo({ children, className = "text-mel" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-[11px] font-bold tracking-[0.2em] uppercase ${className}`}>{children}</h2>;
}

function Barra({ nome, de, para, cor }: { nome: string; de: number; para: number; cor: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="flex justify-between text-[12.5px] font-bold">
        <span>{nome}</span>
        <span className="text-casca">{de === para ? para : `${de} → ${para}`}</span>
      </p>
      <div className="h-2.5 overflow-hidden rounded-full bg-linha">
        <div className={`h-full rounded-full ${cor}`} style={{ width: `${para}%` }} />
      </div>
    </div>
  );
}

function Entrada() {
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");

  function entrar(evento: React.FormEvent) {
    evento.preventDefault();
    const acesso = decodificarAcesso(extrairCodigo(codigo));
    if (!acesso) {
      setErro("Não reconhecemos esse link. Copie o link completo que chegou no WhatsApp.");
      return;
    }
    importarAcesso(acesso);
  }

  return (
    <div className="flex min-h-dvh flex-col gap-6 px-6 pt-12 pb-8">
      <div className="flex flex-col gap-2">
        <Logo className="text-[40px]" />
        <p className="text-[11px] font-bold tracking-[0.26em] text-coleira">APP DO TUTOR</p>
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[30px] leading-tight font-extrabold">Entre para acompanhar o seu pet</h1>
        <p className="text-[14.5px] leading-relaxed text-casca">
          O acesso é pelo link pessoal que a gente envia no WhatsApp. Tocou no link, entrou. Se preferir, cole ele aqui.
        </p>
      </div>

      <form onSubmit={entrar} noValidate className="flex flex-col gap-2.5">
        <label htmlFor="codigo" className="text-[13px] font-bold text-casca">
          Link de acesso
        </label>
        <input
          id="codigo"
          type="text"
          autoComplete="off"
          placeholder="https://farejabox.com.br/app#acesso=..."
          value={codigo}
          onChange={(e) => {
            setCodigo(e.target.value);
            setErro("");
          }}
          className="h-[54px] rounded-[14px] border-2 border-linha bg-white px-4 text-[15px] placeholder:text-[#b8a488] focus:border-faro focus:outline-none"
        />
        <p role="alert" className="min-h-5 text-[13px] font-bold text-[#b3261e]">
          {erro}
        </p>
        <button
          type="submit"
          className="flex h-[56px] items-center justify-center rounded-full bg-faro font-display text-lg font-extrabold text-areia hover:bg-faro-escuro"
        >
          Entrar
        </button>
      </form>

      <div className="mt-auto flex flex-col gap-3">
        <Link
          href="/quiz"
          className="flex h-[52px] items-center justify-center rounded-full bg-petisco font-display text-base font-extrabold text-focinho"
        >
          Ainda não fiz a avaliação
        </Link>
        <a
          href={linkWhatsApp("Oi, FAREJA! Preciso do meu link de acesso ao app.")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[52px] items-center justify-center gap-2 rounded-full border-2 border-coleira text-[15px] font-bold text-coleira"
        >
          <IconeWhatsApp size={20} />
          Pedir meu link no WhatsApp
        </a>
      </div>
    </div>
  );
}

function CartaoCaixa({ dados }: { dados: Dados }) {
  const { respostas: r, assinatura } = dados;
  const [copiado, setCopiado] = useState(false);

  if (!assinatura) {
    const linkApp = linkDeAcesso(window.location.origin, { v: 1, respostas: r });
    return (
      <section className="fundo-escuro flex flex-col gap-2.5 rounded-[18px] bg-faro px-5 py-[18px] text-areia">
        <Rotulo className="text-faro-claro">Box de {r.nomePet}</Rotulo>
        <p className="font-display text-2xl leading-tight font-extrabold">Ainda sem box ativo</p>
        <p className="text-[13px] leading-normal text-faro-suave">
          O diagnóstico já indicou o que entra na caixa. Assine e acompanhe a entrega por aqui.
        </p>
        <a
          href={linkWhatsApp(mensagemPedido(r, dados.planoInteresse ?? "trimestral", linkApp))}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => avisarInteresse(r.whatsapp, dados.planoInteresse ?? "trimestral", "app")}
          className="mt-1 flex h-[46px] items-center justify-center rounded-full bg-areia font-display text-[15px] font-extrabold text-faro-texto"
        >
          Quero o box de {r.nomePet}
        </a>
      </section>
    );
  }

  const etapa = etapasCaixa.find((e) => e.id === assinatura.status) ?? etapasCaixa[0];
  const dias = assinatura.previsao ? diasAte(assinatura.previsao) : null;
  let titulo = etapa.nome;
  if (assinatura.status === "entregue") titulo = "Chegou! Hora de farejar";
  else if (dias !== null && dias > 1) titulo = `Chega em ~${dias} dias`;
  else if (dias === 1) titulo = "Chega amanhã";
  else if (dias === 0) titulo = "Chega hoje";

  async function copiar() {
    try {
      await navigator.clipboard.writeText(assinatura!.rastreio!);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <section className="fundo-escuro flex flex-col gap-2.5 rounded-[18px] bg-faro px-5 py-[18px] text-areia">
      <div className="flex items-center justify-between gap-2">
        <Rotulo className="text-faro-claro">
          {assinatura.status === "entregue" ? "Caixa" : "Próxima caixa"} de {r.nomePet}
        </Rotulo>
        <p className="shrink-0 rounded-full bg-petisco px-2.5 py-1 text-[11px] font-bold text-focinho uppercase">
          {etapa.nome}
        </p>
      </div>
      <p className="font-display text-2xl font-extrabold">{titulo}</p>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-faro-escuro"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={etapa.progresso}
        aria-label="Andamento da entrega"
      >
        <div className="h-full rounded-full bg-petisco" style={{ width: `${etapa.progresso}%` }} />
      </div>
      <ol className="flex justify-between text-[11.5px] text-faro-claro">
        {etapasCaixa.map((e) => (
          <li key={e.id} className={e.id === etapa.id ? "font-bold text-areia" : ""}>
            {e.nome}
          </li>
        ))}
      </ol>
      {assinatura.rastreio && (
        <div className="mt-1 flex flex-col gap-2">
          <a
            href="https://rastreamento.correios.com.br/app/index.php"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[46px] items-center justify-center rounded-full bg-areia font-display text-[15px] font-extrabold text-faro-texto"
          >
            Rastrear nos Correios
          </a>
          <button type="button" onClick={copiar} className="text-center text-[12.5px] font-semibold underline">
            {copiado ? "Código copiado!" : `Copiar código ${assinatura.rastreio}`}
          </button>
        </div>
      )}
    </section>
  );
}

function Avaliar({ dados, aoFechar }: { dados: Dados; aoFechar: () => void }) {
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState("");
  const nome = dados.respostas.nomePet;

  return (
    <Cartao className="entrada flex flex-col gap-3">
      <Rotulo>{nome} gostou do box?</Rotulo>
      <fieldset>
        <legend className="sr-only">Nota de 1 a 5</legend>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              className={`flex h-12 flex-1 cursor-pointer items-center justify-center rounded-xl border-2 font-display text-lg font-extrabold has-focus-visible:outline-[3px] has-focus-visible:outline-coleira ${
                n <= nota ? "border-petisco bg-petisco" : "border-linha bg-white text-casca"
              }`}
            >
              <input
                type="radio"
                name="nota"
                value={n}
                checked={nota === n}
                onChange={() => setNota(n)}
                className="sr-only"
              />
              {n}
            </label>
          ))}
        </div>
      </fieldset>
      <label htmlFor="comentario" className="text-[13px] font-bold text-casca">
        O que ele mais curtiu? (opcional)
      </label>
      <textarea
        id="comentario"
        rows={3}
        maxLength={300}
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        className="rounded-[14px] border-2 border-linha bg-white p-3 text-[15px] focus:border-faro focus:outline-none"
      />
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={aoFechar}
          className="h-12 flex-1 rounded-full border-2 border-linha text-sm font-bold text-casca"
        >
          Fechar
        </button>
        <a
          href={linkWhatsApp(mensagemAvaliacao(dados.respostas, nota, comentario.trim()))}
          target="_blank"
          rel="noopener noreferrer"
          onClick={aoFechar}
          className="flex h-12 flex-[2] items-center justify-center rounded-full bg-coleira font-display text-[15px] font-extrabold text-areia"
        >
          Enviar no WhatsApp
        </a>
      </div>
    </Cartao>
  );
}

function Inicio({ dados, irPara }: { dados: Dados; irPara: (aba: Aba) => void }) {
  const [avaliando, setAvaliando] = useState(false);
  const r = dados.respostas;
  const { base, atual } = pilaresAtuais(dados);
  const indiceBase = calcularIndice(base);
  const indiceAtual = calcularIndice(atual);
  const d = diagnosticar(r);
  const focoPilar = suplementos[d.suplemento].pilar;
  const segundo = ordemPilares.filter((id) => id !== focoPilar).reduce((m, id) => (atual[id] < atual[m] ? id : m));
  const doseFeita = dados.doses.includes(hoje());

  function marcarDose() {
    atualizarDados((a) => ({
      ...a,
      doses: doseFeita ? a.doses.filter((dia) => dia !== hoje()) : [...a.doses, hoje()],
    }));
  }

  return (
    <div className="flex flex-col gap-4">
      <CartaoCaixa dados={dados} />

      <Cartao className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <Rotulo>Saúde de {r.nomePet}</Rotulo>
          <p className={`text-xs font-bold ${indiceAtual >= indiceBase ? "text-[#177452]" : "text-faro-texto"}`}>
            {indiceAtual === indiceBase
              ? `${indiceAtual}/100`
              : `${indiceBase} → ${indiceAtual} ${indiceAtual > indiceBase ? "▲" : "▼"}`}
          </p>
        </div>
        <Barra nome={`${pilarInfo[focoPilar].nome} (foco)`} de={base[focoPilar]} para={atual[focoPilar]} cor="bg-faro" />
        <Barra nome={pilarInfo[segundo].nome} de={base[segundo]} para={atual[segundo]} cor="bg-coleira" />
        <p className="text-xs leading-normal text-casca">
          {dados.checkins.length === 0
            ? "Faça o primeiro check-in da semana para começar a medir a evolução."
            : `Último check-in em ${dataCurta(dados.checkins[dados.checkins.length - 1].data)}. Continue registrando toda semana.`}
        </p>
        <button
          type="button"
          onClick={() => irPara("saude")}
          className="h-11 rounded-full border-2 border-coleira font-display text-[15px] font-bold text-coleira"
        >
          Fazer check-in da semana
        </button>
      </Cartao>

      {dados.assinatura && (
        <button
          type="button"
          onClick={marcarDose}
          aria-pressed={doseFeita}
          className={`flex h-[56px] items-center justify-center gap-2 rounded-[14px] border-2 font-display text-[15px] font-bold ${
            doseFeita ? "border-coleira bg-menta-suave text-coleira-escuro" : "border-linha bg-white"
          }`}
        >
          {doseFeita ? "✓ Dose de hoje registrada" : `Marcar a dose de hoje de ${suplementos[d.suplemento].nome}`}
        </button>
      )}

      {avaliando ? (
        <Avaliar dados={dados} aoFechar={() => setAvaliando(false)} />
      ) : (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setAvaliando(true)}
            className="flex min-h-[52px] flex-1 items-center justify-center rounded-[14px] bg-petisco px-2 text-center font-display text-sm leading-tight font-bold text-focinho"
          >
            {r.nomePet} gostou do box?
          </button>
          <a
            href={linkWhatsApp(mensagemAjuda(r))}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[52px] flex-1 items-center justify-center rounded-[14px] bg-coleira px-2 text-center font-display text-sm font-bold text-areia"
          >
            Falar com a gente
          </a>
        </div>
      )}
    </div>
  );
}

function Caixas({ dados }: { dados: Dados }) {
  const { respostas: r, assinatura } = dados;
  const d = diagnosticar(r);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-[26px] font-extrabold">Caixas de {r.nomePet}</h1>
      {assinatura ? (
        <>
          <CartaoCaixa dados={dados} />
          <Cartao className="flex flex-col gap-3">
            <Rotulo>Caixa de {assinatura.mes}</Rotulo>
            {assinatura.itens.length > 0 ? (
              <ul className="flex flex-col gap-2 text-sm">
                {assinatura.itens.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-faro" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-normal text-casca">
                O conteúdo é surpresa até a caixa chegar. Depois da entrega a lista aparece aqui.
              </p>
            )}
            <p className="border-t-2 border-dashed border-linha-forte pt-3 text-[13px] text-casca">
              Plano: <strong className="text-focinho">{planos[assinatura.plano].nome}</strong>
            </p>
          </Cartao>
        </>
      ) : (
        <CartaoCaixa dados={dados} />
      )}

      <Cartao className="flex flex-col gap-3">
        <Rotulo>O que entra no box de {r.nomePet}</Rotulo>
        <ul className="flex flex-col gap-2 text-sm">
          <li>4 a 6 petiscos naturais desidratados</li>
          <li>
            Suplemento <strong>{suplementos[d.suplemento].nome}</strong>: {suplementos[d.suplemento].descricao}
          </li>
          <li>Brinde surpresa + cartinha com o nome dele</li>
        </ul>
        <ol className="flex flex-col gap-2 border-t-2 border-dashed border-linha-forte pt-3 text-[13px] leading-normal text-casca">
          {d.motivos.map((motivo) => (
            <li key={motivo}>{motivo}</li>
          ))}
        </ol>
      </Cartao>
    </div>
  );
}

const opcoesCheckin = [
  { valor: -2, nome: "Piorou muito" },
  { valor: -1, nome: "Piorou" },
  { valor: 0, nome: "Igual" },
  { valor: 1, nome: "Melhorou" },
  { valor: 2, nome: "Melhorou muito" },
];

function Saude({ dados }: { dados: Dados }) {
  const r = dados.respostas;
  const { base, atual } = pilaresAtuais(dados);
  const [aberto, setAberto] = useState(false);
  const [notas, setNotas] = useState<Record<PilarId, number>>({
    nutricao: 0,
    pele: 0,
    comportamento: 0,
    mobilidade: 0,
    bucal: 0,
  });
  const plano = plano7Dias(r);
  const feitos = dados.plano7.filter(Boolean).length;

  function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    const pilares = { ...atual };
    ordemPilares.forEach((id) => {
      pilares[id] = Math.max(5, Math.min(98, atual[id] + notas[id] * 4));
    });
    atualizarDados((a) => ({
      ...a,
      checkins: [...a.checkins.filter((c) => c.data !== hoje()), { data: hoje(), pilares }],
    }));
    setAberto(false);
    setNotas({ nutricao: 0, pele: 0, comportamento: 0, mobilidade: 0, bucal: 0 });
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-[26px] font-extrabold">Saúde de {r.nomePet}</h1>

      <section className="fundo-escuro flex items-center gap-4 rounded-[18px] bg-coleira p-5 text-areia">
        <p className="font-display text-[52px] leading-none font-extrabold text-petisco">
          {calcularIndice(atual)}
          <span className="text-base text-menta">/100</span>
        </p>
        <p className="text-[13px] leading-snug">
          <span className="block font-bold">Índice de bem-estar</span>
          <span className="text-menta">
            Começou em {calcularIndice(base)} · {dados.checkins.length}{" "}
            {dados.checkins.length === 1 ? "check-in" : "check-ins"}
          </span>
        </p>
      </section>

      <Cartao className="flex flex-col gap-3">
        <Rotulo>Pilares</Rotulo>
        {ordemPilares.map((id) => (
          <Barra key={id} nome={pilarInfo[id].nome} de={base[id]} para={atual[id]} cor={coresPilar[id]} />
        ))}
      </Cartao>

      {aberto ? (
        <form onSubmit={salvar} className="entrada flex flex-col gap-4 rounded-[18px] border-2 border-faro bg-white p-5">
          <Rotulo className="text-faro-texto">Check-in da semana</Rotulo>
          <p className="text-[13px] text-casca">Comparando com a semana passada, como está {r.nomePet}?</p>
          {ordemPilares.map((id) => (
            <div key={id} className="flex flex-col gap-1.5">
              <label htmlFor={`checkin-${id}`} className="text-[13px] font-bold">
                {pilarInfo[id].pergunta}
              </label>
              <select
                id={`checkin-${id}`}
                value={notas[id]}
                onChange={(e) => setNotas((n) => ({ ...n, [id]: Number(e.target.value) }))}
                className="h-12 rounded-xl border-2 border-linha bg-white px-3 text-[15px] font-semibold focus:border-faro focus:outline-none"
              >
                {opcoesCheckin.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.nome}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setAberto(false)}
              className="h-12 flex-1 rounded-full border-2 border-linha text-sm font-bold text-casca"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-12 flex-[2] rounded-full bg-faro font-display text-[15px] font-extrabold text-areia"
            >
              Salvar check-in
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="h-[56px] rounded-full bg-faro font-display text-[17px] font-extrabold text-areia hover:bg-faro-escuro"
        >
          Fazer check-in da semana
        </button>
      )}

      <Cartao className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Rotulo>Plano de 7 dias: {plano.tema}</Rotulo>
          <p className="text-xs font-bold text-coleira">{feitos}/7</p>
        </div>
        <ol className="flex flex-col gap-2">
          {plano.dias.map((dia, i) => (
            <li key={dia.titulo}>
              <label className="flex cursor-pointer items-center gap-3 text-sm has-focus-visible:outline-[3px] has-focus-visible:outline-coleira">
                <input
                  type="checkbox"
                  checked={dados.plano7[i] ?? false}
                  onChange={() =>
                    atualizarDados((a) => ({ ...a, plano7: a.plano7.map((f, n) => (n === i ? !f : f)) }))
                  }
                  className="size-5 accent-[#0e7c7b]"
                />
                <span className={dados.plano7[i] ? "text-casca line-through" : "font-semibold"}>
                  D{i + 1} · {dia.titulo}
                </span>
              </label>
            </li>
          ))}
        </ol>
        <Link href="/mapa" className="text-[13px] font-bold text-coleira underline">
          Ver o plano completo no Mapa
        </Link>
      </Cartao>

      {dados.checkins.length > 0 && (
        <Cartao className="flex flex-col gap-2">
          <Rotulo>Histórico</Rotulo>
          <ul className="flex flex-col gap-1.5 text-sm">
            {[...dados.checkins].reverse().map((c) => (
              <li key={c.data} className="flex justify-between">
                <span>{dataCurta(c.data)}</span>
                <strong>{calcularIndice(c.pilares)}/100</strong>
              </li>
            ))}
          </ul>
        </Cartao>
      )}

      <p className="text-xs leading-relaxed text-casca">
        O índice é educativo e vem das suas respostas. Não substitui a avaliação do veterinário.
      </p>
    </div>
  );
}

function Perfil({ dados }: { dados: Dados }) {
  const r = dados.respostas;
  const [copiado, setCopiado] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  async function copiarLink() {
    const link = linkDeAcesso(window.location.origin, { v: 1, respostas: r, assinatura: dados.assinatura });
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  const linhas = [
    ["Pet", `${r.nomePet} (${r.especie})`],
    ["Porte", `${porteLabel[r.especie][r.porte].nome} · ${porteLabel[r.especie][r.porte].detalhe}`],
    ["Fase", `${faseLabel[r.fase].nome} · ${faseLabel[r.fase].detalhe}`],
    ["Foco", focoLabel(r.foco, r.especie)],
    ["Tutor", r.tutor],
    ["WhatsApp", r.whatsapp],
    ["Plano", dados.assinatura ? planos[dados.assinatura.plano].nome : "Sem box ativo"],
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-[26px] font-extrabold">Perfil</h1>
      <Cartao>
        <dl className="flex flex-col gap-2.5 text-sm">
          {linhas.map(([rotulo, valor]) => (
            <div key={rotulo} className="flex justify-between gap-4">
              <dt className="text-casca">{rotulo}</dt>
              <dd className="text-right font-bold first-letter:uppercase">{valor}</dd>
            </div>
          ))}
        </dl>
      </Cartao>

      <Cartao className="flex flex-col gap-3">
        <Rotulo>Seu acesso</Rotulo>
        <p className="text-[13px] leading-normal text-casca">
          Os dados ficam neste aparelho. Guarde o link para entrar em outro celular ou depois de limpar o navegador.
        </p>
        <button
          type="button"
          onClick={copiarLink}
          className="h-12 rounded-full bg-coleira font-display text-[15px] font-extrabold text-areia"
        >
          {copiado ? "Link copiado!" : "Copiar meu link de acesso"}
        </button>
        <p className="text-[13px] leading-normal text-casca">
          Para deixar o app na tela inicial: abra o menu do navegador e toque em “Adicionar à tela de início”.
        </p>
      </Cartao>

      <div className="flex flex-col gap-2.5">
        <Link
          href="/mapa"
          className="flex h-12 items-center justify-center rounded-full border-2 border-coleira text-[15px] font-bold text-coleira"
        >
          Ver o Mapa de {r.nomePet}
        </Link>
        <Link
          href="/quiz"
          className="flex h-12 items-center justify-center rounded-full border-2 border-linha text-[15px] font-bold text-casca"
        >
          Refazer a avaliação
        </Link>
        {confirmando ? (
          <div className="flex flex-col gap-2 rounded-[14px] border-2 border-[#b3261e] p-4">
            <p className="text-[13px] font-bold">Sair apaga os check-ins deste aparelho. Copiou o seu link?</p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmando(false)}
                className="h-11 flex-1 rounded-full border-2 border-linha text-sm font-bold"
              >
                Ficar
              </button>
              <button
                type="button"
                onClick={limparDados}
                className="h-11 flex-1 rounded-full bg-[#b3261e] text-sm font-bold text-white"
              >
                Sair e apagar
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmando(true)} className="h-12 text-[15px] font-bold text-[#b3261e]">
            Sair
          </button>
        )}
      </div>
      <p className="text-center text-xs text-palha">
        {site.nome} · {site.slogan}
      </p>
    </div>
  );
}

const abas: { id: Aba; nome: string; icone: React.ReactNode }[] = [
  { id: "inicio", nome: "Início", icone: <path d="M4 11 L 12 4 L 20 11 L 20 20 L 14 20 L 14 15 L 10 15 L 10 20 L 4 20 Z" /> },
  {
    id: "caixas",
    nome: "Caixas",
    icone: (
      <>
        <rect x="4" y="8" width="16" height="12" rx="2" />
        <path d="M4 11 L 20 11 M12 8 L 12 20" />
      </>
    ),
  },
  {
    id: "saude",
    nome: "Saúde",
    icone: <path d="M12 20 C 7 16, 3.5 12.5, 5 8.5 C 6.2 5.3, 10 5, 12 8 C 14 5, 17.8 5.3, 19 8.5 C 20.5 12.5, 17 16, 12 20 Z" />,
  },
  {
    id: "perfil",
    nome: "Perfil",
    icone: (
      <>
        <circle cx="12" cy="9" r="4" />
        <path d="M5 20 C 6 15.5, 18 15.5, 19 20" />
      </>
    ),
  },
];

export default function AppTutor() {
  const { carregado, dados } = useDados();
  const [aba, setAba] = useState<Aba>("inicio");

  // Quem chega pelo link pessoal entra direto; o código sai da barra de endereço.
  useEffect(() => {
    const achado = window.location.hash.match(/acesso=([A-Za-z0-9_-]+)/);
    if (!achado) return;
    const acesso = decodificarAcesso(achado[1]);
    if (acesso) importarAcesso(acesso);
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  if (!carregado) return <Carregando />;
  if (!dados) return <Entrada />;

  const r = dados.respostas;

  function irPara(nova: Aba) {
    setAba(nova);
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-[22px] pt-[22px] pb-3.5">
        <div>
          <Logo className="text-[22px]" />
          <p className="text-[13px] text-casca">
            Olá, {r.tutor} · tutor de <strong>{r.nomePet}</strong>
          </p>
        </div>
        <button
          type="button"
          onClick={() => irPara("perfil")}
          aria-label="Abrir perfil"
          className="flex size-[46px] items-center justify-center rounded-full bg-coleira font-display text-[19px] font-extrabold text-areia"
        >
          {r.nomePet.charAt(0).toUpperCase()}
        </button>
      </header>

      <main key={aba} className="entrada flex-1 px-[22px] pt-1.5 pb-6">
        {aba === "inicio" && <Inicio dados={dados} irPara={irPara} />}
        {aba === "caixas" && <Caixas dados={dados} />}
        {aba === "saude" && <Saude dados={dados} />}
        {aba === "perfil" && <Perfil dados={dados} />}
      </main>

      <nav
        aria-label="App"
        className="sticky bottom-0 flex items-center justify-around border-t-2 border-linha bg-white px-2.5 pt-2 pb-3"
      >
        {abas.map((item) => {
          const ativa = aba === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => irPara(item.id)}
              aria-current={ativa ? "page" : undefined}
              className={`flex min-w-16 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[11px] ${
                ativa ? "font-bold text-faro-texto" : "font-semibold text-palha"
              }`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {item.icone}
              </svg>
              {item.nome}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
