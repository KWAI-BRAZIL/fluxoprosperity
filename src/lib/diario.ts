import { reduzirNumero, somaBrutaNome, somaDigitos } from "./numerologia"

export type CartaTarot = {
  id: number
  nome: string
  resumo: string
  leitura: string
  favorece: string
  ritualTitulo: string
  passos: [string, string, string]
}

const ARCANOS: CartaTarot[] = [
  {
    id: 0,
    nome: "O Louco",
    resumo: "Começo honesto — um passo sem ter o mapa todo.",
    leitura:
      "Hoje pede um sim pequeno. Não é imprudência: é autorização para começar antes de se sentir 100% pronta.",
    favorece: "Inscrições, primeiros contatos e ideias que ainda não têm nome",
    ritualTitulo: "Ritual do começo",
    passos: [
      "Escreva uma frase: “Eu posso começar sem ter tudo.”",
      "Dê um único passo concreto de 10 minutos no que você vem adiando.",
      "Agradeça em voz alta por esse primeiro movimento.",
    ],
  },
  {
    id: 1,
    nome: "O Mago",
    resumo: "Recursos que você já tem — hora de usar.",
    leitura:
      "Nada falta no kit. O dia pede canalizar talento, agenda e palavra na mesma direção.",
    favorece: "Propostas, apresentações e pedir o valor do seu trabalho",
    ritualTitulo: "Ritual do Mago",
    passos: [
      "Liste 3 recursos que você já tem (tempo, fala, ferramenta).",
      "Escolha um e use-o hoje em algo que gere valor.",
      "Diga: “O que eu tenho é suficiente para o próximo passo.”",
    ],
  },
  {
    id: 2,
    nome: "A Sacerdotisa",
    resumo: "Escuta interna antes da pressa.",
    leitura:
      "A resposta não está no feed. É dia de silêncio curto e de não fechar acordo só para agradar.",
    favorece: "Decisões que pedem intuição e recusar o que não combina",
    ritualTitulo: "Ritual da Sacerdotisa",
    passos: [
      "Sente-se 3 minutos em silêncio, sem celular.",
      "Anote a primeira frase que vier, sem editar.",
      "Só então olhe mensagens e pendências.",
    ],
  },
  {
    id: 3,
    nome: "A Imperatriz",
    resumo: "Nutrir o corpo e o que gera fruto.",
    leitura:
      "Abundância hoje é cultivo: comida, descanso, um projeto que cresce se for cuidado.",
    favorece: "Cuidar de si e de trabalhos que dão retorno com o tempo",
    ritualTitulo: "Ritual da Imperatriz",
    passos: [
      "Beba água e coma algo de verdade, sem tela.",
      "Faça um gesto de cuidado com o espaço onde você trabalha.",
      "Agradeça uma coisa que já está crescendo na sua vida.",
    ],
  },
  {
    id: 4,
    nome: "O Imperador",
    resumo: "Limite, estrutura, combinado.",
    leitura:
      "O fluxo abre quando há regra clara: horário, preço, “não”. Autoridade sem dureza.",
    favorece: "Organizar contas, prazos e combinados profissionais",
    ritualTitulo: "Ritual do Imperador",
    passos: [
      "Escreva uma regra simples para o seu dinheiro hoje.",
      "Cumpra essa regra em uma decisão real (gastar ou não).",
      "Feche o dia revisando o que ficou combinado consigo.",
    ],
  },
  {
    id: 5,
    nome: "O Hierofante",
    resumo: "Aprender com quem já trilhou.",
    leitura:
      "Não é dia de reinventar a roda. Mentoria, curso curto, conselho de alguém ético rendem mais que teimosia.",
    favorece: "Estudar, pedir orientação e seguir um método",
    ritualTitulo: "Ritual do Hierofante",
    passos: [
      "Escolha uma fonte confiável (pessoa ou texto) sobre o seu momento.",
      "Anote uma lição aplicável hoje.",
      "Aplique essa lição em uma decisão pequena.",
    ],
  },
  {
    id: 6,
    nome: "Os Enamorados",
    resumo: "Escolha alinhada com o que você ama.",
    leitura:
      "Há uma encruzilhada. O critério não é “o que os outros acham” — é o que você consegue sustentar com o coração.",
    favorece: "Conversas honestas e escolhas de parceria (trabalho ou vida)",
    ritualTitulo: "Ritual da escolha",
    passos: [
      "Escreva as duas opções com o corpo: o que aperta e o que alivia.",
      "Diga em voz alta a escolha que alivia, mesmo que assuste.",
      "Comunique um pedaço dessa escolha para alguém de confiança.",
    ],
  },
  {
    id: 7,
    nome: "O Carro",
    resumo: "Foco. Direção. Sem desviar no primeiro “não”.",
    leitura:
      "O dia favorece avançar no que já foi decidido. Menos abas abertas, mais uma estrada.",
    favorece: "Entrevistas, deslocamentos e concluir o que está no meio",
    ritualTitulo: "Ritual do Carro",
    passos: [
      "Defina UM destino para as próximas 5 horas.",
      "Silencie o que compete com esse destino.",
      "Celebre cada trecho andado, não só a chegada.",
    ],
  },
  {
    id: 8,
    nome: "A Força",
    resumo: "Mansidão com firmeza — sem se violentar.",
    leitura:
      "A abundância hoje não vem de se forçar. Vem de tratar o medo com respeito e seguir mesmo assim.",
    favorece: "Negociações calmas e persistir sem se desgastar",
    ritualTitulo: "Ritual da Força",
    passos: [
      "Coloque a mão no peito e respire 8 vezes, lenta.",
      "Nomeie o medo (“estou com medo de…”).",
      "Faça a ação mínima que o medo tentava adiar.",
    ],
  },
  {
    id: 9,
    nome: "O Eremita",
    resumo: "Pausa para ouvir a própria lanterna.",
    leitura:
      "Não é isolamento: é recuo estratégico. Menos opinião alheia, mais clareza sua.",
    favorece: "Revisar rumos e não aceitar convites por culpa",
    ritualTitulo: "Ritual do Eremita",
    passos: [
      "Desligue notificações por 20 minutos.",
      "Pergunte: “O que eu sei que estou fingindo não saber?”",
      "Anote a resposta e guarde — não precisa postar.",
    ],
  },
  {
    id: 10,
    nome: "A Roda da Fortuna",
    resumo: "Ciclo que gira — prepare-se para receber a vez.",
    leitura:
      "Nada é permanente, nem a seca. Hoje é dia de se posicionar onde a sorte tem como te achar: visível, disponível, honesta.",
    favorece: "Aceitar convites, atualizar currículo e estar encontrável",
    ritualTitulo: "Ritual da Roda",
    passos: [
      "Atualize um canal onde oportunidades chegam (bio, currículo, status).",
      "Diga: “Eu estou disponível para o que é meu.”",
      "Faça um gesto de gratidão pelo que já girou a seu favor.",
    ],
  },
  {
    id: 11,
    nome: "A Justiça",
    resumo: "Equilíbrio — o que é justo também para você.",
    leitura:
      "O dia pede contas claras: o que você deve, o que te devem, o que você se deve. Sem drama, com verdade.",
    favorece: "Acertos financeiros, contratos e conversas sobre o que é justo",
    ritualTitulo: "Ritual da Justiça",
    passos: [
      "Anote uma pendência (valor, desculpa ou combinado).",
      "Dê um passo para equilibrar: pagar, cobrar ou pedir desculpas.",
      "Encerre com: “Eu mereço relações justas.”",
    ],
  },
  {
    id: 12,
    nome: "O Enforcado",
    resumo: "Outro ângulo. Soltar o controle por um instante.",
    leitura:
      "Se travou, não empurre. Mude a pergunta. O desbloqueio vem de ver a cena de cabeça para baixo.",
    favorece: "Pausar decisões impulsivas e pedir um segundo olhar",
    ritualTitulo: "Ritual do Enforcado",
    passos: [
      "Antes de gastar ou responder, espere 10 minutos.",
      "Reescreva o problema com outras palavras.",
      "Pergunte a alguém de confiança só para ouvir, sem se defender.",
    ],
  },
  {
    id: 13,
    nome: "A Morte",
    resumo: "Fim necessário — espaço para o que quer nascer.",
    leitura:
      "Não é catástrofe: é compostagem. Algo já não cabe. Soltar liberta energia e dinheiro preso em ciclo velho.",
    favorece: "Encerrar contas, hábitos e trabalhos que já cumpriram o papel",
    ritualTitulo: "Ritual de encerrar",
    passos: [
      "Escreva o que você já sabe que acabou.",
      "Rasgue ou apague com respeito, sem drama.",
      "Diga: “Eu abro espaço para o que é vivo.”",
    ],
  },
  {
    id: 14,
    nome: "A Temperança",
    resumo: "Mistura certa. Nem excesso, nem falta.",
    leitura:
      "O meio-termo é poder. Hoje a abundância está no ritmo sustentável, não no tudo-ou-nada.",
    favorece: "Ajustar rotina, orçamento e combinar esforço com descanso",
    ritualTitulo: "Ritual da Temperança",
    passos: [
      "Escolha um excesso para reduzir pela metade só hoje.",
      "Escolha uma falta para nutrir um pouco (água, pausa, comida).",
      "Agradeça o corpo por aguentar o caminho.",
    ],
  },
  {
    id: 15,
    nome: "O Diabo",
    resumo: "Olhar o laço — sem se envergonhar de ser humana.",
    leitura:
      "O dia ilumina o impulso: gastar para anestesiar, prometer demais, repetir o ciclo. Ver já é metade da libertação. Peça ajuda se o laço apertar.",
    favorece: "Nomear vícios de consumo e escolher um limite gentil",
    ritualTitulo: "Ritual do laço visível",
    passos: [
      "Nomeie o impulso (“quero isso para não sentir X”).",
      "Espere 10 minutos e beba água antes de agir.",
      "Se pesar, use o atalho Cuidando de mim — você não precisa sozinha.",
    ],
  },
  {
    id: 16,
    nome: "A Torre",
    resumo: "Queda de estrutura falsa. Verdade no lugar.",
    leitura:
      "Pode vir um “não” ou uma notícia seca. Não é o fim da abundância — é o fim de um acordo que já não te sustentava.",
    favorece: "Aceitar verdades e reconstruir em base mais honesta",
    ritualTitulo: "Ritual da Torre",
    passos: [
      "Respire 4 tempos entra, 6 tempos sai, por 2 minutos.",
      "Escreva o que desmoronou e o que permanece de pé.",
      "Peça apoio concreto a uma pessoa ou ao espaço Cuidando de mim.",
    ],
  },
  {
    id: 17,
    nome: "A Estrela",
    resumo: "Esperança renovada depois do difícil.",
    leitura:
      "Depois de um período difícil, uma porta se abre. É dia de acreditar em algo novo — inclusive em você mesma.",
    favorece: "Propostas de trabalho e conversas sobre dinheiro",
    ritualTitulo: "Ritual da Estrela",
    passos: [
      "Acenda uma vela branca ou amarela (ou acenda a luz e respire).",
      "Escreva 1 frase: “Eu mereço receber.”",
      "Releia em voz alta 3 vezes.",
    ],
  },
  {
    id: 18,
    nome: "A Lua",
    resumo: "Névoa — não decida no susto.",
    leitura:
      "Nem tudo que parece urgência é. Hoje a clareza vem devagar. Desconfie de pressa e de promessa milagrosa.",
    favorece: "Esperar um dia antes de grandes gastos ou assinaturas",
    ritualTitulo: "Ritual da Lua",
    passos: [
      "Anote o medo sem tentar resolvê-lo agora.",
      "Adie por 24h qualquer decisão cara ou irreversível.",
      "Peça à sua intuição um sinal simples amanhã de manhã.",
    ],
  },
  {
    id: 19,
    nome: "O Sol",
    resumo: "Visibilidade. Calor. Sim que aquece.",
    leitura:
      "É dia de se deixar ver. Sua abundância aumenta quando você aparece com verdade, não com personagem.",
    favorece: "Mostrar trabalho, celebrar vitórias pequenas e pedir indicação",
    ritualTitulo: "Ritual do Sol",
    passos: [
      "Compartilhe uma conquista pequena com alguém.",
      "Exponha-se 1 vez: mensagem, post, candidatura.",
      "Agradeça a luz que já chegou, sem minimizá-la.",
    ],
  },
  {
    id: 20,
    nome: "O Julgamento",
    resumo: "Chamado. Um capítulo pede que você atenda.",
    leitura:
      "Algo em você já sabe. O dia favorece o “sim” maduro: voltar para um caminho, retomar um contato, honrar um chamado.",
    favorece: "Retomar conversas, recomeços profissionais e se perdoar",
    ritualTitulo: "Ritual do chamado",
    passos: [
      "Escreva o chamado que você anda adiando.",
      "Envie uma mensagem ou dê um passo mínimo nessa direção.",
      "Perdoe uma versão antiga de você que não sabia o que sabe agora.",
    ],
  },
  {
    id: 21,
    nome: "O Mundo",
    resumo: "Ciclo que se completa — e outro que pode começar.",
    leitura:
      "Há colheita. Reconheça o que fechou. A abundância do próximo giro começa no “obrigada” do que já foi.",
    favorece: "Concluir entregas, receber pagamentos e celebrar o ciclo",
    ritualTitulo: "Ritual do Mundo",
    passos: [
      "Marque um “feito” que você ainda trata como pendente.",
      "Celebre com um gesto simples (música, chá, caminhada).",
      "Diga: “Eu fecho este ciclo em paz e abro o próximo.”",
    ],
  },
]

