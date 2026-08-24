import type { CartaTarot } from "./diario"
import { arcanosMaiores, hojeISO, somarDiasISO } from "./diario"
import { numeroDestino } from "./numerologia"
import {
  getEmailSessao,
  getEntradasLocal,
  getPerfilLocal,
  normalizarEmail,
  setPerfilLocal,
  setSessao,
  upsertEntradaLocal,
  type CartaVivida,
  type EntradaLocal,
  type PerfilLocal,
} from "./session"
import { getSupabase, modoPreview } from "./supabase"

export type { CartaVivida }

export type Perfil = {
  nome: string | null
  data_nascimento: string | null
  numero_destino: number | null
  streak_dias: number
  recorde_streak: number
  produto: string | null
  ritual_feito_hoje: boolean
  rituais_em: string[]
  cartas_vividas: CartaVivida[]
}

function lerCartas(valor: unknown): CartaVivida[] {
  if (!Array.isArray(valor)) return []
  const saida: CartaVivida[] = []
  for (const item of valor) {
    if (!item || typeof item !== "object") continue
    const row = item as Record<string, unknown>
    const id = Number(row.id)
    const nome = typeof row.nome === "string" ? row.nome : ""
    const em = String(row.em ?? "").slice(0, 10)
    if (!Number.isFinite(id) || !em) continue
    saida.push({ id, nome, em })
  }
  return saida
}

const EMAILS_GRIMORIO_COMPLETO = new Set([
  "arcanodigital.com.br@gmail.com",
  "arcandigital.com.br@gmail.com",
])

function baralhoCompleto(cartas: CartaVivida[], email?: string | null): CartaVivida[] {
  const conta = normalizarEmail(email ?? getEmailSessao() ?? "")
  if (!EMAILS_GRIMORIO_COMPLETO.has(conta)) return cartas
  const hoje = hojeISO()
  return mesclarCartas(
    cartas,
    arcanosMaiores().map((carta) => ({ id: carta.id, nome: carta.nome, em: hoje })),
  )
}

export function mesclarCartas(a: CartaVivida[], b: CartaVivida[]): CartaVivida[] {
  const mapa = new Map<number, CartaVivida>()
  for (const carta of [...a, ...b]) {
    const previa = mapa.get(carta.id)
    if (!previa || carta.em < previa.em) mapa.set(carta.id, carta)
  }
  return [...mapa.values()].sort((x, y) => x.id - y.id)
}

function registrarCarta(cartas: CartaVivida[], carta: Pick<CartaTarot, "id" | "nome">, hoje: string): CartaVivida[] {
  if (cartas.some((c) => c.id === carta.id)) return cartas
  return mesclarCartas(cartas, [{ id: carta.id, nome: carta.nome, em: hoje }])
}

function mapRow(row: Record<string, unknown>, fallback?: Partial<Perfil>): Perfil {
  const datas = Array.isArray(row.rituais_em)
    ? (row.rituais_em as unknown[]).map((d) => String(d).slice(0, 10))
    : fallback?.rituais_em ?? []
  return {
    nome: (row.nome as string | null) ?? fallback?.nome ?? null,
    data_nascimento: row.data_nascimento
      ? String(row.data_nascimento).slice(0, 10)
      : fallback?.data_nascimento ?? null,
    numero_destino: (row.numero_destino as number | null) ?? fallback?.numero_destino ?? null,
    streak_dias: (row.streak_dias as number | undefined) ?? fallback?.streak_dias ?? 0,
    recorde_streak:
      (row.recorde_streak as number | undefined) ?? fallback?.recorde_streak ?? 0,
    produto: (row.produto as string | null) ?? fallback?.produto ?? null,
    ritual_feito_hoje: Boolean(row.ritual_feito_hoje),
    rituais_em: datas,
    cartas_vividas: baralhoCompleto(
      mesclarCartas(lerCartas(row.cartas_vividas), fallback?.cartas_vividas ?? []),
    ),
  }
}

