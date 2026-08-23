import type { CartaTarot } from "./diario"

const ESSENCIA: Record<number, string> = {
  0: "O Louco autoriza o primeiro metro, não o mapa inteiro.",
  1: "O Mago trabalha com o que já está na mesa.",
  2: "A Sacerdotisa pede silêncio antes do sim.",
  3: "A Imperatriz lembra que abundância é cultivo.",
  4: "O Imperador abre fluxo com limite, não com punição.",
  5: "O Hierofante oferece método — não reinvenção da roda.",
  6: "Os Enamorados pedem a escolha que você consegue sustentar.",
  7: "O Carro pede um só destino nas próximas horas.",
  8: "A Força pede firmeza sem endurecer o coração.",
  9: "O Eremita acende a lanterna para dentro, não para a plateia.",
  10: "A Roda gira — você escolhe se surfa ou se agarra.",
  11: "A Justiça pesa o que é justo, não o que é cômodo.",
  12: "O Pendurado pede pausa consciente, não paralisia.",
  13: "A Morte corta o que já morreu para o vivo respirar.",
  14: "A Temperança mistura sem apagar ninguém.",
  15: "O Diabo aponta o laço que você já reconhece.",
  16: "A Torre derruba o que não aguentava o próprio peso.",
  17: "A Estrela não pede pressa. Pede que você não esconda mais.",
  18: "A Lua pede que você não feche negócio na névoa.",
  19: "O Sol quer o brilho compartilhado, não o palco só seu.",
  20: "O Julgamento chama o sim maduro, não o veredito cruel.",
  21: "O Mundo fecha o ciclo para o próximo giro começar.",
}

export function truncarTrecho(texto: string, max = 40): string {
  const t = texto.trim().replace(/\s+/g, " ")
  if (!t) return "…"
  const frase = (t.split(/(?<=[.!?])\s/)[0] ?? t).replace(/^["“«»]+|["”«»]+$/g, "")
  if (frase.length <= max) return frase
  const corte = frase.slice(0, max)
  const espaco = corte.lastIndexOf(" ")
  return `${(espaco > 18 ? corte.slice(0, espaco) : corte).trim()}…`
}

export function hashSimples(texto: string): number {
  let h = 0
  for (let i = 0; i < texto.length; i += 1) {
    h = (h * 31 + texto.charCodeAt(i)) >>> 0
  }
  return h
}

function templatesDoEco(carta: CartaTarot): string[] {
  const nome = carta.nome
  const essencia = ESSENCIA[carta.id] ?? `${nome} está com você nisso.`
  return [
    `“{trecho}” — ${essencia}`,
    `Você escreveu “{trecho}”. ${essencia}`,
    `“{trecho}”. ${nome} ouviu. Não precisa polir isso agora.`,
  ]
}

/** Opção A: cita o trecho literal. Usado também como fallback da IA. */
export function gerarEcoLocal(carta: CartaTarot, resposta: string, _perguntaIndex: number): string {
  const trecho = truncarTrecho(resposta, 40)
  const pool = templatesDoEco(carta)
  const template = pool[hashSimples(resposta) % pool.length] ?? pool[0]
  return template.replaceAll("{trecho}", trecho)
}

export const MAX_RESPOSTA_ECO = 300
