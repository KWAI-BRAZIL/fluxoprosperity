import type { CartaTarot } from "./diario"
import { primeiroNome } from "./numerologia"

type RitualBase = {
  perguntas: [string, string, string]
  ecos: [string, string]
  conselho: string
}

export type RitualChat = {
  abertura: string
  perguntas: [string, string, string]
  reacoes: [string, string]
  conselho: string
}

const ABERTURA_ESPECIAL: Record<number, string> = {
  15: "O laço que te prende hoje não é feito de correntes, mas de hábitos sutis. Olhar para ele sem julgar é a chave da soltura.",
  17: "A Estrela pousa sobre você hoje. Depois de um período difícil, uma porta se abre — mas só quem para pra ouvir consegue atravessar.",
}

const CHAT: Record<number, RitualBase> = {
  0: {
    perguntas: [
      "O que você adia por medo de não fazer perfeito?",
      "Qual é o movimento mínimo de 10 minutos que você pode fazer hoje?",
      "Como você honra esse gesto hoje, sem esperar o chão perfeito?",
    ],
    ecos: [
      "A busca pela perfeição é só a sombra do medo vestida de prudência.",
      "Um gesto simples no plano físico tem mais força oracular do que dez anos de intenção na mente.",
    ],
    conselho:
      "O Louco não espera o chão; ele constrói o passo ao pisar.",
  },
  1: {
    perguntas: [
      "Quais 3 recursos você já tem hoje (tempo, fala, ferramenta, gente)?",
      "Qual deles você consegue usar ainda hoje para gerar algum valor?",
      "O que muda se você tratar o que já tem como suficiente para o próximo passo?",
    ],
    ecos: [
      "Nada disso é pouco. É o kit que você já carrega.",
      "Escolher um só evita a paralisia de querer usar tudo.",
    ],
    conselho:
      "O Mago trabalha com o que está na mesa. Parar de esperar o kit perfeito é o feitiço. Use um recurso hoje — o resto se organiza em movimento, não em espera.",
  },
  2: {
    perguntas: [
      "O que a pressa está tentando te fazer aceitar agora?",
      "Qual frase veio primeiro, sem editar, quando você parou um instante?",
      "O que você recusa hoje para não trair essa escuta?",
    ],
    ecos: [
      "A pressa quase nunca é intuição. Quase sempre é medo disfarçado.",
      "Essa frase já é um recado. Não precisa polir.",
    ],
    conselho:
      "A Sacerdotisa pede silêncio antes do sim. Se algo só fecha para agradar, não é acordo: é abandono de si. Guarde o que você ouviu e deixe a decisão esperar a clareza, não o aplauso.",
  },
  3: {
    perguntas: [
      "O que o seu corpo está pedindo agora (água, comida, descanso, pausa)?",
      "Qual espaço ou projeto seu cresce se for cuidado hoje, mesmo 5 minutos?",
      "O que já está frutificando na sua vida e você ainda trata como “não é nada”?",
    ],
    ecos: [
      "Nutrir o corpo não é distração. É a base do resto.",
      "Cuidado pequeno e repetido vira colheita. Não o gesto heroico de uma vez.",
    ],
    conselho:
      "A Imperatriz lembra: abundância é cultivo. Alimenta o que já está vivo — inclusive você. O que é minimizado hoje vira escassez amanhã. Reconheça o fruto sem pedir desculpas por ele existir.",
  },
  4: {
    perguntas: [
      "Qual regra simples você quer para o seu dinheiro só hoje?",
      "Em qual decisão real (gastar, cobrar, recusar) essa regra entra?",
      "O que fica combinado com você mesma até o fim do dia?",
    ],
    ecos: [
      "Regra curta funciona melhor que promessa grande.",
      "Autoridade sem dureza: um “não” claro também é cuidado.",
    ],
    conselho:
      "O Imperador abre fluxo com limite, não com punição. Uma regra cumprida vale mais que dez intenções. Honre o combinado consigo — é assim que o dinheiro para de escorrer por falta de borda.",
  },
  5: {
    perguntas: [
      "De quem ou de qual fonte ética você pode aprender neste momento?",
      "Qual lição disso dá para aplicar hoje, sem esperar um curso inteiro?",
      "Onde a teimosia de “eu resolvo sozinha” está te saindo cara?",
    ],
    ecos: [
      "Pedir método não é fraqueza. É atalho honesto.",
      "Uma lição usada hoje vale mais que dez salvas no celular.",
    ],
    conselho:
      "O Hierofante pede que você não reinvente a roda. Escolha uma orientação boa e pratique um pedaço. Orgulho isolado custa caro; um passo com método devolve clareza — e às vezes, dinheiro.",
  },
  6: {
    perguntas: [
      "Quais são as duas opções na sua encruzilhada agora?",
      "No corpo: o que aperta e o que alivia em cada uma?",
      "Que pedaço da escolha que alivia você consegue comunicar hoje?",
    ],
    ecos: [
      "Nomear as duas já tira o nó do “não sei o que sinto”.",
      "O corpo costuma chegar antes da cabeça. Vale escutar.",
    ],
    conselho:
      "Os Enamorados pedem escolha que você consiga sustentar, não a que os outros aplaudem. O que alivia pode assustar — e ainda assim ser o caminho justo. Diga um pedaço em voz alta. Escolha não anunciada vira prisão.",
  },
  7: {
    perguntas: [
      "Qual é o ÚNICO destino que importa nas próximas 5 horas?",
      "O que compete com isso (abas, gente, distração) e pode ser silenciado?",
      "Como você celebra um trecho andado, sem esperar a chegada total?",
    ],
    ecos: [
      "Um destino. O resto é barulho com cara de urgência.",
      "Foco não é dureza. É recusar o que não é a estrada de hoje.",
    ],
    conselho:
      "O Carro pede direção, não pressa. Feche o que não é a estrada das próximas horas. Celebre o trecho — quem só valida a linha de chegada nunca sente que avançou, e isso drena a abundância no meio do caminho.",
  },
  8: {
    perguntas: [
      "Onde você está se forçando em vez de se tratar com firmeza mansa?",
      "Complete: “estou com medo de…” — sem se corrigir.",
      "Qual ação mínima esse medo estava adiando, e que cabe hoje?",
    ],
    ecos: [
      "Nomear o medo já tira metade do volume dele.",
      "Ação mínima não é preguiça. É respeito pelo sistema nervoso.",
    ],
    conselho:
      "A Força não é se violentar para “merecer”. É seguir com o medo sentado ao lado, não no volante. Faça o mínimo adiável hoje. Persistência calma fatura mais, a médio prazo, do que o surto de bravura que te esgota.",
  },
  9: {
    perguntas: [
      "De qual opinião alheia você precisa se afastar um pouco hoje?",
      "O que você sabe que está fingindo não saber?",
      "Se não precisasse postar nem explicar: qual verdade você guarda só para si?",
    ],
    ecos: [
      "Recuo estratégico não é isolamento. É lanterna.",
      "Essa pergunta costuma doer porque já tem resposta.",
    ],
    conselho:
      "O Eremita pede a sua lanterna, não o holofote dos outros. O que você fingia não saber já é bússola. Não precisa virar conteúdo. Precisa virar critério — inclusive para convites e gastos feitos por culpa.",
  },
  10: {
    perguntas: [
      "Onde as oportunidades te encontram hoje (bio, currículo, conversa, status)?",
      "O que falta atualizar para você ficar encontrável de verdade?",
      "O que já girou a seu favor e merece um obrigada concreto?",
    ],
    ecos: [
      "A Roda gira. Quem se esconde não é encontrado no giro.",
      "Visível e honesta é diferente de se vender barato.",
    ],
    conselho:
      "A Roda da Fortuna não pede milagre: pede posição. Atualize um canal, diga que está disponível para o que é seu, agradeça o que já virou. Sorte encontra quem está na sala — não quem se esconde esperando “o momento certo”.",
  },
  11: {
    perguntas: [
      "Qual pendência está desequilibrada: um valor, um combinado ou uma desculpa?",
      "O passo justo é pagar, cobrar ou pedir desculpas — qual cabe a você?",
      "Onde você ainda aceita relação que não é justa com você?",
    ],
    ecos: [
      "Conta clara não é drama. É higiene.",
      "Equilíbrio também é o que você se deve, não só o que deve aos outros.",
    ],
    conselho:
      "A Justiça pede acerto, não martírio. Um passo para equilibrar — pagar, cobrar, desculpar — já muda o ar. Você merece relações justas, inclusive a relação com o próprio dinheiro. O que fica em aberto drena mais que o valor em si.",
  },
  12: {
    perguntas: [
      "Qual decisão (gasto, resposta, acordo) está vindo com pressa demais?",
      "Se reescrever o problema com outras palavras, como ele fica?",
      "A quem você pode pedir um segundo olhar — só para ouvir, sem se defender?",
    ],
    ecos: [
      "Pausa de 10 minutos já quebra o feitiço da urgência falsa.",
      "Outro ângulo não é fraqueza. É inteligência.",
    ],
    conselho:
      "O Enforcado pede soltar o controle um instante. Se travou, não empurre: mude a pergunta. Adie o irreversível. Ouvir alguém de confiança, sem se defender, costuma valer mais do que insistir no mesmo ângulo até sangrar o bolso ou a paz.",
  },
  13: {
    perguntas: [
      "O que você já sabe que acabou — hábito, conta, trabalho, história?",
      "O que fica preso em você se você não encerrar isso com respeito?",
      "O que pode nascer no espaço que esse fim libera?",
    ],
    ecos: [
      "Fim não é catástrofe. É compostagem.",
      "Soltar com respeito é diferente de explodir ou fingir que não doeu.",
    ],
    conselho:
      "A Morte neste baralho é ciclo, não ameaça. Encerrar o que já cumpriu o papel libera energia e dinheiro presos no morto-vivo. Abra espaço para o que é vivo. Não precisa de ritual grandioso: um reconhecimento honesto já é o corte limpo.",
  },
  14: {
    perguntas: [
      "Qual excesso você reduz pela metade só hoje?",
      "Qual falta você nutre um pouco (água, pausa, comida, sono)?",
      "Onde o tudo-ou-nada tem te custado paz ou dinheiro?",
    ],
    ecos: [
      "Meio-termo não é mediocridade. É ritmo que dura.",
      "Nutrir a falta e cortar o excesso é a mesma dança.",
    ],
    conselho:
      "A Temperança diz: abundância sustentável mora no meio. Nem apagar, nem explodir. Ajuste um excesso e uma falta hoje. O corpo que aguenta o caminho merece o crédito — e um ritmo que não cobre em crise o que a rotina poderia pagar em paz.",
  },
  15: {
    perguntas: [
      "Qual impulso automático você sente vontade de repetir hoje para não encarar o desconforto?",
      "Escreva: “Eu busco essa ilusão para não sentir…”",
      "Se o laço apertar, a quem ou aonde você pede ajuda (CVV 188, alguém de confiança)?",
    ],
    ecos: [
      "A anestesia do hábito é o altar onde sacrificamos a presença para não sentir o peso.",
      "Quando você dá nome à angústia, o contrato invisível com o impulso perde a força.",
    ],
    conselho:
      "Beba um copo d'água, pouse os pés no chão e aguarde 10 minutos antes de ceder à esquiva. Se o aperto for maior que a sua estrutura, ligue 188. O ritual de hoje é sustentar a sua presença.",
  },
  16: {
    perguntas: [
      "O que desmoronou ou ameaça desmoronar nesta temporada?",
      "O que permanece de pé, mesmo assim?",
      "Que apoio concreto (pessoa, CVV, conversa) você aceita pedir?",
    ],
    ecos: [
      "Queda de estrutura falsa dói. E também mostra o alicerce real.",
      "O que permanece é o material da reconstrução.",
    ],
    conselho:
      "A Torre tira o acordo que já não te sustentava. Não é o fim da abundância — é o fim da mentira confortável. Respira. Reconstrói no que ficou de pé. Pedir apoio concreto é parte da obra, não um anexo opcional.",
  },
  17: {
    perguntas: [
      "O que você anda adiando por não se sentir 100% pronta?",
      "Qual seria esse passo, hoje?",
      "Em que conversa sobre trabalho ou dinheiro essa esperança vira um gesto hoje?",
    ],
    ecos: [
      "A Estrela não pede coragem de uma vez só — pede um passo de 10 minutos.",
      "Merecer receber não é arrogância. É correção de rota.",
    ],
    conselho:
      "A Estrela abre depois do difícil. Acredite em algo novo — inclusive em você. Leve a frase “eu mereço receber” para uma conversa real: proposta, preço, pedido. Esperança que não vira gesto vira poster. Você já sobreviveu ao trecho escuro; agora é hora de se deixar encontrar pela porta.",
  },
  18: {
    perguntas: [
      "Qual medo está vestido de urgência agora?",
      "Qual decisão cara ou irreversível você pode adiar 24 horas?",
      "Que sinal simples você pede à intuição para amanhã de manhã?",
    ],
    ecos: [
      "Névoa pede espera, não bravata.",
      "Adiar o irreversível é sabedoria, não covardia.",
    ],
    conselho:
      "A Lua lembra: nem toda urgência é verdadeira. Desconfie de pressa e de promessa milagrosa. Anote o medo, não o resolva no susto. Amanhã a névoa costuma baixar. Decisão de dinheiro na neblina é o tipo de passo que a abundância depois cobra com juros.",
  },
  19: {
    perguntas: [
      "Qual conquista pequena você ainda minimiza?",
      "Onde você pode se expor uma vez hoje (mensagem, post, candidatura)?",
      "Como agradece a luz que já chegou, sem reduzir ela a “foi sorte”?",
    ],
    ecos: [
      "O que é pequeno para o hábito da escassez costuma ser grande na vida real.",
      "Aparecer com verdade rende mais do que personagem brilhante.",
    ],
    conselho:
      "O Sol pede visibilidade honesta. Mostra o trabalho, pede indicação, celebra o que já aquece. Minimizar vitória é uma forma educada de recusar abundância. Deixa a luz ser luz. Um gesto de se deixar ver hoje vale mais do que dez planos de “quando estiver pronta”.",
  },
  20: {
    perguntas: [
      "Qual chamado você anda adiando — contato, caminho, recomeço?",
      "Qual passo mínimo honra isso hoje (uma mensagem já conta)?",
      "Que versão antiga de você merece perdão por não saber o que você sabe agora?",
    ],
    ecos: [
      "O chamado maduro não grita. Ele espera você atender.",
      "Passo mínimo é atendimento. Perfeição é desculpa.",
    ],
    conselho:
      "O Julgamento é um sim adulto: retomar, voltar, perdoar a si. Envie o recado, dê o passo curto. A versão antiga fez o que pôde com o que tinha. Abundância do próximo capítulo pede que você não se puna por ter demorado — pede que atenda agora.",
  },
  21: {
    perguntas: [
      "Qual “feito” você ainda trata como pendente, sendo que já está pronto?",
      "Como celebra isso hoje, de um jeito simples (chá, música, caminhada)?",
      "O que você fecha em paz para abrir o próximo ciclo?",
    ],
    ecos: [
      "Colheita que não é reconhecida vira ansiedade disfarçada de lista.",
      "Celebrar não é futilidade. É fechar o ciclo para o dinheiro e a energia circularem.",
    ],
    conselho:
      "O Mundo é conclusão. Marque o feito, receba o pagamento emocional (e o real, se estiver na fila). Agradeça o que foi. O próximo giro começa no obrigada — não na cobrança eterna de uma versão sua que já entregou.",
  },
}