function sobreporColecaoLocal(perfil: Perfil): Perfil {
  const local = getPerfilLocal()
  const recorde = Math.max(perfil.recorde_streak ?? 0, local.recorde_streak ?? 0, perfil.streak_dias ?? 0)
  const cartas = baralhoCompleto(mesclarCartas(perfil.cartas_vividas ?? [], local.cartas_vividas ?? []))
  const unido: Perfil = {
    ...perfil,
    recorde_streak: recorde,
    cartas_vividas: cartas,
  }
  setPerfilLocal({
    ...local,
    ...perfilParaLocal(unido, local),
  })
  return unido
}

function perfilParaLocal(perfil: Perfil, atual: PerfilLocal): PerfilLocal {
  return {
    ...atual,
    nome: perfil.nome,
    data_nascimento: perfil.data_nascimento,
    numero_destino: perfil.numero_destino,
    streak_dias: perfil.streak_dias,
    recorde_streak: perfil.recorde_streak,
    produto: perfil.produto,
    ritual_feito_hoje: perfil.ritual_feito_hoje,
    rituais_em: perfil.rituais_em,
    cartas_vividas: perfil.cartas_vividas,
  }
}

export type StatusConta = "invalido" | "nao_pago" | "cadastrar" | "entrar"

function mensagemRpc(error: { message?: string }): string {
  const raw = (error.message ?? "").toLowerCase()
  if (raw.includes("já tem senha")) return "Esta conta já tem senha. Entre pelo login."
  if (raw.includes("pagamento não encontrado")) {
    return "Ainda não encontramos um pagamento para este e-mail. Se você acabou de pagar, aguarde um minuto."
  }
  if (raw.includes("assinatura inativa")) return "Sua assinatura não está ativa no momento."
  if (raw.includes("pelo menos 8")) return "A senha precisa ter pelo menos 8 caracteres."
  if (raw.includes("e-mail ou senha")) return "E-mail ou senha inválidos."
  return error.message || "Não foi possível concluir."
}

export async function verificarAcesso(email: string): Promise<boolean> {
  if (modoPreview()) return true
  const { data, error } = await getSupabase().rpc("verificar_acesso", {
    p_email: normalizarEmail(email),
  })
  if (error) throw error
  return Boolean(data)
}

export async function statusConta(email: string): Promise<StatusConta> {
  if (modoPreview()) return "cadastrar"
  const { data, error } = await getSupabase().rpc("status_conta", {
    p_email: normalizarEmail(email),
  })
  if (error) throw new Error(mensagemRpc(error))
  const s = String(data ?? "")
  if (s === "cadastrar" || s === "entrar" || s === "nao_pago" || s === "invalido") return s
  return "nao_pago"
}

export async function verificarSessao(email: string, token: string): Promise<boolean> {
  if (modoPreview()) return true
  if (!token) return false
  const { data, error } = await getSupabase().rpc("verificar_sessao", {
    p_email: normalizarEmail(email),
    p_token: token,
  })
  if (error) throw error
  return Boolean(data)
}

export async function cadastrarConta(email: string, senha: string): Promise<void> {
  if (modoPreview()) {
    setSessao(email, "preview")
    return
  }
  const { data, error } = await getSupabase().rpc("cadastrar_conta", {
    p_email: normalizarEmail(email),
    p_senha: senha,
  })
  if (error) throw new Error(mensagemRpc(error))
  const token = String(data ?? "")
  if (!token) throw new Error("Não foi possível criar a conta.")
  setSessao(email, token)
}

export async function entrarConta(email: string, senha: string): Promise<void> {
  if (modoPreview()) {
    setSessao(email, "preview")
    return
  }
  const { data, error } = await getSupabase().rpc("entrar_conta", {
    p_email: normalizarEmail(email),
    p_senha: senha,
  })
  if (error) throw new Error(mensagemRpc(error))
  const token = String(data ?? "")
  if (!token) throw new Error("E-mail ou senha inválidos.")
  setSessao(email, token)
}

