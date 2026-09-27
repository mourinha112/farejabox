import Image from "next/image";
import Link from "next/link";
import { GatoFareja, Logo, LogoLink, Pata, Trilha } from "@/components/brand";
import { depoimentos, faq, planos, site } from "@/lib/config";
import { suplementos } from "@/lib/diagnostico";
import { linkWhatsApp } from "@/lib/whatsapp";

const navegacao = [
  { href: "#como-funciona", nome: "Como funciona" },
  { href: "#box", nome: "Box do mês" },
  { href: "#gatos", nome: "Para gatos" },
  { href: "#ajuda", nome: "Ajuda" },
];

const passos = [
  {
    numero: "1",
    cor: "bg-coleira text-areia",
    titulo: "Conte sobre o seu pet",
    texto: "Porte, idade, pelagem, comportamento e queixas. A avaliação é gratuita e leva 2 minutos.",
  },
  {
    numero: "2",
    cor: "bg-faro text-areia",
    titulo: "Montamos o box dele",
    texto: "Petiscos naturais + o suplemento funcional certo: articulação, ansiedade, pelagem ou digestão.",
  },
  {
    numero: "3",
    cor: "bg-petisco text-focinho",
    titulo: "Chega todo mês",
    texto: "Caixa surpresa na porta, rastreio no WhatsApp e a saúde do pet acompanhada no App.",
  },
];

const dentroDaCaixa = [
  { titulo: "Petiscos naturais desidratados", texto: "De 4 a 6 por caixa, sem conservantes e sem corantes." },
  { titulo: "Suplemento funcional do mês", texto: "Escolhido pelo diagnóstico do seu pet." },
  { titulo: "Brinde surpresa", texto: "Porque farejar tem que valer a pena." },
  { titulo: "Cartinha do mês", texto: "Com o nome dele e a dica para usar o suplemento." },
];

const selos = ["100% natural, sem conservantes", "Montado por diagnóstico", "Cancele quando quiser", "Acompanhamento no App"];

