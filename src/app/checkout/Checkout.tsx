"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { IconeWhatsApp, LogoLink, Pata } from "@/components/brand";
import { Carregando } from "@/components/SemCadastro";
import { planos, site, type PlanoId } from "@/lib/config";
import { usePerfilCheckout } from "@/lib/checkout-storage";
import { diagnosticar, faseLabel, porteLabel, suplementos, type Respostas } from "@/lib/diagnostico";
import { formatarDinheiro, normalizarWhatsApp, validarPedido, type ClientePedido, type CriarPedidoEntrada, type EnderecoPedido, type MetodoPagamento, type ReciboPedido } from "@/lib/pedido";
import { atualizarCadastro, salvarDados, useDados } from "@/lib/storage";
import { linkWhatsApp, mascaraWhatsApp } from "@/lib/whatsapp";

const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
const CAMPOS = ["nome", "email", "whatsapp", "cep", "logradouro", "numero", "bairro", "cidade", "uf"] as const;
type CampoId = (typeof CAMPOS)[number] | "complemento";
type Erros = Partial<Record<CampoId, string>>;
type Rascunho = {
  cliente: ClientePedido;
  endereco: EnderecoPedido;
  plano: PlanoId;
  metodoPagamento: MetodoPagamento;
  notificarWhatsApp: boolean;
};
type Tentativa = { conteudo: string; chave: string; recibo?: ReciboPedido };
type TentativaRestaurada = { tentativa: Tentativa; entrada: CriarPedidoEntrada };

const botaoPrincipal = "flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-faro px-5 py-3 font-display text-lg font-extrabold text-areia transition-colors hover:bg-faro-escuro disabled:cursor-not-allowed disabled:opacity-50";
const botaoTexto = "rounded-md text-sm font-bold text-coleira underline decoration-coleira/30 underline-offset-4 hover:decoration-coleira";
const inputClasse = "h-12 w-full min-w-0 rounded-xl border-2 bg-white px-3.5 text-base text-focinho transition-colors placeholder:text-palha focus:border-coleira focus:outline-none";

function lerSessao<T>(chave: string): T | null {
  try {
    const valor = window.sessionStorage.getItem(chave);
    return valor ? JSON.parse(valor) as T : null;
  } catch {
    return null;
  }
}

function guardarSessao(chave: string, valor: unknown) {
  try { window.sessionStorage.setItem(chave, JSON.stringify(valor)); } catch { /* O formulário continua em memória. */ }
}

function identidadePet(respostas: Respostas): string {
  return JSON.stringify([
    respostas.especie, respostas.nomePet.trim().toLocaleLowerCase(), respostas.porte, respostas.fase,
    respostas.foco, respostas.frequencia, respostas.alimentacao, respostas.atividade, respostas.mastigacao,
  ]);
}

function chaveDoCheckout(respostas: Respostas): string {
  return `fareja:checkout:${identidadePet(respostas)}:${normalizarWhatsApp(respostas.whatsapp || "")}`;
}

function conteudoDoPedido(entrada: CriarPedidoEntrada): string {
  return JSON.stringify({
    plano: entrada.plano, respostas: entrada.respostas, cliente: entrada.cliente, endereco: entrada.endereco,
    metodoPagamento: entrada.metodoPagamento, notificarWhatsApp: entrada.notificarWhatsApp,
  });
}

