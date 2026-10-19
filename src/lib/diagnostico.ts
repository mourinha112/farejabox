// Motor do perfil: das respostas do quiz sai o índice de bem-estar,
// os pilares, o suplemento do box e o plano gratuito de 7 dias.

export type Especie = "cachorro" | "gato";
export type Porte = "pequeno" | "medio" | "grande" | "gigante";
export type Fase = "filhote" | "adulto" | "senior";
export type Foco = "pelagem" | "ansiedade" | "articulacao" | "digestao" | "bucal" | "mimar";
export type Frequencia = "as-vezes" | "toda-semana" | "todo-dia";
export type Alimentacao = "racao" | "mista" | "natural" | "caseira";
export type Atividade = "baixa" | "media" | "alta";
export type Mastigacao = "roedor" | "moderado" | "delicado";

export type Respostas = {
  especie: Especie;
  nomePet: string;
  porte: Porte;
  fase: Fase;
  foco: Foco;
  frequencia: Frequencia;
  alimentacao: Alimentacao;
  atividade: Atividade;
  mastigacao: Mastigacao;
  tutor: string;
  whatsapp: string;
};

export type PilarId = "nutricao" | "pele" | "comportamento" | "mobilidade" | "bucal";
export type Pilares = Record<PilarId, number>;
export type SuplementoId = "pelagem" | "ansiedade" | "articulacao" | "digestao";

export const pilarInfo: Record<PilarId, { nome: string; pergunta: string }> = {
  nutricao: { nome: "Nutrição", pergunta: "Apetite e digestão" },
  pele: { nome: "Pele e pelagem", pergunta: "Coceira e brilho do pelo" },
  comportamento: { nome: "Comportamento", pergunta: "Calma e disposição" },
  mobilidade: { nome: "Mobilidade", pergunta: "Disposição para andar, pular e brincar" },
  bucal: { nome: "Saúde bucal", pergunta: "Hálito e dentes" },
};

export const ordemPilares: PilarId[] = ["nutricao", "pele", "comportamento", "mobilidade", "bucal"];

export const porteLabel: Record<Especie, Record<Porte, { nome: string; detalhe: string }>> = {
  cachorro: {
    pequeno: { nome: "Pequeno", detalhe: "até 10 kg" },
    medio: { nome: "Médio", detalhe: "10 a 25 kg" },
    grande: { nome: "Grande", detalhe: "25 a 45 kg" },
    gigante: { nome: "Gigante", detalhe: "acima de 45 kg" },
  },
  gato: {
    pequeno: { nome: "Pequeno", detalhe: "até 4 kg" },
    medio: { nome: "Médio", detalhe: "4 a 6 kg" },
    grande: { nome: "Grande", detalhe: "acima de 6 kg" },
    gigante: { nome: "Grande", detalhe: "acima de 6 kg" },
  },
};

export const faseLabel: Record<Fase, { nome: string; detalhe: string }> = {
  filhote: { nome: "Filhote", detalhe: "até 1 ano" },
  adulto: { nome: "Adulto", detalhe: "1 a 7 anos" },
  senior: { nome: "Sênior", detalhe: "7 anos ou mais" },
};

export function focoLabel(foco: Foco, especie: Especie): string {
  const nomes: Record<Foco, string> = {
    pelagem: "Coceira e pelagem",
    ansiedade: especie === "gato" ? "Ansiedade e estresse" : "Ansiedade e latidos",
    articulacao: "Articulações",
    digestao: "Digestão",
    bucal: "Hálito e dentes",
    mimar: "Nada, só mimar!",
  };
  return nomes[foco];
}

export const suplementos: Record<SuplementoId, { nome: string; descricao: string; pilar: PilarId }> = {
  pelagem: {
    nome: "Pelagem & pele",
    descricao: "ômegas + biotina para pele e brilho do pelo",
    pilar: "pele",
  },
  ansiedade: {
    nome: "Calma & bem-estar",
    descricao: "apoio nutricional para uma rotina mais tranquila",
    pilar: "comportamento",
  },
  articulacao: {
    nome: "Articulação & mobilidade",
    descricao: "apoio nutricional para cartilagens e movimento",
    pilar: "mobilidade",
  },
  digestao: {
    nome: "Digestão & flora",
    descricao: "fibras e apoio para a flora intestinal",
    pilar: "nutricao",
  },
};

