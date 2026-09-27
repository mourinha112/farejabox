// Tudo que muda sem mexer em tela fica aqui.
// O número do WhatsApp vem de NEXT_PUBLIC_WHATSAPP_NUMBER (só dígitos, com DDI: 5521999999999).

export const site = {
  nome: "FAREJA",
  assinatura: "Box funcional do pet",
  slogan: "farejou, achou, amou.",
  dominio: "farejabox.com.br",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://farejabox.com.br",
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, ""),
  instagram: "farejabox",
  freteGratisAcima: 149,
  cupom: {
    codigo: "PRIMEIROFARO",
    beneficio: "condição especial no primeiro box",
  },
} as const;

export type PlanoId = "mensal" | "trimestral";

export const planos: Record<
  PlanoId,
  { id: PlanoId; nome: string; preco: number; porMes: number; detalhe: string; itens: string[] }
> = {
  mensal: {
    id: "mensal",
    nome: "Assinatura mensal",
    preco: 119,
    porMes: 119,
    detalhe: "/mês",
    itens: [
      "4 a 6 petiscos naturais desidratados",
      "1 suplemento funcional do diagnóstico",
      "Brinde surpresa + cartinha do mês",
    ],
  },
  trimestral: {
    id: "trimestral",
    nome: "Plano trimestral",
    preco: 297,
    porMes: 99,
    detalhe: "3 meses · R$99/mês",
    itens: [
      "Tudo do plano mensal",
      "Economia de R$60 no trimestre",
      "Brinde de boas-vindas no 1º box",
    ],
  },
};

// Depoimentos só entram aqui quando forem reais e autorizados pelo cliente.
export const depoimentos: { texto: string; autor: string; detalhe: string }[] = [];

export const faq: { pergunta: string; resposta: string }[] = [
  {
    pergunta: "Como o box é montado?",
    resposta:
      "Pela avaliação gratuita. Você conta porte, idade, rotina e a principal queixa do seu pet, e a gente escolhe os petiscos e o suplemento funcional que fazem sentido para ele.",
  },
  {
    pergunta: "O que vem dentro da caixa?",
    resposta:
      "De 4 a 6 petiscos naturais desidratados, 1 suplemento funcional escolhido pelo diagnóstico, um brinde surpresa e a cartinha do mês com o nome do pet.",
  },
  {
    pergunta: "Posso cancelar quando quiser?",
    resposta:
      "Pode. No plano mensal o cancelamento é livre e sem multa: é só avisar pelo WhatsApp antes da próxima cobrança.",
  },
  {
    pergunta: "O diagnóstico substitui o veterinário?",
    resposta:
      "Não. Ele é educativo e baseado nas suas respostas. Coceira intensa, feridas, apatia ou mudança brusca de comportamento pedem um profissional. Suplemento é apoio nutricional, não medicamento.",
  },
  {
    pergunta: "Tem box para gatos?",
    resposta:
      "Tem. Na avaliação você escolhe gato e o box é montado com petiscos e porções pensados para felinos.",
  },
  {
    pergunta: "Como acompanho a entrega e a saúde do meu pet?",
    resposta:
      "Pelo App do tutor. Você recebe um link de acesso pelo WhatsApp e acompanha a caixa, o índice de bem-estar e os check-ins semanais.",
  },
];
