import { planos, site, type PlanoId } from "./config";
import {
  diagnosticar,
  faseLabel,
  ordemPilares,
  pilarInfo,
  porteLabel,
  suplementos,
  type Respostas,
} from "./diagnostico";

export function linkWhatsApp(texto: string, numero: string = site.whatsapp): string {
  const destino = numero.replace(/\D/g, "");
  return `https://wa.me/${destino}?text=${encodeURIComponent(texto)}`;
}

export function mascaraWhatsApp(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`;
}

export function whatsappValido(valor: string): boolean {
  const d = valor.replace(/\D/g, "");
  return (d.length === 10 || d.length === 11) && Number(d.slice(0, 2)) >= 11;
}

function resumoPet(r: Respostas): string {
  const d = diagnosticar(r);
  const pilares = ordemPilares.map((id) => `• ${pilarInfo[id].nome}: ${d.pilares[id]}`).join("\n");
  return [
    `Pet: ${r.nomePet} (${r.especie}, ${porteLabel[r.especie][r.porte].nome.toLowerCase()}, ${faseLabel[r.fase].nome.toLowerCase()})`,
    `Índice de bem-estar: ${d.indice}/100 (${d.leitura})`,
    pilares,
    `Suplemento sugerido pelo perfil: ${suplementos[d.suplemento].nome} (seleção a validar pela equipe FAREJA)`,
  ].join("\n");
}

export function mensagemResultado(r: Respostas, linkApp: string): string {
  return [
    `Oi, FAREJA! Sou ${r.tutor} e acabei de montar o perfil de ${r.nomePet}.`,
    "Quero conversar sobre o perfil e o acompanhamento por aqui.",
    "",
    resumoPet(r),
    "",
    `Meu acesso ao app: ${linkApp}`,
  ].join("\n");
}

export function mensagemPedido(r: Respostas, plano: PlanoId, linkApp: string): string {
  const p = planos[plano];
  return [
    `Oi, FAREJA! Sou ${r.tutor} e quero concluir a assinatura do box de ${r.nomePet}.`,
    plano === "mensal"
      ? `Plano: ${p.nome} — R$${p.preco}/mês.`
      : `Plano: ${p.nome} — R$${p.preco} no total a cada 3 meses (equivalente a R$${p.porMes}/mês).`,
    "Quero confirmar a seleção com a equipe FAREJA, o pagamento e eventual frete antes de concluir o pedido.",
    "",
    resumoPet(r),
    "",
    `Meu acesso ao app: ${linkApp}`,
  ].join("\n");
}

export function mensagemAjuda(r: Respostas): string {
  return `Oi, FAREJA! Sou ${r.tutor}, tutor de ${r.nomePet}, e preciso de ajuda.`;
}

export function mensagemAvaliacao(r: Respostas, nota: number, comentario: string): string {
  return [
    `Oi, FAREJA! Avaliação do box de ${r.nomePet}:`,
    `Nota: ${nota} de 5 patinhas`,
    comentario ? `Comentário: ${comentario}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function mensagemLinkDeAcesso(r: Respostas, linkApp: string): string {
  return [
    `Oi, ${r.tutor}! Aqui é da FAREJA.`,
    `Este é o seu acesso ao app de ${r.nomePet}. É só tocar no link para acompanhar a caixa e a saúde:`,
    linkApp,
  ].join("\n");
}
