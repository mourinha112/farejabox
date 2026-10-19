// Tudo que muda sem mexer em tela fica aqui.
// O número do WhatsApp vem de NEXT_PUBLIC_WHATSAPP_NUMBER (só dígitos, com DDI: 5521999999999).

// Aceita variável vazia, sem protocolo ou inválida sem derrubar o build.
function urlDoSite(): string {
  const candidatas = [process.env.NEXT_PUBLIC_SITE_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL];
  for (const candidata of candidatas) {
    const valor = candidata?.trim();
    if (!valor) continue;
    const completa = /^https?:\/\//i.test(valor) ? valor : `https://${valor}`;
    if (URL.canParse(completa)) return completa.replace(/\/+$/, "");
  }
  return "https://farejabox.com.br";
}

export const site = {
  nome: "FAREJA",
  assinatura: "Box funcional do pet",
  slogan: "farejou, achou, amou.",
  dominio: "farejabox.com.br",
  url: urlDoSite(),
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, ""),
  instagram: "farejabox",
  freteGratisAcima: 149,
  cupom: {
    codigo: "PRIMEIROFARO",
    beneficio: "condição especial no primeiro box",
  },
} as const;

export const curadoria = {
  resumo:
    "A prévia é gerada automaticamente pelas respostas sobre o pet. A equipe FAREJA valida a seleção dos suplementos. Você vê o critério da sugestão antes de informar seu contato.",
  detalhe:
    "Como a sugestão funciona: ao escolher pelagem, calma, articulações ou digestão, o sistema sugere a categoria correspondente. Para os focos em saúde bucal ou em mimar, compara os indicadores do perfil ligados às quatro categorias e sugere a de menor pontuação. A prévia é automática; a equipe FAREJA valida a seleção dos suplementos. Essa validação não substitui uma avaliação veterinária individual.",
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
      "1 suplemento funcional pelo perfil do pet",
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
      "Você preenche o perfil do pet em 4 etapas, com informações sobre porte, fase de vida, rotina, mastigação e foco de cuidado. O site apresenta uma prévia com a sugestão de suplemento e o motivo da escolha. Depois você escolhe se quer seguir com um pedido pelo WhatsApp.",
  },
  {
    pergunta: "Quem escolhe e valida o suplemento?",
    resposta:
      curadoria.detalhe,
  },
  {
    pergunta: "Preciso informar meu WhatsApp para ver o perfil?",
    resposta:
      "Não. Você vê a prévia personalizada antes de informar seu nome ou WhatsApp. Depois, pode escolher salvar o perfil ou seguir com a assinatura.",
  },
  {
    pergunta: "Já quero assinar. Preciso fazer a avaliação?",
    resposta:
      "Escolha Assinar mensal ou Assinar trimestral para começar com o plano definido. Em seguida, preencha as 4 etapas do perfil necessárias à personalização do box, revise a seleção e continue pelo WhatsApp para combinar a entrega e o pagamento. Não há cobrança no site.",
  },
  {
    pergunta: "O que vem dentro da caixa?",
    resposta:
      "De 4 a 6 petiscos naturais desidratados, 1 suplemento funcional escolhido pelo perfil do pet, um brinde surpresa e a cartinha do mês com o nome dele.",
  },
  {
    pergunta: "Posso cancelar quando quiser?",
    resposta:
      "Pode. No plano mensal o cancelamento é livre e sem multa: é só avisar pelo WhatsApp antes da próxima cobrança.",
  },
  {
    pergunta: "A avaliação substitui o veterinário?",
    resposta:
      "Não. É uma avaliação de preferências e necessidades, educativa e baseada nas suas respostas. Coceira intensa, feridas, apatia ou mudança brusca de comportamento pedem um profissional. Suplemento é apoio nutricional, não medicamento.",
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