export function trechoResposta(texto: string, max = 52): string {
  const t = texto.trim().replace(/\s+/g, " ")
  if (!t) return "…"
  const frase = (t.split(/(?<=[.!?])\s/)[0] ?? t).replace(/^["“]+|["”]+$/g, "")
  if (frase.length <= max) return frase
  const corte = frase.slice(0, max)
  const ultimoEspaco = corte.lastIndexOf(" ")
  return `${(ultimoEspaco > 20 ? corte.slice(0, ultimoEspaco) : corte).trim()}…`
}

export function montarEco(resposta: string, reacao: string, proximaPergunta: string): string {
  return `“${trechoResposta(resposta)}” — ${reacao}\n\n${proximaPergunta}`
}

export function ritualDaCarta(carta: CartaTarot): RitualChat {
  const base = CHAT[carta.id]
  const perguntas: [string, string, string] = base?.perguntas ?? [
    `${carta.passos[0]} — o que isso desperta em você?`,
    `${carta.passos[1]} — como você faz isso hoje?`,
    `${carta.passos[2]} — o que você leva daqui?`,
  ]
  const reacoes: [string, string] = base?.ecos ?? [
    "Estou com você. Continua.",
    "Isso já ilumina o próximo passo.",
  ]
  return {
    abertura:
      ABERTURA_ESPECIAL[carta.id] ??
      `${carta.nome} pousa sobre você hoje. ${carta.leitura}`,
    perguntas,
    reacoes,
    conselho: base?.conselho ?? carta.leitura,
  }
}

export function conselhoDoRitual(
  carta: CartaTarot,
  respostas: string[],
  nomeCompleto: string | null,
): string {
  const chat = ritualDaCarta(carta)
  const nome = primeiroNome(nomeCompleto ?? "") || "você"
  const a = trechoResposta(respostas[0] ?? "", 90)
  const b = trechoResposta(respostas[1] ?? "", 90)
  const c = trechoResposta(respostas[2] ?? "", 90)
  return `${nome}, você reconheceu “${a}” e escolheu “${b}”. Fechou com “${c}”. Honra o que você acabou de nomear — esse já é o ritual. ${chat.conselho}`
}