function reciboValido(valor: unknown, entrada: CriarPedidoEntrada): valor is ReciboPedido {
  if (!valor || typeof valor !== "object") return false;
  const r = valor as Partial<ReciboPedido>;
  return typeof r.id === "string" && /^FJ-[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(r.id) &&
    typeof r.criadoEm === "string" && Number.isFinite(Date.parse(r.criadoEm)) && r.plano === entrada.plano &&
    r.subtotalCentavos === Math.round(planos[entrada.plano].preco * 100) && r.freteCentavos === 0 && r.totalCentavos === r.subtotalCentavos &&
    r.status === "aguardando_pagamento" && r.pagamento?.status === "aguardando_integracao" && r.pagamento.metodo === entrada.metodoPagamento &&
    typeof r.notificacao === "string" && ["enviada", "pendente", "nao_solicitada", "nao_configurada"].includes(r.notificacao);
}

function restaurarTentativa(chaveSessao: string, respostas: Respostas): TentativaRestaurada | null {
  try {
    const salva = lerSessao<Tentativa>(`${chaveSessao}:tentativa`);
    if (!salva || typeof salva.conteudo !== "string") return null;
    const validacao = validarPedido({ ...JSON.parse(salva.conteudo), chaveIdempotencia: salva.chave });
    if (!validacao.ok || identidadePet(validacao.valor.respostas) !== identidadePet(respostas)) return null;
    const recibo = reciboValido(salva.recibo, validacao.valor) ? salva.recibo : undefined;
    return { entrada: validacao.valor, tentativa: { conteudo: conteudoDoPedido(validacao.valor), chave: validacao.valor.chaveIdempotencia, recibo } };
  } catch { return null; }
}

function rascunhoDaEntrada(entrada: CriarPedidoEntrada): Rascunho {
  return {
    cliente: { ...entrada.cliente, whatsapp: mascaraWhatsApp(entrada.cliente.whatsapp.slice(2)) },
    endereco: entrada.endereco, plano: entrada.plano, metodoPagamento: entrada.metodoPagamento,
    notificarWhatsApp: entrada.notificarWhatsApp,
  };
}

function perfilCompleto(r: Respostas): boolean {
  return !!r.nomePet?.trim() && ["cachorro", "gato"].includes(r.especie) &&
    ["pequeno", "medio", "grande", "gigante"].includes(r.porte) && ["filhote", "adulto", "senior"].includes(r.fase) &&
    ["pelagem", "ansiedade", "articulacao", "digestao", "bucal", "mimar"].includes(r.foco) &&
    ["as-vezes", "toda-semana", "todo-dia"].includes(r.frequencia) && ["racao", "mista", "natural", "caseira"].includes(r.alimentacao) &&
    ["baixa", "media", "alta"].includes(r.atividade) && ["roedor", "moderado", "delicado"].includes(r.mastigacao);
}

function Cabecalho() {
  return (
    <header className="border-b-2 border-linha bg-areia">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <LogoLink className="text-[29px]" />
        <span className="flex items-center gap-2 text-xs font-bold text-coleira sm:text-sm"><Pata size={22} /> O próximo mimo começa aqui</span>
      </div>
    </header>
  );
}

function Cartao({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[22px] border-2 border-linha bg-white p-5 sm:p-7 ${className}`}>{children}</section>;
}

function Campo({ id, rotulo, erro, className = "", ...props }: InputHTMLAttributes<HTMLInputElement> & { id: CampoId; rotulo: string; erro?: string; className?: string }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label htmlFor={id} className="mb-2 block text-[13px] font-bold">{rotulo}</label>
      <input {...props} id={id} name={id} aria-invalid={!!erro} aria-describedby={erro ? `${id}-erro` : undefined} className={`${inputClasse} ${erro ? "border-faro-texto" : "border-linha"}`} />
      {erro && <p id={`${id}-erro`} className="mt-1.5 text-xs font-semibold text-faro-texto">{erro}</p>}
    </div>
  );
}

function SelecionarPlano({ plano, aoMudar, desabilitado = false }: { plano: PlanoId; aoMudar: (plano: PlanoId) => void; desabilitado?: boolean }) {
  return (
    <fieldset disabled={desabilitado}>
      <legend className="mb-3 font-display text-xl font-extrabold">Escolha o seu ritmo</legend>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {(["mensal", "trimestral"] as PlanoId[]).map((id) => (
          <label key={id} className={`relative flex cursor-pointer flex-col gap-1 rounded-2xl border-2 p-3.5 has-focus-visible:outline-[3px] has-focus-visible:outline-offset-2 has-focus-visible:outline-coleira sm:p-4 ${plano === id ? "border-coleira bg-menta-suave" : "border-linha bg-white"}`}>
            <span className="flex items-center justify-between gap-2 text-sm font-bold">
              {id === "mensal" ? "Mensal" : "Trimestral"}
              <input type="radio" name="plano" value={id} checked={plano === id} onChange={() => aoMudar(id)} className="size-4 shrink-0 accent-coleira" />
            </span>
            <span className="font-display text-[28px] leading-tight font-extrabold">{formatarDinheiro(planos[id].preco * 100)}</span>
            <span className="text-xs leading-relaxed text-casca">{id === "mensal" ? "1 caixa por mês" : "3 caixas · uma por mês"}</span>
            <span className="text-[11px] leading-relaxed text-casca">{id === "mensal" ? "Valor mensal" : `${formatarDinheiro(planos[id].porMes * 100)} por caixa`}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Resumo({ respostas, plano, ocultarMobile = false }: { respostas: Respostas; plano: PlanoId; ocultarMobile?: boolean }) {
  const sugestao = suplementos[diagnosticar(respostas).suplemento];
  const valor = planos[plano].preco * 100;
  return (
    <aside className={`${ocultarMobile ? "hidden lg:flex" : "flex"} flex-col gap-4 lg:sticky lg:top-7`} aria-label="Resumo do pedido">
      <div className="overflow-hidden rounded-[24px] border-2 border-linha bg-white">
        <div className="flex items-center gap-3 border-b-2 border-linha bg-petisco-suave px-5 py-5">
          <Image src="/caixa-fareja.webp" alt="Caixa FAREJA" width={112} height={102} className="h-24 w-28 shrink-0 object-contain" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-[0.18em] text-mel">FEITO PARA</p>
            <h2 className="mt-1 break-words font-display text-[28px] leading-tight font-extrabold">{respostas.nomePet}</h2>
            <p className="mt-1 text-xs text-casca">{porteLabel[respostas.especie][respostas.porte].nome} · {faseLabel[respostas.fase].nome}</p>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <h3 className="font-display text-xl font-bold">Um box, muitos bons momentos.</h3>
          <ul className="mt-4 flex flex-col gap-3 text-[13px] leading-relaxed">
            {["4 a 6 petiscos naturais", `Suplemento sugerido: ${sugestao.nome}`, "Brinde surpresa + cartinha personalizada"].map((item) => (
              <li key={item} className="flex items-start gap-2.5"><span className="mt-0.5 font-bold text-coleira" aria-hidden="true">✓</span><span>{item}</span></li>
            ))}
          </ul>
          <p className="mt-4 rounded-xl bg-areia p-3 text-xs leading-relaxed text-casca">A equipe FAREJA valida a seleção dos suplementos pelo perfil do pet antes do envio.</p>
          <dl className="mt-5 flex flex-col gap-3 border-t-2 border-dashed border-linha-forte pt-5 text-sm">
            <div className="flex justify-between gap-3"><dt>{plano === "mensal" ? "Box mensal" : "Trimestre · 3 caixas"}</dt><dd className="font-bold">{formatarDinheiro(valor)}</dd></div>
            <div className="flex justify-between gap-3"><dt>Entrega</dt><dd className="font-bold text-coleira">Grátis</dd></div>
            <div className="mt-1 flex items-center justify-between gap-3 border-t-2 border-linha pt-4"><dt className="font-bold">Total do pedido</dt><dd className="font-display text-[32px] leading-none font-extrabold">{formatarDinheiro(valor)}</dd></div>
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-casca">{plano === "mensal" ? `${formatarDinheiro(valor)} por mês. Cancelamento livre antes da próxima cobrança.` : `${formatarDinheiro(valor)} pelo trimestre, com uma caixa por mês. Equivale a ${formatarDinheiro(planos[plano].porMes * 100)} por caixa.`}</p>
        </div>
      </div>
      <a href={linkWhatsApp("Oi, FAREJA! Preciso de ajuda com meu pedido no site.")} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-lg py-2 text-[13px] font-bold text-coleira"><IconeWhatsApp size={19} /> Precisa de uma patinha? Fale com a equipe</a>
    </aside>
  );
}

export default function Checkout({ planoInicial, perfilNovo }: { planoInicial?: PlanoId; perfilNovo: boolean }) {
  const cadastro = useDados();
  const rascunho = usePerfilCheckout();
  if (!cadastro.carregado || !rascunho.carregado) return <Carregando />;

  const respostas = perfilNovo ? rascunho.perfil?.respostas : cadastro.dados?.respostas;
  const plano = planoInicial ?? (perfilNovo ? rascunho.perfil?.plano : cadastro.dados?.planoInteresse) ?? "mensal";
  if (!respostas || !perfilCompleto(respostas)) {
    return (
      <div className="min-h-dvh"><Cabecalho /><main className="mx-auto flex max-w-xl flex-col items-center gap-5 px-6 py-20 text-center">
        <Pata size={64} className="text-faro" />
        <h1 className="font-display text-4xl leading-tight font-extrabold">Primeiro, vamos conhecer seu pet.</h1>
        <p className="text-base leading-relaxed text-casca">São 4 etapas rápidas para montar a seleção. Depois você volta aqui para informar a entrega e revisar seu pedido.</p>
        <Link href={`/assinar?plano=${plano}`} className={`${botaoPrincipal} mt-2`}>Personalizar meu box</Link>
        <Link href="/app" className={botaoTexto}>Já tenho um perfil. Abrir meu app</Link>
      </main></div>
    );
  }

  const salvo = cadastro.dados?.respostas;
  const mesmoPet = salvo?.nomePet.trim().toLocaleLowerCase() === respostas.nomePet.trim().toLocaleLowerCase() && salvo?.especie === respostas.especie;
  const contato = { nome: respostas.tutor || (mesmoPet ? salvo?.tutor : "") || "", whatsapp: respostas.whatsapp || (mesmoPet ? salvo?.whatsapp : "") || "" };
  return <FormularioCheckout key={chaveDoCheckout(respostas)} respostas={respostas} planoInicial={plano} contato={contato} />;
}

function FormularioCheckout({ respostas, planoInicial, contato }: { respostas: Respostas; planoInicial: PlanoId; contato: { nome: string; whatsapp: string } }) {
  const chaveSessao = chaveDoCheckout(respostas);
  const [restaurada] = useState(() => restaurarTentativa(chaveSessao, respostas));
  const [rascunho, setRascunho] = useState<Rascunho>(() => {
    // O plano do pedido já enviado prevalece sobre uma query antiga na URL.
    if (restaurada) return rascunhoDaEntrada(restaurada.entrada);
    const salvo = lerSessao<Partial<Rascunho>>(chaveSessao);
    const telefone = contato.whatsapp.replace(/\D/g, "");
    return {
      cliente: { nome: salvo?.cliente?.nome ?? contato.nome, email: salvo?.cliente?.email ?? "", whatsapp: salvo?.cliente?.whatsapp ?? mascaraWhatsApp(telefone.length > 11 && telefone.startsWith("55") ? telefone.slice(2) : telefone) },
      endereco: { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "", ...salvo?.endereco },
      plano: planoInicial,
      metodoPagamento: salvo?.metodoPagamento === "cartao" ? "cartao" : "pix",
      notificarWhatsApp: salvo?.notificarWhatsApp === true,
    };
  });
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [erros, setErros] = useState<Erros>({});
  const [erroPedido, setErroPedido] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [disponibilidade, setDisponibilidade] = useState<"verificando" | "pronto" | "indisponivel">("verificando");
  const [recibo, setRecibo] = useState<ReciboPedido | null>(restaurada?.tentativa.recibo ?? null);
  const tentativa = useRef<Tentativa | null>(restaurada?.tentativa ?? null);
  const bloqueio = useRef(false);
  const titulo = useRef<HTMLHeadingElement>(null);
  const erroRef = useRef<HTMLDivElement>(null);

  useEffect(() => { guardarSessao(chaveSessao, rascunho); }, [chaveSessao, rascunho]);
  useEffect(() => {
    const controle = new AbortController();
    fetch("/api/pedido", { cache: "no-store", signal: controle.signal })
      .then((resposta) => resposta.json())
      .then((estado: { disponivel?: boolean }) => setDisponibilidade(estado.disponivel ? "pronto" : "indisponivel"))
      .catch(() => { if (!controle.signal.aborted) setDisponibilidade("indisponivel"); });
    return () => controle.abort();
  }, []);
  useEffect(() => { if (erroPedido) erroRef.current?.focus(); }, [erroPedido]);
  useEffect(() => { if (etapa === 2 || recibo) titulo.current?.focus(); }, [etapa, recibo]);

  function alterarCampo(campo: CampoId, valor: string) {
    setErros((atuais) => ({ ...atuais, [campo]: undefined }));
    setErroPedido("");
    setRascunho((atual) => ["nome", "email", "whatsapp"].includes(campo)
      ? { ...atual, cliente: { ...atual.cliente, [campo]: valor } }
      : { ...atual, endereco: { ...atual.endereco, [campo]: valor } });
  }

  function validarContato(): Erros {
    const { cliente, endereco } = rascunho;
    const problemas: Erros = {};
    if (cliente.nome.trim().length < 2) problemas.nome = "Informe seu nome completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email.trim())) problemas.email = "Confira seu e-mail, como nome@email.com.";
    if (!normalizarWhatsApp(cliente.whatsapp)) problemas.whatsapp = "Confira o WhatsApp e o DDD informado.";
    const cep = endereco.cep.replace(/\D/g, "");
    if (cep.length !== 8 || /^(\d)\1{7}$/.test(cep)) problemas.cep = "Confira os 8 números do CEP.";
    if (endereco.logradouro.trim().length < 3) problemas.logradouro = "Informe a rua ou avenida.";
    if (!endereco.numero.trim()) problemas.numero = "Informe o número ou S/N.";
    if (endereco.bairro.trim().length < 2) problemas.bairro = "Informe o bairro.";
    if (endereco.cidade.trim().length < 2) problemas.cidade = "Informe a cidade.";
    if (!UFS.includes(endereco.uf)) problemas.uf = "Selecione o estado.";
    return problemas;
  }

  function revisar(evento: FormEvent) {
    evento.preventDefault();
    const problemas = validarContato();
    setErros(problemas);
    const primeiro = CAMPOS.find((campo) => problemas[campo]);
    if (primeiro) { document.getElementById(primeiro)?.focus(); return; }
    setErroPedido("");
    setEtapa(2);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  async function verificarDisponibilidade() {
    setDisponibilidade("verificando");
    try {
      const resposta = await fetch("/api/pedido", { cache: "no-store" });
      const estado = await resposta.json() as { disponivel?: boolean };
      setDisponibilidade(estado.disponivel ? "pronto" : "indisponivel");
    } catch { setDisponibilidade("indisponivel"); }
  }

  async function confirmar(evento: FormEvent) {
    evento.preventDefault();
    if (bloqueio.current || recibo || disponibilidade !== "pronto") return;
    bloqueio.current = true;
    setEnviando(true);
    setErroPedido("");
    try {
      const cliente = { nome: rascunho.cliente.nome.trim(), email: rascunho.cliente.email.trim(), whatsapp: rascunho.cliente.whatsapp };
      const validacao = validarPedido({
        ...rascunho, cliente, respostas: { ...respostas, tutor: cliente.nome, whatsapp: cliente.whatsapp },
        chaveIdempotencia: tentativa.current?.chave ?? crypto.randomUUID(),
      });
      if (!validacao.ok) { setErroPedido(validacao.erro); return; }
      const conteudo = conteudoDoPedido(validacao.valor);
      if (tentativa.current?.conteudo !== conteudo) tentativa.current = { conteudo, chave: crypto.randomUUID() };
      guardarSessao(`${chaveSessao}:tentativa`, tentativa.current);
      if (tentativa.current.recibo) {
        salvarDados(atualizarCadastro(validacao.valor.respostas, rascunho.plano));
        setRecibo(tentativa.current.recibo);
        return;
      }
      const entrada: CriarPedidoEntrada = { ...validacao.valor, chaveIdempotencia: tentativa.current.chave };
      const resposta = await fetch("/api/pedido", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entrada),
      });
      const resultado = await resposta.json() as { ok: true; pedido: ReciboPedido } | { ok: false; erro: string };
      if (!resposta.ok || !resultado.ok) {
        setErroPedido(!resultado.ok && resultado.erro ? resultado.erro : "Não foi possível registrar seu pedido. Seus dados continuam aqui; tente novamente.");
        return;
      }
      tentativa.current.recibo = resultado.pedido;
      guardarSessao(`${chaveSessao}:tentativa`, tentativa.current);
      // A entrada normalizada mantém o telefone local sem DDI. Salva também a
      // chave final antes de atualizar o cadastro, que pode remontar esta tela.
      const chaveFinal = chaveDoCheckout(entrada.respostas);
      guardarSessao(chaveFinal, rascunhoDaEntrada(entrada));
      guardarSessao(`${chaveFinal}:tentativa`, tentativa.current);
      salvarDados(atualizarCadastro(entrada.respostas, rascunho.plano));
      setRecibo(resultado.pedido);
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch {
      setErroPedido("A conexão foi interrompida. Seus dados foram mantidos. Tente novamente para confirmar o mesmo pedido.");
    } finally { bloqueio.current = false; setEnviando(false); }
  }

  function criarOutroPedido() {
    const anterior = tentativa.current;
    if (anterior) {
      try {
        // O perfil novo e o perfil salvo podem apontar para o mesmo recibo.
        // Limpa apenas essas referências à mesma tentativa, sem tocar no pedido.
        for (let i = 0; i < window.sessionStorage.length; i += 1) {
          const chave = window.sessionStorage.key(i);
          if (chave?.startsWith("fareja:checkout:") && chave.endsWith(":tentativa") && lerSessao<Tentativa>(chave)?.chave === anterior.chave) guardarSessao(chave, null);
        }
      } catch { /* A chave da tela atual também é limpa abaixo. */ }
    }
    guardarSessao(`${chaveSessao}:tentativa`, null);
    tentativa.current = null;
    setRecibo(null);
    setEtapa(1);
    setErroPedido("");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  if (recibo) return (
    <div className="min-h-dvh"><Cabecalho /><main className="mx-auto max-w-[760px] px-5 py-10 sm:px-8 sm:py-14">
      <Cartao className="entrada text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-menta-suave text-[30px] font-bold text-coleira" aria-hidden="true">✓</span>
        <p className="mt-5 text-xs font-bold tracking-[0.2em] text-coleira">PEDIDO RECEBIDO</p>
        <h1 ref={titulo} tabIndex={-1} className="mt-2 font-display text-[36px] leading-tight font-extrabold outline-none">O próximo mimo de {respostas.nomePet} está mais perto.</h1>
        <p className="mt-4 text-base leading-relaxed text-casca">Seu pedido foi registrado. Guarde o número abaixo para falar com a equipe.</p>
        <p className="mt-5 break-all rounded-xl bg-areia px-4 py-3 text-sm font-bold">{recibo.id}</p>
        <div className="mt-5 rounded-2xl border-2 border-linha bg-petisco-suave p-5 text-left">
          <p className="font-display text-xl font-extrabold">Pagamento pendente</p>
          <p className="mt-2 text-sm leading-relaxed text-casca">A etapa de pagamento ainda não está disponível. Nenhuma cobrança foi feita e sua assinatura ainda não foi ativada. O próximo passo será realizar o pagamento após a liberação dessa etapa.</p>
          <dl className="mt-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between gap-3"><dt>Plano</dt><dd className="font-bold">{planos[recibo.plano].nome}</dd></div>
            <div className="flex justify-between gap-3"><dt>Preferência</dt><dd className="font-bold">{recibo.pagamento.metodo === "pix" ? "Pix" : "Cartão"}</dd></div>
            <div className="flex justify-between gap-3"><dt>Entrega</dt><dd className="font-bold text-coleira">{recibo.freteCentavos === 0 ? "Grátis" : formatarDinheiro(recibo.freteCentavos)}</dd></div>
            <div className="mt-2 flex justify-between gap-3 border-t-2 border-linha pt-3"><dt className="font-bold">Total a pagar</dt><dd className="font-display text-2xl font-extrabold">{formatarDinheiro(recibo.totalCentavos)}</dd></div>
          </dl>
        </div>
        <p className="mt-5 text-sm leading-relaxed text-casca">{recibo.notificacao === "enviada" ? "Enviamos a confirmação do pedido para seu WhatsApp." : recibo.notificacao === "pendente" ? "A confirmação por WhatsApp está pendente. Seu pedido já está registrado aqui." : recibo.notificacao === "nao_configurada" ? "Seu pedido está registrado aqui. A confirmação automática por WhatsApp ainda não está disponível." : "Você optou por não receber atualizações por WhatsApp. A confirmação do seu pedido está nesta página."}</p>
        <Link href="/app" className={`${botaoPrincipal} mt-7`}>Ir para o app de {respostas.nomePet}</Link>
        <a href={linkWhatsApp(`Oi, FAREJA! Quero tirar uma dúvida sobre meu pedido ${recibo.id}.`)} target="_blank" rel="noopener noreferrer" className={`mt-5 inline-flex items-center gap-2 ${botaoTexto}`}><IconeWhatsApp size={18} /> Tirar uma dúvida com a equipe</a>
        <div className="mt-7 border-t-2 border-linha pt-5"><button type="button" onClick={criarOutroPedido} className={botaoTexto}>Criar outro pedido</button><p className="mt-2 text-xs leading-relaxed text-casca">Esta opção começa um novo pedido. O pedido acima permanece registrado.</p></div>
      </Cartao>
    </main></div>
  );

  return (
    <div className="min-h-dvh"><Cabecalho />
      <main className="mx-auto max-w-[1120px] px-5 py-7 sm:px-8 sm:py-10">
        <nav aria-label="Etapas do pedido" className="mb-7 flex items-center gap-2 text-xs font-bold sm:gap-4 sm:text-sm">
          <span className="flex items-center gap-2 text-coleira"><span className="flex size-6 items-center justify-center rounded-full bg-menta-suave" aria-hidden="true">✓</span> Perfil do pet</span>
          <span className="h-px max-w-8 flex-1 bg-linha-forte" />
          <span aria-current={etapa === 1 ? "step" : undefined} className={`flex items-center gap-2 ${etapa === 1 ? "text-faro-texto" : "text-coleira"}`}><span className={`flex size-6 items-center justify-center rounded-full ${etapa === 1 ? "bg-faro-suave" : "bg-menta-suave"}`} aria-hidden="true">{etapa === 1 ? "1" : "✓"}</span> Entrega</span>
          <span className="h-px max-w-8 flex-1 bg-linha-forte" />
          <span aria-current={etapa === 2 ? "step" : undefined} className={`flex items-center gap-2 ${etapa === 2 ? "text-faro-texto" : "text-casca"}`}><span className={`flex size-6 items-center justify-center rounded-full ${etapa === 2 ? "bg-faro-suave" : "bg-linha"}`} aria-hidden="true">2</span> Revisão</span>
        </nav>
        <div className="mb-7">
          <h1 ref={titulo} tabIndex={-1} className="font-display text-[34px] leading-tight font-extrabold outline-none sm:text-[42px]">{etapa === 1 ? "Para onde vai esse carinho?" : "Tudo pronto para o próximo mimo?"}</h1>
          <p className="mt-2 text-sm leading-relaxed text-casca sm:text-base">{etapa === 1 ? `O perfil de ${respostas.nomePet} já está aqui. Só precisamos dos seus dados e do endereço.` : "Confira os detalhes e confirme seu pedido. O pagamento fica para a próxima etapa."}</p>
        </div>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_370px] lg:gap-8">
          <form onSubmit={etapa === 1 ? revisar : confirmar} noValidate aria-busy={enviando} className="flex min-w-0 flex-col gap-5">
            {etapa === 1 ? <>
              <Cartao>
                <h2 className="font-display text-[23px] font-extrabold">Quem vai receber?</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Campo id="nome" rotulo="Nome completo" autoComplete="name" required maxLength={80} value={rascunho.cliente.nome} onChange={(e) => alterarCampo("nome", e.target.value)} erro={erros.nome} className="sm:col-span-2" placeholder="Como podemos chamar você?" />
                  <Campo id="email" rotulo="E-mail" type="email" autoComplete="email" required maxLength={254} value={rascunho.cliente.email} onChange={(e) => alterarCampo("email", e.target.value)} erro={erros.email} placeholder="voce@email.com" />
                  <Campo id="whatsapp" rotulo="WhatsApp com DDD" type="tel" inputMode="tel" autoComplete="tel-national" required value={rascunho.cliente.whatsapp} onChange={(e) => alterarCampo("whatsapp", mascaraWhatsApp(e.target.value))} erro={erros.whatsapp} placeholder="(21) 9 0000-0000" />
                </div>
              </Cartao>
              <Cartao>
                <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-display text-[23px] font-extrabold">Endereço de entrega</h2><span className="rounded-full bg-menta-suave px-3 py-1 text-xs font-bold text-coleira">Frete grátis</span></div>
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-6">
                  <Campo id="cep" rotulo="CEP" autoComplete="shipping postal-code" inputMode="numeric" required maxLength={9} value={rascunho.endereco.cep} onChange={(e) => alterarCampo("cep", e.target.value.replace(/\D/g, "").slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2"))} erro={erros.cep} className="col-span-2 sm:col-span-3" placeholder="00000-000" />
                  <Campo id="logradouro" rotulo="Rua / avenida" autoComplete="shipping address-line1" required maxLength={120} value={rascunho.endereco.logradouro} onChange={(e) => alterarCampo("logradouro", e.target.value)} erro={erros.logradouro} className="col-span-2 sm:col-span-6" placeholder="Nome da rua" />
                  <Campo id="numero" rotulo="Número" required maxLength={16} value={rascunho.endereco.numero} onChange={(e) => alterarCampo("numero", e.target.value)} erro={erros.numero} className="sm:col-span-2" placeholder="123 ou S/N" />
                  <Campo id="complemento" rotulo="Complemento (opcional)" autoComplete="shipping address-line2" maxLength={100} value={rascunho.endereco.complemento} onChange={(e) => alterarCampo("complemento", e.target.value)} className="sm:col-span-4" placeholder="Apto., bloco..." />
                  <Campo id="bairro" rotulo="Bairro" required maxLength={80} value={rascunho.endereco.bairro} onChange={(e) => alterarCampo("bairro", e.target.value)} erro={erros.bairro} className="col-span-2 sm:col-span-6" />
                  <Campo id="cidade" rotulo="Cidade" autoComplete="shipping address-level2" required maxLength={80} value={rascunho.endereco.cidade} onChange={(e) => alterarCampo("cidade", e.target.value)} erro={erros.cidade} className="sm:col-span-4" />
                  <div className="sm:col-span-2"><label htmlFor="uf" className="mb-2 block text-[13px] font-bold">Estado</label><select id="uf" name="uf" autoComplete="shipping address-level1" required value={rascunho.endereco.uf} onChange={(e) => alterarCampo("uf", e.target.value)} aria-invalid={!!erros.uf} aria-describedby={erros.uf ? "uf-erro" : undefined} className={`${inputClasse} ${erros.uf ? "border-faro-texto" : "border-linha"}`}><option value="">UF</option>{UFS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}</select>{erros.uf && <p id="uf-erro" className="mt-1.5 text-xs font-semibold text-faro-texto">{erros.uf}</p>}</div>
                </div>
              </Cartao>
              <button type="submit" className={botaoPrincipal}>Revisar meu pedido <span aria-hidden="true">→</span></button>
              <p className="-mt-2 text-center text-xs leading-relaxed text-casca">Você confere tudo antes de confirmar.</p>
            </> : <>
              <Cartao><SelecionarPlano plano={rascunho.plano} aoMudar={(plano) => { setErroPedido(""); setRascunho((atual) => ({ ...atual, plano })); }} desabilitado={enviando} /></Cartao>
              <Cartao>
                <div className="flex items-center justify-between gap-3"><h2 className="font-display text-[23px] font-extrabold">Entrega e contato</h2><button type="button" disabled={enviando} onClick={() => { setEtapa(1); setErroPedido(""); }} className={botaoTexto}>Editar</button></div>
                <div className="mt-4 grid gap-4 text-sm leading-relaxed sm:grid-cols-2">
                  <div><p className="font-bold">{rascunho.cliente.nome}</p><p className="mt-1 break-all text-casca">{rascunho.cliente.email}</p><p className="text-casca">{rascunho.cliente.whatsapp}</p></div>
                  <div className="text-casca"><p className="font-bold text-focinho">{rascunho.endereco.logradouro}, {rascunho.endereco.numero}</p>{rascunho.endereco.complemento && <p>{rascunho.endereco.complemento}</p>}<p>{rascunho.endereco.bairro} · {rascunho.endereco.cidade}/{rascunho.endereco.uf}</p><p>CEP {rascunho.endereco.cep}</p></div>
                </div>
              </Cartao>
              <Cartao>
                <fieldset disabled={enviando}><legend className="font-display text-[23px] font-extrabold">Como prefere pagar?</legend><p className="mt-1 text-sm leading-relaxed text-casca">Escolha sua preferência para a próxima etapa.</p><div className="mt-4 grid grid-cols-2 gap-3">{(["pix", "cartao"] as MetodoPagamento[]).map((metodo) => <label key={metodo} className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 has-focus-visible:outline-[3px] has-focus-visible:outline-coleira ${rascunho.metodoPagamento === metodo ? "border-coleira bg-menta-suave" : "border-linha"}`}><input type="radio" name="pagamento" value={metodo} checked={rascunho.metodoPagamento === metodo} onChange={() => setRascunho((atual) => ({ ...atual, metodoPagamento: metodo }))} className="size-4 accent-coleira" /><span className="font-bold">{metodo === "pix" ? "Pix" : "Cartão"}</span></label>)}</div></fieldset>
                <p className="mt-4 rounded-xl bg-petisco-suave p-3 text-xs leading-relaxed text-casca">O pagamento ainda não está disponível. Ao confirmar, seu pedido fica registrado como <strong className="text-focinho">aguardando pagamento</strong>. Nenhuma cobrança será feita agora.</p>
              </Cartao>
              <div className="lg:hidden"><Resumo respostas={respostas} plano={rascunho.plano} /></div>
              <label className="flex cursor-pointer items-start gap-3 px-1 text-sm leading-relaxed text-casca"><input type="checkbox" checked={rascunho.notificarWhatsApp} disabled={enviando} onChange={(e) => setRascunho((atual) => ({ ...atual, notificarWhatsApp: e.target.checked }))} className="mt-0.5 size-5 shrink-0 accent-coleira" /><span>Quero receber a confirmação e atualizações deste pedido pelo WhatsApp. <span className="text-xs">(Opcional)</span></span></label>
              {disponibilidade === "indisponivel" && <div role="status" className="rounded-2xl border-2 border-linha-forte bg-petisco-suave p-4 text-sm leading-relaxed"><p className="font-bold">O recebimento de pedidos está temporariamente indisponível.</p><p className="mt-1 text-casca">Seus dados continuam aqui. Tente novamente em instantes.</p><button type="button" onClick={verificarDisponibilidade} className={`mt-3 ${botaoTexto}`}>Verificar novamente</button></div>}
              {erroPedido && <div ref={erroRef} tabIndex={-1} role="alert" className="rounded-2xl border-2 border-faro-texto bg-faro-suave p-4 text-sm leading-relaxed text-focinho">{erroPedido}</div>}
              <button type="submit" disabled={enviando || disponibilidade !== "pronto"} className={botaoPrincipal}>{enviando ? "Registrando seu pedido…" : disponibilidade === "verificando" ? "Verificando disponibilidade…" : "Confirmar pedido"}{!enviando && disponibilidade === "pronto" && <span aria-hidden="true">→</span>}</button>
              <p className="-mt-2 text-center text-xs leading-relaxed text-casca">Ao confirmar, você concorda com o uso dos dados para processar o pedido, conforme nossa <Link href="/privacidade" target="_blank" rel="noopener noreferrer" className="font-bold text-coleira underline">Política de Privacidade</Link>.</p>
              <button type="button" disabled={enviando} onClick={() => { setEtapa(1); setErroPedido(""); }} className={`mx-auto py-2 ${botaoTexto}`}>← Voltar para a entrega</button>
            </>}
          </form>
          <Resumo respostas={respostas} plano={rascunho.plano} ocultarMobile={etapa === 2} />
        </div>
        <p className="mt-9 border-t-2 border-linha pt-6 text-center text-xs leading-relaxed text-casca">{site.nome} · {site.slogan}</p>
      </main>
    </div>
  );
}
