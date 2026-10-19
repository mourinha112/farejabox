"use client";

import Link from "next/link";
import { Logo } from "@/components/brand";
import { Carregando, SemCadastro } from "@/components/SemCadastro";
import { planos, site } from "@/lib/config";
import {
  diagnosticar,
  faseLabel,
  focoLabel,
  nivelPilar,
  nuncaNoPote,
  ordemPilares,
  pilarInfo,
  plano7Dias,
  porteLabel,
  protocolo,
  suplementos,
} from "@/lib/diagnostico";
import { avisarInteresse } from "@/lib/funil";
import { atualizarDados, useDados } from "@/lib/storage";

function Rodape({ pagina }: { pagina: number }) {
  return (
    <div className="mt-auto flex items-center justify-between border-t-2 border-linha pt-4 text-xs text-casca">
      <span className="font-display text-sm font-bold text-faro-texto">{site.slogan}</span>
      <span>
        página {pagina} de 3 · {site.dominio}
      </span>
    </div>
  );
}

const folha =
  "folha mx-auto flex min-h-[1040px] w-full max-w-[794px] flex-col gap-6 rounded-[20px] bg-white p-7 shadow-[0_10px_40px_rgba(42,30,23,0.1)] sm:p-11";

export default function Mapa() {
  const { carregado, dados } = useDados();

  if (!carregado) return <Carregando />;
  if (!dados) {
    return (
      <SemCadastro
        titulo="O Mapa começa pelo perfil do pet"
        texto="Complete as 4 etapas para conhecer o perfil do seu pet. Depois, você pode salvar o Mapa com o plano de 7 dias."
      />
    );
  }

  const r = dados.respostas;
  const d = diagnosticar(r);
  const plano = plano7Dias(r);
  const suplemento = suplementos[d.suplemento];
  const planoPedido = dados.planoInteresse ?? "trimestral";
  const planoEscolhido = planos[planoPedido];
  const data = new Date(dados.criadoEm).toLocaleDateString("pt-BR");

  function marcarDia(indice: number) {
    atualizarDados((atual) => ({
      ...atual,
      plano7: atual.plano7.map((feito, i) => (i === indice ? !feito : feito)),
    }));
  }

  return (
    <div className="flex flex-1 flex-col gap-6 bg-linha px-3 py-6 print:gap-0 print:p-0">
      <div className="nao-imprimir mx-auto flex w-full max-w-[794px] flex-wrap items-center justify-between gap-3">
        <Link href="/app" className="text-sm font-bold text-coleira underline">
          Abrir o app do tutor
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex h-11 items-center rounded-full bg-focinho px-6 font-display text-[15px] font-bold text-areia hover:bg-black"
        >
          Salvar em PDF
        </button>
      </div>

      <section className={folha} aria-labelledby="mapa-titulo">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Logo className="text-[30px]" />
            <p className="mt-1 text-[11px] font-bold tracking-[0.24em] text-coleira">PERFIL DO PET</p>
          </div>
          <p className="text-right text-xs text-casca">
            {data} · protocolo {protocolo(r, dados.criadoEm)}
          </p>
        </div>

        <div>
          <h1 id="mapa-titulo" className="font-display text-[40px] leading-none font-extrabold sm:text-[52px]">
            O Mapa de {r.nomePet}
          </h1>
          <p className="mt-3 max-w-[560px] text-sm leading-relaxed text-casca">
            Preparado a partir das respostas de {r.tutor} sobre {r.nomePet}. Este material é educativo e não substitui a
            consulta com o veterinário.
          </p>
        </div>

        <ul className="flex flex-wrap gap-2 text-[13px] font-bold">
          {[
            r.especie === "gato" ? "Gato" : "Cachorro",
            `Porte ${porteLabel[r.especie][r.porte].nome.toLowerCase()}`,
            `${faseLabel[r.fase].nome} · ${faseLabel[r.fase].detalhe}`,
            `Foco: ${focoLabel(r.foco, r.especie).toLowerCase()}`,
          ].map((item) => (
            <li key={item} className="rounded-full bg-areia px-4 py-2">
              {item}
            </li>
          ))}
        </ul>

        <div className="grid gap-5 sm:grid-cols-[220px_1fr]">
          <div className="flex flex-col items-center justify-center gap-1 rounded-[18px] bg-faro p-6 text-center text-areia">
            <p className="text-[11px] font-bold tracking-[0.22em] text-faro-claro">ÍNDICE DE BEM-ESTAR</p>
            <p className="font-display text-[76px] leading-none font-extrabold">
              {d.indice}
              <span className="text-xl text-faro-claro">/100</span>
            </p>
            <p className="font-display text-lg font-bold text-petisco">{d.leitura}</p>
          </div>
          <ul className="flex flex-col justify-center gap-3">
            {ordemPilares.map((id) => {
              const valor = d.pilares[id];
              const atencao = nivelPilar(valor) === "atencao";
              return (
                <li key={id}>
                  <p className="flex justify-between text-[13.5px] font-bold">
                    <span>{pilarInfo[id].nome}</span>
                    <span className={atencao ? "text-faro-texto" : "text-coleira"}>
                      {valor}
                      {atencao ? " · atenção" : ""}
                    </span>
                  </p>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-linha">
                    <div
                      className={`h-full rounded-full ${atencao ? "bg-faro" : "bg-coleira"}`}
                      style={{ width: `${valor}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-[18px] bg-areia p-6">
          <p className="text-[11px] font-bold tracking-[0.22em] text-faro-texto">LEITURA DO RESULTADO</p>
          <p className="mt-2 text-[15px] leading-relaxed">{d.analise}</p>
          <p className="mt-3 text-[15px] leading-relaxed">
            Na próxima página está o <strong>plano gratuito de 7 dias</strong> para começar hoje, sem gastar nada, e a
            lista do que nunca pode entrar no pote.
          </p>
        </div>
        <Rodape pagina={1} />
      </section>

      <section className={folha} aria-labelledby="plano-titulo">
        <div>
          <p className="text-[11px] font-bold tracking-[0.24em] text-coleira uppercase">O Mapa de {r.nomePet}</p>
          <h2 id="plano-titulo" className="mt-1 font-display text-[32px] leading-tight font-extrabold">
            Plano gratuito de 7 dias: {plano.tema}
          </h2>
          <p className="mt-1 text-sm text-casca">Comece hoje, sem comprar nada. Marque cada dia concluído.</p>
        </div>

        <ol className="flex flex-col gap-2.5">
          {plano.dias.map((dia, i) => (
            <li key={dia.titulo}>
              <label
                className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border-2 p-4 has-focus-visible:outline-[3px] has-focus-visible:outline-coleira ${
                  dados.plano7[i] ? "border-coleira bg-menta-suave" : "border-linha bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={dados.plano7[i] ?? false}
                  onChange={() => marcarDia(i)}
                  className="sr-only"
                />
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl font-display text-base font-extrabold ${
                    dados.plano7[i] ? "bg-coleira text-areia" : "bg-petisco text-focinho"
                  }`}
                >
                  {dados.plano7[i] ? "✓" : `D${i + 1}`}
                </span>
                <span className="text-[14px] leading-normal">
                  <strong className="font-display text-base">{dia.titulo}</strong> {dia.texto}
                </span>
              </label>
            </li>
          ))}
        </ol>

        <div className="rounded-[18px] bg-focinho p-6 text-areia">
          <p className="text-[11px] font-bold tracking-[0.22em] text-petisco uppercase">
            Nunca no pote de {r.nomePet}
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm font-semibold sm:grid-cols-3">
            {nuncaNoPote(r.especie).map((item) => (
              <li key={item}>✕ {item}</li>
            ))}
          </ul>
          <p className="mt-3 text-[13px] text-[#c9bbae]">Ingeriu algum destes? Procure um veterinário imediatamente.</p>
        </div>
        <Rodape pagina={2} />
      </section>

      <section className={folha} aria-labelledby="box-titulo">
        <div>
          <p className="text-[11px] font-bold tracking-[0.24em] text-coleira uppercase">O Mapa de {r.nomePet}</p>
          <h2 id="box-titulo" className="mt-1 font-display text-[32px] leading-tight font-extrabold">
            Se quiser reforço, já farejamos por você
          </h2>
          <p className="mt-2 max-w-[600px] text-sm leading-relaxed text-casca">
            O plano de 7 dias resolve a rotina. Para o reforço nutricional contínuo, montamos um box com o foco exato do
            perfil de {r.nomePet}, sem você precisar pesquisar nada.
          </p>
        </div>

        <div className="rounded-[18px] bg-areia p-6">
          <p className="text-[11px] font-bold tracking-[0.22em] text-faro-texto uppercase">
            Por que este box para {r.nomePet}
          </p>
          <ol className="mt-3 flex flex-col gap-3">
            {d.motivos.map((motivo, i) => (
              <li key={motivo} className="flex gap-3 text-[14.5px] leading-normal">
                <span className="font-display text-lg leading-none font-extrabold text-faro-texto">{i + 1}.</span>
                {motivo}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-[13px] font-semibold text-coleira">
            Todo mês o box se ajusta: o que você marca no App muda a próxima caixa.
          </p>
        </div>

        <div className="fundo-escuro rounded-[18px] bg-coleira p-6 text-areia">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-bold tracking-[0.22em] text-menta uppercase">Box de {r.nomePet}</p>
            <p className="rounded-full bg-petisco px-3 py-1 text-[11px] font-bold text-focinho">
              FEITO PARA ELE
            </p>
          </div>
          <ul className="mt-3 flex flex-col gap-1.5 text-sm text-[#dff2ed]">
            <li>· 4 a 6 petiscos naturais desidratados</li>
            <li>· Suplemento sugerido: {suplemento.nome}, a validar pela equipe FAREJA</li>
            <li>· Brinde surpresa + cartinha de {r.nomePet}</li>
            <li>· Rastreio e saúde no App</li>
          </ul>
          <p className="mt-4 flex flex-wrap items-baseline gap-2">
            <span className="font-display text-[40px] leading-none font-extrabold text-petisco">
              R${planoEscolhido.porMes}
            </span>
            <span className="text-sm text-menta">
              /mês no plano {planoPedido}
            </span>
          </p>
          <p className="mt-2 text-sm text-menta">
            {planoPedido === "trimestral"
              ? `R$${planoEscolhido.preco} no total a cada 3 meses. `
              : `Cobrança mensal de R$${planoEscolhido.preco}. `}
            Frete grátis.
          </p>
          <Link
            href={`/checkout?plano=${planoPedido}`}
            onClick={() => avisarInteresse(r.whatsapp, planoPedido, "mapa")}
            className="nao-imprimir mt-4 flex h-[54px] items-center justify-center rounded-full bg-petisco font-display text-lg font-extrabold text-focinho hover:bg-[#ffd560]"
          >
            Continuar para o checkout
          </Link>
          <p className="mt-2 text-center text-xs text-menta">Seu perfil já está preenchido. Agora só faltam seus dados e a entrega.</p>
        </div>

        <p className="text-[13px] leading-relaxed text-casca">
          <strong className="text-focinho">Importante:</strong> a avaliação de preferências e necessidades da FAREJA é
          educativa e baseada nas suas respostas. Ela não substitui consulta, exame ou tratamento veterinário. Coceira
          intensa, feridas, apatia ou mudança brusca de comportamento pedem um profissional. Suplementos são apoio
          nutricional, não medicamento. Quem valida o box é a curadoria FAREJA, a partir do perfil do pet.
        </p>
        <Rodape pagina={3} />
      </section>
    </div>
  );
}
