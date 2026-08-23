/** Tabela pitagórica clássica (1–9). */
const PITAGORICA: Record<string, number> = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f: 6,
  g: 7,
  h: 8,
  i: 9,
  j: 1,
  k: 2,
  l: 3,
  m: 4,
  n: 5,
  o: 6,
  p: 7,
  q: 8,
  r: 9,
  s: 1,
  t: 2,
  u: 3,
  v: 4,
  w: 5,
  x: 6,
  y: 7,
  z: 8,
}

export type SignificadoNome = {
  numero: number
  texto: string
  pontoForte: string
  bloqueio: string
}

export type SignificadoDestino = {
  numero: number
  texto: string
  favorece: string
  cuidado: string
  movimento: string
}

const SIGNIFICADO_NOME: Record<number, Omit<SignificadoNome, "numero">> = {
  1: {
    texto:
      "Pessoas com essa vibração abrem caminhos sozinhas. Tendem a liderar — e também a achar que precisam dar conta de tudo sem pedir o valor justo.",
    pontoForte: "Iniciativa e coragem de começar",
    bloqueio: "Dificuldade de pedir ajuda (e de cobrar)",
  },
  2: {
    texto:
      "O nome vibra em cooperação. Você sente o ambiente e une pessoas — mas costuma ceder o próprio espaço para manter a paz, inclusive na hora de negociar.",
    pontoForte: "Sensibilidade e parceria",
    bloqueio: "Se apagar para não desagradar",
  },
  3: {
    texto:
      "Pessoas com essa vibração atraem oportunidades através da comunicação — mas costumam se subestimar na hora de cobrar o que merecem.",
    pontoForte: "Carisma natural",
    bloqueio: "Medo de se expor",
  },
  4: {
    texto:
      "Seu nome carrega estrutura. Você constrói no detalhe e honra o combinado — o risco é travar esperando o momento “perfeito” para receber.",
    pontoForte: "Constância e organização",
    bloqueio: "Rigidez e medo de mudar o plano",
  },
  5: {
    texto:
      "A vibração do seu nome pede movimento. Mudança te alimenta — e a inquietação às vezes faz você abandonar algo bom antes de colher.",
    pontoForte: "Adaptabilidade e faro para o novo",
    bloqueio: "Impulso de fugir quando fica estável",
  },
  6: {
    texto:
      "Seu nome vibra em cuidado. Você sustenta gente e ambientes — e pode esquecer de colocar o próprio nome na lista de quem merece receber.",
    pontoForte: "Responsabilidade afetiva",
    bloqueio: "Carregar o mundo sem se priorizar",
  },
  7: {
    texto:
      "Há uma frequência analítica no seu nome. Você percebe o que os outros não veem — e às vezes se isola tanto que a oportunidade passa sem ser pega.",
    pontoForte: "Discernimento e profundidade",
    bloqueio: "Desconfiança que trava a ação",
  },
  8: {
    texto:
      "O nome aponta para poder material. Você entende troca, valor e resultado — o bloqueio clássico é associar dinheiro a culpa ou a “ser demais”.",
    pontoForte: "Visão de abundância concreta",
    bloqueio: "Culpa ao crescer financeiramente",
  },
  9: {
    texto:
      "Seu nome vibra em entrega e ciclos. Você fecha portas com coragem — e pode dar demais, deixando pouco para o próprio bolso.",
    pontoForte: "Generosidade e visão ampla",
    bloqueio: "Dificuldade de receber sem retribuir na hora",
  },
  11: {
    texto:
      "Número mestre. Seu nome opera em intuição elevada: você sente o próximo passo antes de conseguir explicar. O desafio é não duvidar do que já sabe.",
    pontoForte: "Inspiração e canal intuitivo",
    bloqueio: "Ansiedade espiritual que paralisa o corpo",
  },
  22: {
    texto:
      "Número mestre do construtor. Seu nome aponta para obras grandes feitas no mundo real — não só na ideia. O risco é sonhar alto e não dar o primeiro tijolo.",
    pontoForte: "Capacidade de materializar visões",
    bloqueio: "Peso demais no “preciso estar pronta”",
  },
}