export async function obterPerfil(email: string): Promise<Perfil | null> {
  if (modoPreview()) {
    return sincronizarRitualLocal(getPerfilLocal())
  }
  const { data, error } = await getSupabase().rpc("obter_perfil", {
    p_email: normalizarEmail(email),
  })
  if (error) throw error
  if (!data) return null
  const row = Array.isArray(data) ? data[0] : data
  if (!row) return null
  return sobreporColecaoLocal(mapRow(row as Record<string, unknown>))
}

export async function salvarOnboarding(params: {
  email: string
  nome: string
  dataNascimento: string
}): Promise<Perfil> {
  if (modoPreview()) {
    const atual = getPerfilLocal()
    const perfil: PerfilLocal = {
      ...atual,
      nome: params.nome.trim(),
      data_nascimento: params.dataNascimento,
      numero_destino: numeroDestino(params.dataNascimento),
    }
    setPerfilLocal(perfil)
    return sincronizarRitualLocal(perfil)
  }
  const { data, error } = await getSupabase().rpc("salvar_onboarding", {
    p_email: normalizarEmail(params.email),
    p_nome: params.nome.trim(),
    p_data_nascimento: params.dataNascimento,
  })
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  if (!row) throw new Error("Não foi possível salvar o onboarding.")
  return sobreporColecaoLocal(
    mapRow(row as Record<string, unknown>, {
      nome: params.nome,
      data_nascimento: params.dataNascimento,
    }),
  )
}

export async function registrarRitual(
  email: string,
  carta?: Pick<CartaTarot, "id" | "nome">,
): Promise<Perfil> {
  const local = aplicarRitualLocal(carta)
  if (modoPreview()) {
    return sincronizarRitualLocal(local)
  }

  const args: Record<string, unknown> = { p_email: normalizarEmail(email) }
  if (carta) {
    args.p_carta_id = carta.id
    args.p_carta_nome = carta.nome
  }
  let { data, error } = await getSupabase().rpc("registrar_ritual", args)
  if (error && carta) {
    const retry = await getSupabase().rpc("registrar_ritual", {
      p_email: normalizarEmail(email),
    })
    data = retry.data
    error = retry.error
  }
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  if (!row) throw new Error("Não foi possível registrar o ritual.")
  return sobreporColecaoLocal(mapRow(row as Record<string, unknown>, sincronizarRitualLocal(local)))
}

function aplicarRitualLocal(carta?: Pick<CartaTarot, "id" | "nome">): PerfilLocal {
  const atual = getPerfilLocal()
  const hoje = hojeISO()
  const ontem = somarDiasISO(hoje, -1)
  let streak = atual.streak_dias ?? 0
  if (atual.ultimo_ritual_em === hoje) {
    // já registrado hoje — streak permanece; a carta ainda entra no grimório
  } else if (atual.ultimo_ritual_em === ontem) {
    streak += 1
  } else {
    streak = 1
  }
  const datas = new Set(atual.rituais_em ?? [])
  datas.add(hoje)
  const cartas = baralhoCompleto(
    carta ? registrarCarta(atual.cartas_vividas ?? [], carta, hoje) : (atual.cartas_vividas ?? []),
  )
  const recorde = Math.max(atual.recorde_streak ?? 0, streak)
  const perfil: PerfilLocal = {
    ...atual,
    streak_dias: streak,
    recorde_streak: recorde,
    ultimo_ritual_em: hoje,
    ritual_feito_hoje: true,
    rituais_em: [...datas].sort(),
    cartas_vividas: cartas,
  }
  setPerfilLocal(perfil)
  return perfil
}

export function onboardingCompleto(perfil: Perfil | null): boolean {
  return Boolean(perfil?.nome && perfil.data_nascimento && perfil.numero_destino)
}

export function jaFezRitual(perfil: Perfil | null): boolean {
  if (!perfil) return false
  return (
    perfil.ritual_feito_hoje ||
    (perfil.streak_dias ?? 0) > 0 ||
    (perfil.rituais_em?.length ?? 0) > 0
  )
}