function Etiqueta({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-xs font-bold uppercase tracking-[0.26em] ${className}`}>{children}</p>;
}

export default function Home() {
  return (
    <>
      <p className="bg-coleira px-5 py-2.5 text-center text-[13px] font-semibold tracking-[0.08em] text-areia">
        FRETE GRÁTIS ACIMA DE R${site.freteGratisAcima} · ENTREGA PARA TODO O BRASIL
      </p>

      <header className="sticky top-0 z-30 border-b-2 border-linha bg-areia">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-5 py-3.5 lg:px-14">
          <div className="flex items-baseline gap-2.5">
            <LogoLink className="text-[28px] sm:text-[30px] lg:text-[34px]" />
            <span className="hidden text-[10px] font-bold tracking-[0.26em] text-coleira sm:inline">BOX FUNCIONAL</span>
          </div>

          <nav aria-label="Principal" className="hidden items-center gap-7 text-[15px] font-semibold text-coleira lg:flex">
            {navegacao.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-coleira-escuro">
                {item.nome}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-4">
            <Link href="/app" className="hidden px-2 py-2 text-[15px] min-[360px]:block font-bold text-coleira hover:text-coleira-escuro">
              Entrar
            </Link>
            <Link
              href="/quiz"
              className="flex h-11 items-center rounded-full bg-faro px-4 font-display text-[15px] font-bold whitespace-nowrap text-areia hover:bg-faro-escuro sm:h-12 sm:px-6 sm:text-[17px]"
            >
              Montar meu box
            </Link>
          </div>
        </div>
        <nav
          aria-label="Seções"
          className="flex justify-between gap-3 overflow-x-auto border-t-2 border-linha px-5 py-2.5 text-[13px] font-semibold whitespace-nowrap text-coleira [scrollbar-width:none] sm:justify-start sm:gap-6 sm:text-sm lg:hidden [&::-webkit-scrollbar]:hidden"
        >
          {navegacao.map((item) => (
            <a key={item.href} href={item.href}>
              {item.nome}
            </a>
          ))}
        </nav>
      </header>

      <main>
        <section className="fundo-escuro relative overflow-hidden bg-faro">
          <Pata size={70} className="absolute top-8 left-6 -rotate-[16deg] text-areia opacity-[0.14]" />
          <Pata size={70} className="absolute right-8 bottom-16 rotate-[18deg] text-areia opacity-[0.14]" />
          <div className="relative mx-auto flex max-w-[1280px] flex-col items-center gap-6 px-5 pt-12 pb-14 lg:flex-row lg:gap-10 lg:px-14 lg:pt-16 lg:pb-[72px]">
            <div className="flex flex-col gap-5 lg:flex-[1.15]">
              <p className="text-[13px] font-bold tracking-[0.3em] text-faro-claro">SNIF SNIF... CHEGOU COISA BOA</p>
              <h1 className="font-display text-[42px] leading-[1.02] font-extrabold tracking-tight text-areia sm:text-[58px]">
                O box que seu pet fareja de longe.
              </h1>
              <p className="max-w-[480px] text-lg leading-relaxed text-faro-suave">
                Petiscos naturais + suplemento funcional, montados pelo diagnóstico do seu pet e entregues todo mês na
                sua porta.
              </p>
              <div className="mt-1.5 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-[18px]">
                <Link
                  href="/quiz"
                  className="flex h-[58px] items-center rounded-full bg-petisco px-8 font-display text-xl font-extrabold text-focinho hover:bg-[#ffd560]"
                >
                  Fazer a avaliação gratuita
                </Link>
                <p className="text-[13.5px] font-semibold text-faro-suave">2 minutos · resultado na hora</p>
              </div>
              <Trilha className="mt-2 hidden h-[52px] w-[380px] lg:block" />
            </div>
            <div className="flex items-center justify-center lg:flex-[0.85]">
              <Image
                src="/caixa-fareja.webp"
                alt="Caixa FAREJA laranja, com a lista do que vem dentro impressa na lateral"
                width={1100}
                height={751}
                priority
                sizes="(min-width: 1024px) 520px, 90vw"
                className="w-full max-w-[520px] drop-shadow-[0_22px_28px_rgba(42,30,23,0.35)]"
              />
            </div>
          </div>
        </section>

        <ul className="flex flex-wrap justify-center gap-x-10 gap-y-2 bg-petisco px-5 py-4 text-[13.5px] font-bold text-focinho">
          {selos.map((selo) => (
            <li key={selo}>{selo}</li>
          ))}
        </ul>

        <section id="como-funciona" className="mx-auto flex max-w-[1280px] flex-col gap-7 px-5 py-16 lg:px-14">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <Etiqueta className="text-faro-texto">Como funciona</Etiqueta>
            <h2 className="font-display text-[32px] leading-tight font-extrabold sm:text-[38px]">
              Do faro ao lar em 3 passos
            </h2>
          </div>
          <ol className="grid gap-5 md:grid-cols-3">
            {passos.map((passo) => (
              <li key={passo.numero} className="flex flex-col gap-3 rounded-[18px] border-2 border-linha bg-white p-[26px]">
                <span
                  className={`flex size-11 items-center justify-center rounded-xl font-display text-xl font-extrabold ${passo.cor}`}
                >
                  {passo.numero}
                </span>
                <h3 className="font-display text-[21px] font-bold">{passo.titulo}</h3>
                <p className="text-[14.5px] leading-relaxed text-casca">{passo.texto}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="box" className="fundo-escuro bg-coleira text-areia">
          <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-16 lg:grid-cols-2 lg:px-14">
            <div className="flex flex-col gap-4">
              <Etiqueta className="text-menta">Dentro desta caixa</Etiqueta>
              <h2 className="font-display text-[32px] leading-tight font-extrabold sm:text-[38px]">
                O conteúdo é surpresa. A curadoria, não.
              </h2>
              <p className="max-w-[480px] text-base leading-relaxed text-[#cfeae4]">
                Todo mês o box muda, mas sempre pelo mesmo critério: o diagnóstico do seu pet. O que você marca no App
                ajusta a próxima caixa.
              </p>
              <ul className="mt-2 flex flex-col gap-3.5">
                {dentroDaCaixa.map((item) => (
                  <li key={item.titulo} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-[26px] shrink-0 items-center justify-center rounded-lg bg-petisco">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                        <path d="M2.5 8 L 6 11.5 L 12.5 4" stroke="#2A1E17" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span>
                      <span className="block font-display text-[17px] font-bold">{item.titulo}</span>
                      <span className="block text-sm leading-normal text-[#cfeae4]">{item.texto}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <Etiqueta className="text-menta">O suplemento certo para cada queixa</Etiqueta>
              <ul className="grid gap-3.5 sm:grid-cols-2">
                {Object.values(suplementos).map((s) => (
                  <li key={s.nome} className="flex flex-col gap-1.5 rounded-2xl bg-areia p-5 text-focinho">
                    <span className="font-display text-lg leading-tight font-extrabold text-coleira">{s.nome}</span>
                    <span className="text-[13.5px] leading-normal text-casca">{s.descricao}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[13px] leading-relaxed text-[#cfeae4]">
                Suplemento é apoio nutricional, não medicamento. O diagnóstico FAREJA é educativo e não substitui a
                consulta com o veterinário.
              </p>
            </div>
          </div>
        </section>

        <section id="planos" className="mx-auto flex max-w-[1280px] flex-col gap-8 px-5 py-16 lg:px-14">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <Etiqueta className="text-faro-texto">Planos</Etiqueta>
            <h2 className="font-display text-[32px] leading-tight font-extrabold sm:text-[38px]">
              Escolha como ele vai farejar
            </h2>
          </div>
          <div className="grid items-stretch gap-6 lg:grid-cols-3">
            <article className="fundo-escuro flex flex-col gap-3.5 rounded-[22px] bg-coleira p-[34px] text-areia">
              <Etiqueta className="text-menta">{planos.mensal.nome}</Etiqueta>
              <p className="flex items-baseline gap-2">
                <span className="font-display text-[52px] leading-none font-extrabold">R${planos.mensal.preco}</span>
                <span className="font-semibold text-menta">{planos.mensal.detalhe}</span>
              </p>
              <ul className="flex flex-col gap-2 text-[14.5px] text-[#dff2ed]">
                {planos.mensal.itens.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link
                href="/quiz?plano=mensal"
                className="mt-auto flex h-[52px] items-center justify-center rounded-full bg-areia font-display text-[17px] font-extrabold text-coleira hover:bg-white"
              >
                Assinar mensal
              </Link>
            </article>

            <article className="relative flex flex-col gap-3.5 rounded-[22px] bg-petisco p-[34px] text-focinho">
              <p className="absolute -top-3.5 right-6 rounded-full bg-focinho px-4 py-1.5 text-xs font-bold tracking-[0.12em] text-petisco">
                MAIS FAREJADO
              </p>
              <Etiqueta className="text-[#6b4c0c]">{planos.trimestral.nome}</Etiqueta>
              <p className="flex flex-wrap items-baseline gap-2">
                <span className="font-display text-[52px] leading-none font-extrabold">R${planos.trimestral.preco}</span>
                <span className="font-semibold text-[#6b4c0c]">{planos.trimestral.detalhe}</span>
              </p>
              <ul className="flex flex-col gap-2 text-[14.5px] text-[#5c4a1e]">
                {planos.trimestral.itens.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link
                href="/quiz?plano=trimestral"
                className="mt-auto flex h-[52px] items-center justify-center rounded-full bg-focinho font-display text-[17px] font-extrabold text-petisco hover:bg-black"
              >
                Assinar trimestral
              </Link>
            </article>

            {depoimentos.length > 0 ? (
              <article className="flex flex-col gap-4 rounded-[22px] border-2 border-linha bg-white p-[34px]">
                <Etiqueta className="text-faro-texto">Quem já farejou</Etiqueta>
                <blockquote className="font-display text-[21px] leading-snug font-bold">
                  “{depoimentos[0].texto}”
                </blockquote>
                <div className="mt-auto flex items-center gap-3">
                  <span className="flex size-[46px] items-center justify-center rounded-full bg-coleira font-display text-lg font-extrabold text-areia">
                    {depoimentos[0].autor.charAt(0)}
                  </span>
                  <p>
                    <span className="block text-[14.5px] font-bold">{depoimentos[0].autor}</span>
                    <span className="block text-[12.5px] text-casca">{depoimentos[0].detalhe}</span>
                  </p>
                </div>
              </article>
            ) : (
              <article className="flex flex-col gap-4 rounded-[22px] border-2 border-linha bg-white p-[34px]">
                <Etiqueta className="text-faro-texto">Sem pegadinha</Etiqueta>
                <h3 className="font-display text-[24px] leading-tight font-extrabold">
                  Primeiro o diagnóstico, depois o box.
                </h3>
                <ul className="flex flex-col gap-2.5 text-[14.5px] leading-normal text-casca">
                  <li>A avaliação é gratuita e o resultado é seu, assinando ou não.</li>
                  <li>Você leva um plano de 7 dias para começar hoje, sem comprar nada.</li>
                  <li>Cancele quando quiser, sem multa.</li>
                </ul>
                <Link
                  href="/quiz"
                  className="mt-auto flex h-[52px] items-center justify-center rounded-full border-2 border-faro font-display text-[17px] font-extrabold text-faro-texto hover:bg-faro-suave"
                >
                  Começar pela avaliação
                </Link>
              </article>
            )}
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:px-14">
            <div className="flex justify-center">
              <div className="w-[270px] rounded-[38px] border-[9px] border-focinho bg-areia p-4 shadow-[0_24px_48px_rgba(42,30,23,0.18)]">
                <div className="flex items-center justify-between">
                  <Logo className="text-lg" />
                  <span className="flex size-8 items-center justify-center rounded-full bg-coleira font-display text-sm font-extrabold text-areia">
                    T
                  </span>
                </div>
                <div className="mt-3 rounded-2xl bg-faro p-3.5 text-areia">
                  <p className="text-[9px] font-bold tracking-[0.2em] text-faro-claro">PRÓXIMA CAIXA</p>
                  <p className="mt-1 font-display text-lg font-extrabold">Acompanhe a entrega</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-faro-escuro">
                    <div className="h-full w-[70%] rounded-full bg-petisco" />
                  </div>
                </div>
                <div className="mt-3 rounded-2xl border-2 border-linha bg-white p-3.5">
                  <p className="text-[9px] font-bold tracking-[0.2em] text-mel">SAÚDE DO PET</p>
                  {[
                    { nome: "Pele e pelagem", largura: "w-[58%]", cor: "bg-faro" },
                    { nome: "Saúde bucal", largura: "w-[66%]", cor: "bg-coleira" },
                    { nome: "Mobilidade", largura: "w-[80%]", cor: "bg-petisco" },
                  ].map((barra) => (
                    <div key={barra.nome} className="mt-2.5">
                      <p className="text-[11px] font-bold">{barra.nome}</p>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-linha">
                        <div className={`h-full rounded-full ${barra.largura} ${barra.cor}`} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 rounded-xl bg-petisco py-2.5 text-center font-display text-[13px] font-bold">
                  Check-in da semana
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <Etiqueta className="text-coleira">App do tutor</Etiqueta>
              <h2 className="font-display text-[32px] leading-tight font-extrabold sm:text-[38px]">
                A saúde dele na palma da sua mão.
              </h2>
              <p className="max-w-[480px] text-base leading-relaxed text-casca">
                Depois da avaliação você ganha acesso ao app: acompanha a caixa, registra a dose diária do suplemento e
                faz o check-in semanal que mostra a evolução de cada pilar.
              </p>
              <ul className="flex flex-col gap-2 text-[15px] font-semibold">
                <li>Rastreio da caixa do mês</li>
                <li>Índice de bem-estar com histórico</li>
                <li>Plano de 7 dias e dose diária</li>
                <li>Atendimento direto no WhatsApp</li>
              </ul>
              <div className="mt-2 flex flex-wrap gap-3">
                <Link
                  href="/app"
                  className="flex h-[52px] items-center rounded-full bg-coleira px-7 font-display text-[17px] font-extrabold text-areia hover:bg-coleira-escuro"
                >
                  Acessar o app
                </Link>
                <Link
                  href="/quiz"
                  className="flex h-[52px] items-center rounded-full border-2 border-coleira px-7 font-display text-[17px] font-extrabold text-coleira hover:bg-menta-suave"
                >
                  Ainda não fiz a avaliação
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="gatos" className="mx-auto max-w-[1280px] px-5 py-16 lg:px-14">
          <div className="relative overflow-hidden rounded-[22px] bg-petisco">
            <Pata size={64} className="absolute top-7 right-[38%] hidden rotate-[14deg] text-focinho opacity-[0.08] sm:block" />
            <Pata size={46} className="absolute bottom-8 left-[46%] hidden -rotate-[18deg] text-focinho opacity-[0.08] lg:block" />
            <svg
              viewBox="0 0 300 60"
              fill="none"
              aria-hidden="true"
              className="absolute right-[250px] bottom-6 hidden w-[300px] lg:block"
            >
              <path
                d="M6 44 C 60 44, 56 14, 110 14 C 164 14, 156 42, 210 38 C 250 35, 262 22, 294 24"
                stroke="#0E7C7B"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeDasharray="1 13"
              />
            </svg>
            <GatoFareja className="absolute right-3 -bottom-1 w-[150px] sm:right-8 sm:w-[230px] lg:right-14 lg:w-[290px]" />
            <div className="relative flex flex-col items-start gap-4 p-8 pb-44 sm:p-11 sm:pr-[280px] lg:pr-[380px]">
              <Etiqueta className="text-coleira-escuro">Para gatos</Etiqueta>
              <h2 className="font-display text-[30px] leading-tight font-extrabold sm:text-[36px]">
                Gato também fareja. E como.
              </h2>
              <p className="max-w-[620px] text-base leading-relaxed text-[#5c4a1e]">
                Na avaliação você escolhe gato e o diagnóstico muda junto: porções menores, texturas que felino aceita e
                o suplemento escolhido pela queixa dele, da pelagem ao estresse.
              </p>
              <Link
                href="/quiz"
                className="flex h-[52px] items-center rounded-full bg-coleira px-7 font-display text-[17px] font-extrabold text-areia hover:bg-coleira-escuro"
              >
                Avaliar meu gato
              </Link>
            </div>
          </div>
        </section>

        <section id="ajuda" className="mx-auto flex max-w-[860px] flex-col gap-7 px-5 pb-16">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <Etiqueta className="text-faro-texto">Ajuda</Etiqueta>
            <h2 className="font-display text-[32px] leading-tight font-extrabold sm:text-[38px]">Perguntas frequentes</h2>
          </div>
          <div className="flex flex-col gap-3">
            {faq.map((item) => (
              <details key={item.pergunta} className="group rounded-2xl border-2 border-linha bg-white px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold">
                  {item.pergunta}
                  <span aria-hidden="true" className="text-2xl leading-none text-faro transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="pt-3 text-[15px] leading-relaxed text-casca">{item.resposta}</p>
              </details>
            ))}
          </div>
          <p className="text-center text-[15px] text-casca">
            Não achou sua dúvida?{" "}
            <a
              href={linkWhatsApp("Oi, FAREJA! Tenho uma dúvida sobre o box.")}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-coleira underline hover:text-coleira-escuro"
            >
              Fale com a gente no WhatsApp
            </a>
            . Gente de verdade responde.
          </p>
        </section>

        <section className="fundo-escuro relative overflow-hidden bg-faro px-5 py-16 text-center">
          <Pata size={70} className="absolute top-10 left-[8%] -rotate-[16deg] text-areia opacity-[0.14]" />
          <Pata size={70} className="absolute right-[8%] bottom-10 rotate-[14deg] text-areia opacity-[0.14]" />
          <div className="relative mx-auto flex max-w-[640px] flex-col items-center gap-5">
            <h2 className="font-display text-[34px] leading-tight font-extrabold text-areia sm:text-[44px]">
              Bora descobrir o que o seu pet precisa?
            </h2>
            <p className="text-lg text-faro-suave">Avaliação gratuita, resultado na hora e cupom de primeiro box.</p>
            <Link
              href="/quiz"
              className="flex h-[58px] items-center rounded-full bg-petisco px-9 font-display text-xl font-extrabold text-focinho hover:bg-[#ffd560]"
            >
              Fazer a avaliação gratuita
            </Link>
          </div>
        </section>
      </main>

      <footer className="fundo-escuro bg-focinho text-areia">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-5 px-5 py-7 lg:flex-row lg:items-center lg:justify-between lg:px-14">
          <p className="flex flex-wrap items-baseline gap-2.5">
            <Logo className="text-2xl" />
            <span className="font-display text-[15px] font-semibold text-petisco">{site.slogan}</span>
          </p>
          <nav aria-label="Rodapé" className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[#c9bbae]">
            <a
              href={linkWhatsApp("Oi, FAREJA!")}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-areia"
            >
              WhatsApp
            </a>
            <a
              href={`https://instagram.com/${site.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-areia"
            >
              Instagram
            </a>
            <Link href="/app" className="hover:text-areia">
              App do tutor
            </Link>
            <Link href="/trocas" className="hover:text-areia">
              Trocas e cancelamento
            </Link>
            <Link href="/privacidade" className="hover:text-areia">
              Privacidade
            </Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