const SIGNIFICADO_DESTINO: Record<number, Omit<SignificadoDestino, "numero">> = {
  1: {
    texto:
      "Você veio para iniciar. Seu ciclo pede que o dinheiro circule por decisões suas, não por espera. Coragem de escolher é o portal da abundância agora.",
    favorece: "Começar sozinha, precificar e assumir a frente",
    cuidado: "Não confundir independência com isolamento — pedir apoio não tira a sua liderança",
    movimento: "Uma decisão concreta hoje, sem consultar mais uma opinião",
  },
  2: {
    texto:
      "Você veio para construir com o outro. Seu ciclo pede parceria consciente — receber também é um ato de cooperação, não só dar.",
    favorece: "Acordos a dois, escuta e combinados claros",
    cuidado: "Ceder o próprio valor para manter a paz",
    movimento: "Nomear o que você precisa receber nesta parceria",
  },
  3: {
    texto:
      "Você veio para se expressar. A abundância chega quando a voz sai: proposta, preço, conversa. Esconder o brilho é o único bloqueio real.",
    favorece: "Publicar, apresentar, conversar sobre dinheiro em voz alta",
    cuidado: "Adiar o envio até “ficar perfeito”",
    movimento: "Mandar uma mensagem que você está enrolando",
  },
  4: {
    texto:
      "Você veio para estruturar. Ritual, rotina e combinados com você mesma abrem o fluxo. Não é punição — é alicerce para receber sem medo.",
    favorece: "Agenda, planilha simples e combinados com prazo",
    cuidado: "Travamento por perfeccionismo",
    movimento: "Uma regra financeira pequena e cumprida hoje",
  },
  5: {
    texto:
      "Você veio para se mover. Seu ciclo atual pede mudança inteligente, não fuga. Liberdade com direção é o que desbloqueia o dinheiro agora.",
    favorece: "Ajustes de rota, novos contatos, testes curtos",
    cuidado: "Abandonar o que já está funcionando só por inquietação",
    movimento: "Mudar uma coisa — e manter o resto por 7 dias",
  },
  6: {
    texto:
      "Você veio para nutrir — inclusive a si. Seu ciclo pede que o cuidado vire também conta paga, limite posto, valor cobrado com afeto.",
    favorece: "Cuidar de casa, corpo e clientes com o mesmo peso",
    cuidado: "Ficar por último na lista de quem merece",
    movimento: "Cobrar ou recusar um pedido que te esgota",
  },
  7: {
    texto:
      "Você tende a segurar o dinheiro por medo do futuro. Seu ciclo atual pede coragem para receber, não só para poupar.",
    favorece: "Estudo, silêncio e uma decisão bem pensada",
    cuidado: "Analisar tanto que a oportunidade esfria",
    movimento: "Aceitar um sim (ou um pagamento) sem negociar para baixo",
  },
  8: {
    texto:
      "Você veio para lidar com poder material de frente. Abundância aqui é administração lúcida: ganhar, guardar e fazer o dinheiro trabalhar sem culpa.",
    favorece: "Negociação, meta numérica e autoridade no preço",
    cuidado: "Culpa ao crescer — ou dureza com quem está perto",
    movimento: "Tratar uma conta ou proposta como adulta, sem drama",
  },
  9: {
    texto:
      "Você veio para encerrar ciclos. Soltar o que já deu, inclusive crenças de escassez, abre espaço para o próximo capítulo financeiro.",
    favorece: "Fechar ciclos, doar com limite, concluir o que está aberto",
    cuidado: "Dar demais e ficar vazia",
    movimento: "Encerrar uma pendência que já não te paga",
  },
  11: {
    texto:
      "Caminho mestre. Você veio para inspirar — e a abundância pede que a intuição vire gesto concreto, não só insight na madrugada.",
    favorece: "Ideias, orientação e o primeiro passo visível",
    cuidado: "Ansiedade espiritual que paralisa o corpo",
    movimento: "Anotar o insight e agendar o gesto ainda hoje",
  },
  22: {
    texto:
      "Caminho mestre. Você veio para construir algo que dure. O dinheiro chega quando a visão desce para o próximo passo real, não para um castelo só na mente.",
    favorece: "Planejar o trimestre e executar um tijolo",
    cuidado: "Peso de “preciso estar pronta” antes de começar",
    movimento: "Quebrar a visão em uma tarefa de 20 minutos",
  },
}