const pesoFrequencia: Record<Frequencia, number> = { "as-vezes": 0.55, "toda-semana": 0.8, "todo-dia": 1 };

function limitar(valor: number): number {
  return Math.max(5, Math.min(98, Math.round(valor)));
}

export function calcularPilares(r: Respostas): Pilares {
  const f = pesoFrequencia[r.frequencia];

  let nutricao = { racao: 72, mista: 75, natural: 82, caseira: 58 }[r.alimentacao];
  let pele = 78;
  let comportamento = { baixa: 58, media: 70, alta: 80 }[r.atividade];
  let mobilidade = { filhote: 88, adulto: 82, senior: 68 }[r.fase];
  let bucal = { roedor: 70, moderado: 62, delicado: 54 }[r.mastigacao];

  if (r.porte === "grande") mobilidade -= 4;
  if (r.porte === "gigante") mobilidade -= 8;
  if (r.atividade === "baixa") mobilidade -= 6;
  if (r.fase === "senior") bucal -= 6;
  if (r.alimentacao === "caseira") pele -= 6;

  if (r.foco === "digestao") nutricao -= 30 * f;
  if (r.foco === "pelagem") pele -= 33 * f;
  if (r.foco === "ansiedade") comportamento -= 30 * f;
  if (r.foco === "articulacao") mobilidade -= 30 * f;
  if (r.foco === "bucal") bucal -= 25 * f;

  return {
    nutricao: limitar(nutricao),
    pele: limitar(pele),
    comportamento: limitar(comportamento),
    mobilidade: limitar(mobilidade),
    bucal: limitar(bucal),
  };
}

export function calcularIndice(p: Pilares): number {
  const soma = ordemPilares.reduce((total, id) => total + p[id], 0);
  return Math.round(soma / ordemPilares.length);
}

export function pilarMaisBaixo(p: Pilares): PilarId {
  return ordemPilares.reduce((menor, id) => (p[id] < p[menor] ? id : menor), ordemPilares[0]);
}

export function leituraIndice(indice: number, p: Pilares): string {
  const temAlerta = p[pilarMaisBaixo(p)] < 60;
  if (indice >= 80) return temAlerta ? "Muito bom, com um alerta" : "Muito bom";
  if (indice >= 65) return temAlerta ? "Bom, com um alerta" : "Bom";
  if (indice >= 50) return "Pede atenção";
  return "Precisa de cuidado";
}

export function nivelPilar(valor: number): "ok" | "atencao" {
  return valor < 60 ? "atencao" : "ok";
}

export function escolherSuplemento(r: Respostas, p: Pilares): SuplementoId {
  if (r.foco === "pelagem" || r.foco === "ansiedade" || r.foco === "articulacao" || r.foco === "digestao") {
    return r.foco;
  }
  const candidatos = Object.keys(suplementos) as SuplementoId[];
  return candidatos.reduce((menor, id) =>
    p[suplementos[id].pilar] < p[suplementos[menor].pilar] ? id : menor,
  );
}

export type Diagnostico = {
  pilares: Pilares;
  indice: number;
  leitura: string;
  alerta: PilarId;
  suplemento: SuplementoId;
  perfil: string;
  motivos: string[];
  analise: string;
};

