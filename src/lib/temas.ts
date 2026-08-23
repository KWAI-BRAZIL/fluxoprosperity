/** Tema principal de cada arcano — para o bloco de padrões (sem IA). */
export type TemaPadrao = "dinheiro" | "medo" | "relacao" | "trabalho" | "ciclo"

export const TEMA_CARTA: Record<number, TemaPadrao> = {
  0: "ciclo",
  1: "trabalho",
  2: "ciclo",
  3: "ciclo",
  4: "dinheiro",
  5: "trabalho",
  6: "relacao",
  7: "trabalho",
  8: "medo",
  9: "ciclo",
  10: "trabalho",
  11: "dinheiro",
  12: "ciclo",
  13: "ciclo",
  14: "ciclo",
  15: "medo",
  16: "medo",
  17: "ciclo",
  18: "medo",
  19: "trabalho",
  20: "ciclo",
  21: "ciclo",
}

export const ROTULO_TEMA: Record<TemaPadrao, string> = {
  dinheiro: "dinheiro",
  medo: "medo",
  relacao: "relacionamentos",
  trabalho: "trabalho",
  ciclo: "ciclos e direção",
}

export type EntradaRitual = {
  dia: string
  carta_id: number
  carta_nome: string
  perguntas: string[]
  respostas: string[]
  conselho: string
}

export function contarTemas(entradas: EntradaRitual[]): { tema: TemaPadrao; n: number }[] {
  const acc: Record<TemaPadrao, number> = {
    dinheiro: 0,
    medo: 0,
    relacao: 0,
    trabalho: 0,
    ciclo: 0,
  }
  for (const e of entradas) {
    const tema = TEMA_CARTA[e.carta_id] ?? "ciclo"
    acc[tema] += 1
  }
  return (Object.keys(acc) as TemaPadrao[])
    .map((tema) => ({ tema, n: acc[tema] }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
}

export function entradasDoMes(entradas: EntradaRitual[], agora = new Date()): EntradaRitual[] {
  const y = agora.getFullYear()
  const m = String(agora.getMonth() + 1).padStart(2, "0")
  const prefix = `${y}-${m}`
  return entradas.filter((e) => e.dia.startsWith(prefix))
}

export function entradasDaSemana(entradas: EntradaRitual[], hojeISO: string): EntradaRitual[] {
  const [y, m, d] = hojeISO.split("-").map(Number)
  const fim = new Date(y, m - 1, d)
  const ini = new Date(fim)
  ini.setDate(ini.getDate() - 6)
  const a = isoLocal(ini)
  const b = isoLocal(fim)
  return entradas.filter((e) => e.dia >= a && e.dia <= b).sort((x, y) => x.dia.localeCompare(y.dia))
}

export function chaveSemana(hojeISO: string): string {
  const [y, m, d] = hojeISO.split("-").map(Number)
  const dt = new Date(y, m - 1, d)
  const dow = dt.getDay()
  dt.setDate(dt.getDate() - dow)
  return `sem-${isoLocal(dt)}`
}

export function chaveMes(agora = new Date()): string {
  const y = agora.getFullYear()
  const m = String(agora.getMonth() + 1).padStart(2, "0")
  return `mes-${y}-${m}`
}

function isoLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}
