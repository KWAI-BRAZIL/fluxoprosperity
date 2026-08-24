import type { CartaTarot } from "./diario"

const REFLEXOS = [
  "Trazer a sombra para o texto é o primeiro passo para retirar dela o poder de decisão.",
  "O inconsciente se revela na palavra dita. Você acabou de dar contorno ao que antes era névoa.",
  "O altar da vida cotidiana não exige grandes feitos, apenas a honestidade do seu próximo gesto.",
]

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

function palavrasChave(resposta: string): string {
  const t = resposta.trim().replace(/\s+/g, " ").replace(/^["“«»]+|["”«»]+$/g, "")
  if (t.length <= 72) return t
  const corte = t.slice(0, 72)
  const espaco = corte.lastIndexOf(" ")
  return `${(espaco > 24 ? corte.slice(0, espaco) : corte).trim()}`
}

/** Fallback se a API falhar: espelho neutro com as palavras dela, sem autoajuda pronta. */
export function gerarEcoLocal(_carta: CartaTarot, resposta: string, perguntaIndex: number): string {
  const chave = palavrasChave(resposta)
  const reflexo = REFLEXOS[perguntaIndex % REFLEXOS.length] ?? REFLEXOS[0]
  if (chave.length < 8) return reflexo
  if (perguntaIndex === 0) {
    return `Trazer a sombra de “${chave}” para o texto é o primeiro passo para retirar dela o poder de decisão.`
  }
  if (perguntaIndex === 1) {
    return `O inconsciente se revela em “${chave}”. Você acabou de dar contorno ao que antes era névoa.`
  }
  return `O altar da vida cotidiana não exige grandes feitos — “${chave}” já é a honestidade do próximo gesto.`
}

export const MAX_RESPOSTA_ECO = 300
export const MAX_ECO_IA = 220