const SIGNIFICADO_CICLO: Record<number, { interior: string; visivel: string; ano: string }> = {
  1: {
    interior: "Deseja inaugurar, não pedir licença.",
    visivel: "O mundo te lê como quem toma a frente.",
    ano: "Ano de plantar bandeira: projetos novos, nome próprio, o primeiro sim.",
  },
  2: {
    interior: "Deseja harmonia e vínculo verdadeiro.",
    visivel: "Chega como quem une e acalma.",
    ano: "Ano de parcerias e paciência — o fruto vem do combinado, não da pressa.",
  },
  3: {
    interior: "Deseja ser vista e ouvida.",
    visivel: "Irradia leveza e comunicação.",
    ano: "Ano de expressão: mostrar o trabalho, conversar, criar.",
  },
  4: {
    interior: "Deseja chão e previsibilidade.",
    visivel: "Passa segurança e método.",
    ano: "Ano de alicerce: rotina, poupança simples, casa em ordem.",
  },
  5: {
    interior: "Deseja movimento e ar.",
    visivel: "Parece inquieta e curiosa.",
    ano: "Ano de mudança: viagem interna ou externa, mas com um rumo.",
  },
  6: {
    interior: "Deseja cuidar e ser reconhecida nisso.",
    visivel: "É a pessoa em quem os outros se apoiam.",
    ano: "Ano de responsabilidade afetiva — e de se incluir no cuidado.",
  },
  7: {
    interior: "Deseja verdade, não palco.",
    visivel: "Parece seletiva, às vezes distante.",
    ano: "Ano de estudo, pausa estratégica e fé no timing certo.",
  },
  8: {
    interior: "Deseja resultado e respeito material.",
    visivel: "Transmite autoridade e troca justa.",
    ano: "Ano de colheita e administração: ganhar, guardar, investir sem culpa.",
  },
  9: {
    interior: "Deseja sentido maior e ciclos bem fechados.",
    visivel: "Chega como quem completa e libera.",
    ano: "Ano de encerrar, perdoar dívidas internas e abrir o próximo ciclo.",
  },
  11: {
    interior: "Deseja canalizar o que sente sem se perder.",
    visivel: "Inspira — mesmo quando não percebe.",
    ano: "Ano de intuição alta: grave os insights e transforme um deles em gesto.",
  },
  22: {
    interior: "Deseja deixar obra, não só ideia.",
    visivel: "Parece grande demais para o recado pequeno.",
    ano: "Ano de construção visível: um plano real, um tijolo por vez.",
  },
}

/** Soma os dígitos até 1–9, preservando mestres 11 e 22. */
export function reduzirNumero(n: number): number {
  if (!Number.isFinite(n) || n < 0) {
    throw new Error("Número inválido para redução pitagórica")
  }
  let atual = Math.trunc(n)
  while (atual > 9 && atual !== 11 && atual !== 22) {
    atual = String(atual)
      .split("")
      .reduce((acc, d) => acc + Number(d), 0)
  }
  return atual
}

function soDigitos(valor: string): number {
  return [...valor].reduce((acc, ch) => {
    if (ch >= "0" && ch <= "9") return acc + Number(ch)
    return acc
  }, 0)
}

export function somaDigitos(valor: string): number {
  return soDigitos(valor)
}

/**
 * Soma bruta das letras (pitagórica), sem reduzir — usada no número da sorte do dia.
 */
export function somaBrutaNome(nomeCompleto: string): number {
  const letras = normalizarLetras(nomeCompleto)
  return [...letras].reduce((acc, ch) => acc + (PITAGORICA[ch] ?? 0), 0)
}

/**
 * Número de destino (caminho de vida) a partir da data de nascimento.
 * Soma todos os dígitos de dia, mês e ano e reduz, exceto 11 e 22.
 * Aceita `Date` ou ISO `YYYY-MM-DD`.
 */
export function numeroDestino(data: Date | string): number {
  const iso = typeof data === "string" ? data : paraISOLocal(data)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    throw new Error("Data inválida. Use YYYY-MM-DD.")
  }
  const [ano, mes, dia] = iso.split("-")
  const soma = soDigitos(dia) + soDigitos(mes) + soDigitos(ano)
  return reduzirNumero(soma)
}