export function checkoutUrl(): string | null {
  const bruto = import.meta.env.VITE_CAKTO_CHECKOUT_URL
  if (!bruto) return null
  try {
    const url = new URL(bruto)
    if (typeof window !== "undefined") {
      const retorno = `${window.location.origin}/pos-compra?pago=1`
      url.searchParams.set("redirectUrl", retorno)
    }
    return url.toString()
  } catch {
    return bruto
  }
}

export type EntradaRitual = EntradaLocal

export async function salvarEntradaRitual(params: {
  email: string
  carta: Pick<CartaTarot, "id" | "nome">
  perguntas: string[]
  respostas: string[]
  conselho?: string
}): Promise<void> {
  const entrada: EntradaLocal = {
    dia: hojeISO(),
    carta_id: params.carta.id,
    carta_nome: params.carta.nome,
    perguntas: params.perguntas.slice(0, 3).map((p) => p.slice(0, 280)),
    respostas: params.respostas.slice(0, 3).map((r) => r.slice(0, 300)),
    conselho: (params.conselho ?? "").slice(0, 2000),
  }
  upsertEntradaLocal(entrada)
  if (modoPreview()) return
  const { error } = await getSupabase().rpc("salvar_entrada_ritual", {
    p_email: normalizarEmail(params.email),
    p_carta_id: params.carta.id,
    p_carta_nome: params.carta.nome,
    p_perguntas: entrada.perguntas,
    p_respostas: entrada.respostas,
    p_conselho: entrada.conselho,
  })
  if (error) console.warn("salvar_entrada_ritual", error.message)
}

export async function listarEntradasRitual(email: string): Promise<EntradaLocal[]> {
  const local = getEntradasLocal()
  if (modoPreview()) return local
  const { data, error } = await getSupabase().rpc("listar_entradas_ritual", {
    p_email: normalizarEmail(email),
  })
  if (error || !data) return local
  const remotas: EntradaLocal[] = []
  for (const item of data as Record<string, unknown>[]) {
    const dia = String(item.dia ?? "").slice(0, 10)
    const carta_id = Number(item.carta_id)
    if (!dia || !Number.isFinite(carta_id)) continue
    remotas.push({
      dia,
      carta_id,
      carta_nome: String(item.carta_nome ?? ""),
      perguntas: Array.isArray(item.perguntas) ? item.perguntas.map(String) : [],
      respostas: Array.isArray(item.respostas) ? item.respostas.map(String) : [],
      conselho: String(item.conselho ?? ""),
    })
  }
  const mapa = new Map<string, EntradaLocal>()
  for (const e of [...remotas, ...local]) mapa.set(e.dia, e)
  return [...mapa.values()].sort((a, b) => b.dia.localeCompare(a.dia))
}

export async function obterSinteseSalva(
  email: string,
  tipo: "semana" | "mes",
  periodo: string,
): Promise<string | null> {
  if (modoPreview()) return null
  const { data, error } = await getSupabase().rpc("obter_sintese", {
    p_email: normalizarEmail(email),
    p_tipo: tipo,
    p_periodo: periodo,
  })
  if (error) return null
  const txt = typeof data === "string" ? data.trim() : ""
  return txt.length > 20 ? txt : null
}

function sincronizarRitualLocal(perfil: PerfilLocal): Perfil {
  const hoje = hojeISO()
  const streak = perfil.streak_dias ?? 0
  return {
    nome: perfil.nome,
    data_nascimento: perfil.data_nascimento,
    numero_destino: perfil.numero_destino,
    streak_dias: streak,
    recorde_streak: Math.max(perfil.recorde_streak ?? 0, streak),
    produto: perfil.produto ?? "acesso_base",
    ritual_feito_hoje: perfil.ultimo_ritual_em === hoje,
    rituais_em: perfil.rituais_em ?? [],
    cartas_vividas: baralhoCompleto(perfil.cartas_vividas ?? []),
  }
}