function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Data de hoje em America/Sao_Paulo, ISO YYYY-MM-DD. */
export function hojeISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

export function somarDiasISO(iso: string, delta: number): string {
  const [ano, mes, dia] = iso.split("-").map(Number)
  const data = new Date(ano, mes - 1, dia)
  data.setDate(data.getDate() + delta)
  const y = data.getFullYear()
  const m = String(data.getMonth() + 1).padStart(2, "0")
  const d = String(data.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function diaDaSemana(dataISO: string): number {
  const [ano, mes, dia] = dataISO.split("-").map(Number)
  return new Date(ano, mes - 1, dia).getDay()
}

/** Últimos 7 dias (do mais antigo ao de hoje). */
export function progressoSemana(rituais: string[], hoje = hojeISO()): boolean[] {
  return [6, 5, 4, 3, 2, 1, 0].map((offset) => rituais.includes(somarDiasISO(hoje, -offset)))
}

const TEMA_DIA = [
  "revisar o que ficou aberto e não gastar por tédio",
  "propostas de trabalho e pedidos claros",
  "conversas sobre dinheiro e combinados justos",
  "organizar a rotina que sustenta a sua renda",
  "fechar pendências e cobrar o que já é seu",
  "mostrar seu trabalho e aceitar indicação",
  "descansar de verdade — sem compra por impulso",
]

const TEMA_DESTINO: Record<number, string> = {
  1: "começar sozinha, sem esperar autorização",
  2: "parceria — receber também é cooperar",
  3: "falar o preço em voz alta",
  4: "estrutura: um combinado simples com você mesma",
  5: "mudança com direção, não fuga",
  6: "se colocar na lista de quem merece cuidado",
  7: "receber, não só poupar por medo",
  8: "tratar dinheiro sem culpa",
  9: "encerrar um ciclo que já não paga",
  11: "transformar intuição em um gesto concreto",
  22: "descer a visão para um passo dos próximos 90 dias",
}

const ATENCAO_ARCANO: Record<number, string> = {
  0: "Não confunda coragem com salto no escuro sem rede — um passo basta.",
  1: "Evite dispersar talento em cinco frentes. Um canal só.",
  2: "Não ignore o que o corpo já sabe só para agradar o grupo.",
  3: "Cuidado para não doar energia criativa sem contraprestação.",
  4: "Autoridade sem escuta vira muro. Combine, não imponha.",
  5: "Não aceite regra alheia que fere o que você já escolheu.",
  6: "Escolha consciente — não escolha por medo de ficar só.",
  7: "Direção sem pausa cansa o cavalo. Celebre um trecho.",
  8: "Força não é engolir o que dói. Nomeie o limite.",
  9: "Isolamento demais vira fuga. Traga um insight para o mundo.",
  10: "Não gaste o vento a favor em impulso. Surfe, não se jogue.",
  11: "Evite barganha injusta “só para fechar”. O fiel da balança é você.",
  12: "Pausa não é paralisia. Combine até quando dura o silêncio.",
  13: "Não corte o que ainda está vivo por pressa de “passar de fase”.",
  14: "Meio-termo não é se apagar. Misture sem desaparecer.",
  15: "Olhe o apego: app, pessoa ou conta que te prende no mesmo looping.",
  16: "Não reconstrua o mesmo predinho no mesmo terreno rachado.",
  17: "Esperança sem gesto vira espera. Um ato pequeno ancora a fé.",
  18: "Não feche negócio na névoa. Adie o que puder adiar.",
  19: "Brilho demais cega. Compartilhe o palco.",
  20: "Não se julgue pelo capítulo antigo. Responda ao chamado de agora.",
  21: "Ciclo fechado não pede reprise. Agradeça e siga.",
}

export type ConteudoDiario = {
  data: string
  carta: CartaTarot
  numeroSorte: number
  favorece: string
  atencao: string
  conselho: string
}

export function conteudoDiario(params: {
  numeroDestino: number
  nome?: string | null
  dataNascimento?: string | null
  dataISO?: string
}): ConteudoDiario {
  const dataISO = params.dataISO ?? hojeISO()
  const n = params.numeroDestino
  const seed = hashString(`${dataISO}:${n}`)
  const carta = ARCANOS[seed % ARCANOS.length]
  const bruto =
    somaBrutaNome(params.nome ?? "") +
    somaDigitos((params.dataNascimento ?? "").replace(/-/g, "")) +
    somaDigitos(dataISO.replace(/-/g, "")) +
    n
  const numeroSorte = (Math.max(bruto, 1) % 90) + 10
  const temaNumero = TEMA_DESTINO[n] ?? TEMA_DESTINO[reduzirNumero(n)] ?? TEMA_DESTINO[1]
  const favorece = `${TEMA_DIA[diaDaSemana(dataISO)]}, com ênfase em ${temaNumero}.`
  const atencao = ATENCAO_ARCANO[carta.id] ?? "Hoje, não decida só no impulso."
  const conselho = `${carta.leitura} O seu número ${n} pede ${temaNumero}.`
  return {
    data: dataISO,
    carta,
    numeroSorte,
    favorece,
    atencao,
    conselho,
  }
}

export function arcanosMaiores(): CartaTarot[] {
  return ARCANOS
}