const analiseFoco: Record<Foco, string> = {
  pelagem:
    "coceira frequente e pelos opacos costumam indicar carência de ácidos graxos (ômega 3 e 6), banhos com produto inadequado, pulgas ou início de dermatite. É o pilar que puxa o índice para baixo, e também um dos mais rápidos de melhorar com a rotina certa.",
  ansiedade:
    "agitação, vocalização e destruição quase sempre têm a ver com energia acumulada e falta de previsibilidade na rotina. Gasto de energia, enriquecimento ambiental e horários fixos costumam mudar o quadro em poucas semanas.",
  articulacao:
    "rigidez ao levantar, recusa em pular e cansaço cedo no passeio são sinais de que as articulações pedem atenção. Peso controlado, piso que não escorrega e exercício de baixo impacto fazem muita diferença.",
  digestao:
    "fezes moles, gases e vômitos ocasionais geralmente estão ligados a trocas bruscas de alimento, excesso de petisco ou comer rápido demais. Rotina de horários e transições lentas costumam estabilizar a digestão.",
  bucal:
    "mau hálito não é normal: quase sempre é placa e tártaro acumulados. Escovação e mastigação adequada resolvem a placa recente, mas tártaro já formado só sai com limpeza no veterinário.",
  mimar:
    "não há uma queixa principal, e isso é ótimo. O foco aqui é manter: variedade, enriquecimento e prevenção nos pilares que aparecem mais baixos no mapa.",
};

export function diagnosticar(r: Respostas): Diagnostico {
  const pilares = calcularPilares(r);
  const indice = calcularIndice(pilares);
  const alerta = pilarMaisBaixo(pilares);
  const suplemento = escolherSuplemento(r, pilares);
  const nome = r.nomePet;
  const porte = porteLabel[r.especie][r.porte].nome.toLowerCase();
  const fase = faseLabel[r.fase].nome.toLowerCase();

  const perfil =
    r.foco === "mimar"
      ? `porte ${porte} · ${fase} · foco em mimar e prevenir`
      : `porte ${porte} · ${fase} · foco em ${focoLabel(r.foco, r.especie).toLowerCase()}`;

  const motivos: string[] = [];
  if (r.foco === "mimar" || r.foco === "bucal") {
    motivos.push(
      `${pilarInfo[suplementos[suplemento].pilar].nome} é o pilar nutricional mais baixo do mapa, então o suplemento do mês é ${suplementos[suplemento].nome}.`,
    );
  } else {
    motivos.push(
      `Você marcou ${focoLabel(r.foco, r.especie).toLowerCase()}, então o suplemento do mês é ${suplementos[suplemento].nome} (${suplementos[suplemento].descricao}).`,
    );
  }
  if (r.mastigacao === "roedor") {
    motivos.push(`${nome} é roedor entusiasmado: entram petiscos naturais duros, que ajudam a limpar os dentes.`);
  } else if (r.mastigacao === "delicado") {
    motivos.push(`${nome} mastiga com delicadeza: entram petiscos macios e fáceis de partir.`);
  } else {
    motivos.push(`${nome} mastiga na medida: entra um mix de texturas para variar o estímulo.`);
  }
  motivos.push(
    `Porte ${porte} e fase ${fase}: porções e dureza na medida ${r.especie === "gato" ? "de um felino" : "dele"}, nem de mais, nem de menos.`,
  );

  const base = `Pelas suas respostas, o índice de bem-estar de ${nome} ficou em ${indice}/100.`;
  const analise =
    r.foco === "mimar"
      ? `${base} Sobre o momento atual: ${analiseFoco.mimar} Hoje o ponto mais baixo é ${pilarInfo[alerta].nome.toLowerCase()}.`
      : `${base} O ponto de atenção é ${pilarInfo[alerta].nome.toLowerCase()}: ${analiseFoco[r.foco]}`;

  return {
    pilares,
    indice,
    leitura: leituraIndice(indice, pilares),
    alerta,
    suplemento,
    perfil,
    motivos,
    analise,
  };
}

export type DiaPlano = { titulo: string; texto: string };

