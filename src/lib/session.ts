const EMAIL_KEY = "abundancia_v5_email"
const TOKEN_KEY = "abundancia_v5_sessao"
const PERFIL_KEY = "abundancia_v5_perfil"
const ENTRADAS_KEY = "abundancia_v5_entradas"
const EPOCH_KEY = "abundancia_data_epoch"
const EPOCH = "6-login-senha"

export const EMAIL_PREVIEW = "preview@abundancia.test"
const EMAIL_PREVIEW_ANTIGO = "preview@local"

export type CartaVivida = {
  id: number
  nome: string
  em: string
}

export type PerfilLocal = {
  nome: string | null
  data_nascimento: string | null
  numero_destino: number | null
  streak_dias: number
  recorde_streak: number
  produto: string | null
  ritual_feito_hoje: boolean
  ultimo_ritual_em?: string | null
  rituais_em?: string[]
  cartas_vividas: CartaVivida[]
}

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function emailValido(email: string): boolean {
  const n = normalizarEmail(email)
  if (n === EMAIL_PREVIEW || n === EMAIL_PREVIEW_ANTIGO) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(n)
}

function emailDaSessao(valor: string): string | null {
  const email = normalizarEmail(valor)
  if (email === EMAIL_PREVIEW_ANTIGO) return EMAIL_PREVIEW
  return emailValido(email) ? email : null
}

export function getEmailSessao(): string | null {
  try {
    const valor = sessionStorage.getItem(EMAIL_KEY) ?? localStorage.getItem(EMAIL_KEY)
    if (!valor) return null
    const email = emailDaSessao(valor)
    if (email && email !== valor) setEmailSessao(email)
    return email
  } catch {
    return null
  }
}

export function setEmailSessao(email: string): void {
  const n = normalizarEmail(email)
  sessionStorage.setItem(EMAIL_KEY, n)
  localStorage.setItem(EMAIL_KEY, n)
}

export function getSessaoToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setSessao(email: string, token: string): void {
  setEmailSessao(email)
  sessionStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(TOKEN_KEY, token)
}

export function limparSessao(): void {
  apagarChaves("abundancia", localStorage)
  apagarChaves("abundancia", sessionStorage)
}

function apagarChaves(prefixo: string, storage: Storage): void {
  const chaves: string[] = []
  for (let i = 0; i < storage.length; i += 1) {
    const chave = storage.key(i)
    if (chave && chave.startsWith(prefixo)) chaves.push(chave)
  }
  for (const chave of chaves) storage.removeItem(chave)
}

let limpezaDestaCarga = false

/** Só limpa sessão se a época mudou — senão streak, recorde e grimório somem a cada refresh. */
export function zerarAcessoLocalSePreciso(): void {
  if (limpezaDestaCarga) return
  limpezaDestaCarga = true
  try {
    if (localStorage.getItem(EPOCH_KEY) !== EPOCH) {
      limparSessao()
      localStorage.setItem(EPOCH_KEY, EPOCH)
    }
  } catch {
    /* storage indisponível */
  }
}

export function perfilVazio(): PerfilLocal {
  return {
    nome: null,
    data_nascimento: null,
    numero_destino: null,
    streak_dias: 0,
    recorde_streak: 0,
    produto: "acesso_base",
    ritual_feito_hoje: false,
    ultimo_ritual_em: null,
    rituais_em: [],
    cartas_vividas: [],
  }
}

export function getPerfilLocal(): PerfilLocal {
  try {
    const raw = localStorage.getItem(PERFIL_KEY)
    if (!raw) return perfilVazio()
    return { ...perfilVazio(), ...(JSON.parse(raw) as PerfilLocal) }
  } catch {
    return perfilVazio()
  }
}

export function setPerfilLocal(perfil: PerfilLocal): void {
  localStorage.setItem(PERFIL_KEY, JSON.stringify(perfil))
}

export type EntradaLocal = {
  dia: string
  carta_id: number
  carta_nome: string
  perguntas: string[]
  respostas: string[]
  conselho: string
}

export function getEntradasLocal(): EntradaLocal[] {
  try {
    const raw = localStorage.getItem(ENTRADAS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(entradaValida)
  } catch {
    return []
  }
}

export function setEntradasLocal(entradas: EntradaLocal[]): void {
  localStorage.setItem(ENTRADAS_KEY, JSON.stringify(entradas.slice(0, 120)))
}

export function upsertEntradaLocal(entrada: EntradaLocal): EntradaLocal[] {
  const resto = getEntradasLocal().filter((e) => e.dia !== entrada.dia)
  const lista = [entrada, ...resto].sort((a, b) => b.dia.localeCompare(a.dia))
  setEntradasLocal(lista)
  return lista
}

function entradaValida(item: unknown): item is EntradaLocal {
  if (!item || typeof item !== "object") return false
  const row = item as Record<string, unknown>
  return typeof row.dia === "string" && Number.isFinite(Number(row.carta_id))
}