/**
 * Número de expressão (vibração do nome) — pitagórico, nome completo.
 * Ignora acentos, espaços e caracteres que não sejam letras.
 */
export function numeroDoNome(nomeCompleto: string): number {
  const letras = normalizarLetras(nomeCompleto)
  if (letras.length === 0) {
    throw new Error("Informe um nome com pelo menos uma letra.")
  }
  const soma = [...letras].reduce((acc, ch) => acc + (PITAGORICA[ch] ?? 0), 0)
  return reduzirNumero(soma)
}

export function significadoDoNome(nomeCompleto: string): SignificadoNome {
  const numero = numeroDoNome(nomeCompleto)
  const base = SIGNIFICADO_NOME[numero] ?? SIGNIFICADO_NOME[reduzirAte9(numero)]
  return { numero, ...base }
}

export function significadoDestino(numero: number): SignificadoDestino {
  const base = SIGNIFICADO_DESTINO[numero] ?? SIGNIFICADO_DESTINO[reduzirAte9(numero)]
  return { numero, ...base }
}

const VOGAIS = new Set(["a", "e", "i", "o", "u", "y"])

export type MapaNome = {
  expressao: number
  motivacao: number
  personalidade: number
  interior: string
  visivel: string
}

export function mapaDoNome(nomeCompleto: string): MapaNome {
  const letras = normalizarLetras(nomeCompleto)
  let vogais = 0
  let consoantes = 0
  for (const ch of letras) {
    const n = PITAGORICA[ch] ?? 0
    if (VOGAIS.has(ch)) vogais += n
    else consoantes += n
  }
  const motivacao = vogais > 0 ? reduzirNumero(vogais) : numeroDoNome(nomeCompleto)
  const personalidade = consoantes > 0 ? reduzirNumero(consoantes) : motivacao
  const cicloM = SIGNIFICADO_CICLO[motivacao] ?? SIGNIFICADO_CICLO[reduzirAte9(motivacao)]
  const cicloP = SIGNIFICADO_CICLO[personalidade] ?? SIGNIFICADO_CICLO[reduzirAte9(personalidade)]
  return {
    expressao: numeroDoNome(nomeCompleto),
    motivacao,
    personalidade,
    interior: cicloM.interior,
    visivel: cicloP.visivel,
  }
}

export type AnoPessoal = {
  numero: number
  ano: number
  texto: string
}

export function anoPessoal(dataISO: string, ano = new Date().getFullYear()): AnoPessoal {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataISO)) {
    throw new Error("Data inválida. Use YYYY-MM-DD.")
  }
  const [, mes, dia] = dataISO.split("-")
  const soma = soDigitos(dia) + soDigitos(mes) + soDigitos(String(ano))
  const numero = reduzirNumero(soma)
  const ciclo = SIGNIFICADO_CICLO[numero] ?? SIGNIFICADO_CICLO[reduzirAte9(numero)]
  return { numero, ano, texto: ciclo.ano }
}

export function primeiroNome(nomeCompleto: string): string {
  const parte = nomeCompleto.trim().split(/\s+/).filter(Boolean)[0] ?? ""
  if (!parte) return ""
  return parte.charAt(0).toLocaleUpperCase("pt-BR") + parte.slice(1).toLocaleLowerCase("pt-BR")
}

export function parseDataBR(input: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input.trim())
  if (!m) return null
  const dia = Number(m[1])
  const mes = Number(m[2])
  const ano = Number(m[3])
  const data = new Date(ano, mes - 1, dia)
  if (
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) {
    return null
  }
  return data
}

export function paraISOLocal(data: Date): string {
  const y = data.getFullYear()
  const m = String(data.getMonth() + 1).padStart(2, "0")
  const d = String(data.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function mascararDataBR(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
}

export function idadeValida(data: Date): boolean {
  const hoje = new Date()
  let idade = hoje.getFullYear() - data.getFullYear()
  const m = hoje.getMonth() - data.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < data.getDate())) idade -= 1
  return idade >= 13 && idade <= 120
}

function normalizarLetras(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "")
}

function reduzirAte9(n: number): number {
  let atual = n
  while (atual > 9) {
    atual = String(atual)
      .split("")
      .reduce((acc, d) => acc + Number(d), 0)
  }
  return atual
}