export function plano7Dias(r: Respostas): { tema: string; dias: DiaPlano[] } {
  const nome = r.nomePet;
  const gato = r.especie === "gato";
  const passeio = gato ? "brincadeira com varinha" : "passeio";

  const planos: Record<Foco, { tema: string; dias: DiaPlano[] }> = {
    pelagem: {
      tema: "pelagem",
      dias: [
        { titulo: "Escovação de 5 minutos.", texto: "Remove pelo morto e espalha a oleosidade natural. Repita dia sim, dia não." },
        { titulo: "Inspeção de pele.", texto: "Procure vermelhidão, feridinhas e pulgas na barriga, axilas e atrás das orelhas. Achou ferida aberta? Veterinário, não suplemento." },
        { titulo: "Confira o shampoo.", texto: "Produto de humano resseca a pele do pet (pH diferente). Use apenas shampoo neutro veterinário." },
        { titulo: "Água sempre fresca.", texto: "Hidratação reflete direto na pele. Troque a água 2x ao dia e lave o pote." },
        { titulo: "Verifique o antipulgas.", texto: `Coceira sem lesão muitas vezes é pulga. Confira se a dose está em dia para o peso de ${nome}.` },
        { titulo: "Pergunte ao vet sobre ômega 3.", texto: "É o nutriente nº 1 de pele e pelagem. A dose certa depende do peso e da dieta." },
        { titulo: "Foto de progresso.", texto: "Tire uma foto da pelagem no mesmo lugar e luz. Em 30 dias você compara: o que não se mede, não melhora." },
      ],
    },
    ansiedade: {
      tema: "calma",
      dias: [
        { titulo: "Anote os gatilhos.", texto: `Por um dia, registre quando ${nome} fica agitado: barulho, visita, ficar sozinho. Padrão identificado é meio caminho.` },
        { titulo: "Gaste energia antes.", texto: `Faça 15 minutos de ${passeio} antes do horário que costuma ser mais difícil.` },
        { titulo: "Comida que dá trabalho.", texto: "Sirva parte da refeição em brinquedo recheável ou tapete de lamber. Farejar e lamber acalmam." },
        { titulo: "Cantinho seguro.", texto: gato ? "Monte um ponto alto e uma toca onde ninguém incomoda. Gato calmo é gato que pode se esconder." : "Monte uma caminha em lugar tranquilo onde ninguém incomoda. É o refúgio dele." },
        { titulo: "Saídas sem drama.", texto: "Saia e volte sem festa. Comece com ausências de poucos minutos e aumente aos poucos." },
        { titulo: "Rotina previsível.", texto: "Mesmos horários de comida, brincadeira e descanso. Previsibilidade reduz ansiedade." },
        { titulo: "Revise a semana.", texto: "Compare com as anotações do dia 1. Se houver agressividade ou automutilação, procure um veterinário comportamentalista." },
      ],
    },
    articulacao: {
      tema: "mobilidade",
      dias: [
        { titulo: "Observe o movimento.", texto: `Veja como ${nome} levanta, sobe e pula. Filmar ajuda a comparar depois e a mostrar ao veterinário.` },
        { titulo: "Piso que não escorrega.", texto: "Coloque tapetes ou passadeiras nos caminhos mais usados. Escorregão é o maior inimigo da articulação." },
        { titulo: "Confira o peso.", texto: "Cada quilo a mais pesa nas articulações. Você deve sentir as costelas sem apertar." },
        { titulo: "Movimento curto e frequente.", texto: gato ? "Duas sessões de 5 minutos de brincadeira valem mais que uma longa." : "Dois passeios curtos valem mais que um longo. Evite saltos e escadas." },
        { titulo: "Cama de verdade.", texto: "Apoio macio e fora do chão frio. Articulação dolorida piora com frio e superfície dura." },
        { titulo: "Pergunte ao vet.", texto: "Converse sobre condroprotetores e sobre a dose certa para o peso. Mancar ou dor ao toque pedem consulta." },
        { titulo: "Compare os vídeos.", texto: "Filme de novo os mesmos movimentos. Essa é a linha de base para os próximos 30 dias." },
      ],
    },
    digestao: {
      tema: "digestão",
      dias: [
        { titulo: "Diário do pote.", texto: `Anote tudo que ${nome} come no dia, incluindo petiscos e o que cai da mesa.` },
        { titulo: "Horários fixos.", texto: "Refeições nos mesmos horários, em 2 ou 3 porções. Intestino gosta de rotina." },
        { titulo: "Coma devagar.", texto: "Se ele engole a comida, use comedouro lento ou espalhe a ração num tapete de farejar." },
        { titulo: "Água limpa e fresca.", texto: gato ? "Troque a água 2x ao dia e deixe potes em mais de um cômodo. Gato bebe pouco por natureza." : "Troque a água 2x ao dia e lave o pote. Água parada afasta o pet do pote." },
        { titulo: "Petisco com limite.", texto: "Petiscos devem ficar em até 10% das calorias do dia. O resto é alimento completo." },
        { titulo: "Troca de alimento só aos poucos.", texto: "Qualquer mudança de ração leva 7 dias, misturando a nova na antiga em proporção crescente." },
        { titulo: "Olhe o resultado.", texto: "Fezes firmes e regulares são o termômetro. Diarreia por mais de 48h, sangue ou vômito repetido: veterinário." },
      ],
    },
    bucal: {
      tema: "saúde bucal",
      dias: [
        { titulo: "Levante o lábio.", texto: "Olhe dentes e gengiva. Gengiva saudável é rosada; vermelha ou sangrando pede veterinário." },
        { titulo: "Acostume ao toque.", texto: "Passe o dedo enrolado em gaze nos dentes por alguns segundos e recompense." },
        { titulo: "Pasta certa.", texto: "Use apenas pasta veterinária. Pasta de humano tem flúor e xilitol, que fazem mal ao pet." },
        { titulo: "Primeira escovação.", texto: "30 segundos já valem. O objetivo desta semana é o hábito, não a perfeição." },
        { titulo: "Mastigação que limpa.", texto: gato ? "Ofereça petiscos de textura firme próprios para gatos, que ajudam na remoção de placa." : "Ofereça um mastigável natural do tamanho dele. Nunca osso cozido: ele lasca." },
        { titulo: "Água e pote limpos.", texto: "Lave o pote todo dia. O biofilme do pote também alimenta as bactérias da boca." },
        { titulo: "Agende a avaliação.", texto: "Tártaro já formado só sai com limpeza no veterinário. Depois dela, a escovação mantém." },
      ],
    },
    mimar: {
      tema: "enriquecimento",
      dias: [
        { titulo: "Caça ao petisco.", texto: "Esconda pedacinhos pela casa e deixe o faro trabalhar. Farejar cansa mais que correr." },
        { titulo: "Brinquedo novo de caixa.", texto: "Uma caixa de papelão com papel amassado e petiscos dentro vira o melhor brinquedo do mês." },
        { titulo: "Escovação carinho.", texto: "5 minutos de escova com calma. É cuidado com a pelagem e tempo de vínculo." },
        { titulo: gato ? "Território novo." : "Caminho novo.", texto: gato ? "Libere uma prateleira, janela ou cômodo diferente para explorar." : "Faça o passeio por uma rua diferente e deixe ele farejar à vontade." },
        { titulo: "Um truque novo.", texto: "5 minutos de treino com recompensa. Cabeça cansada é pet tranquilo." },
        { titulo: "Check-up em casa.", texto: "Olhe orelhas, dentes, unhas e pele. Prevenir é o melhor mimo." },
        { titulo: "Foto do mês.", texto: `Registre ${nome} no mesmo lugar todo mês. Você vai gostar de ver a evolução.` },
      ],
    },
  };

  return planos[r.foco];
}

export function nuncaNoPote(especie: Especie): string[] {
  return especie === "gato"
    ? ["Chocolate e cacau", "Cebola e alho", "Uva e uva-passa", "Lírios (a planta)", "Ossos cozidos", "Café e energéticos"]
    : ["Chocolate e cacau", "Uva e uva-passa", "Cebola e alho", "Xilitol (doce diet)", "Ossos cozidos", "Café e energéticos"];
}

export function protocolo(r: Respostas, criadoEm: string): string {
  const base = `${r.nomePet}${r.whatsapp}${criadoEm}`;
  let hash = 0;
  for (let i = 0; i < base.length; i++) hash = (hash * 31 + base.charCodeAt(i)) % 10000;
  return `FX-${String(hash).padStart(4, "0")}`;
}
