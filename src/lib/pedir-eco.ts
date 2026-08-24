import type { CartaTarot } from "./diario"
import { gerarEcoLocal, MAX_ECO_IA, MAX_RESPOSTA_ECO } from "./ritual-eco"
import { getSupabase, modoPreview, supabaseConfigurado } from "./supabase"

const TIMEOUT_MS = 4500

function comTimeout<T>(promessa: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = window.setTimeout(() => reject(new Error("timeout")), ms)
    promessa.then(
      (valor) => {
        window.clearTimeout(id)
        resolve(valor)
      },
      (err) => {
        window.clearTimeout(id)
        reject(err)
      },
    )
  })
}

export async function pedirEco(params: {
  email: string
  carta: CartaTarot
  pergunta: string
  resposta: string
  perguntaIndex: number
}): Promise<string> {
  const resposta = params.resposta.trim().slice(0, MAX_RESPOSTA_ECO)
  const fallback = gerarEcoLocal(params.carta, resposta, params.perguntaIndex)
  if (modoPreview() || !supabaseConfigurado()) return fallback

  try {
    const { data, error } = await comTimeout(
      getSupabase().functions.invoke("gerar-eco", {
        body: {
          email: params.email,
          cartaId: params.carta.id,
          cartaNome: params.carta.nome,
          essencia: params.carta.resumo,
          pergunta: params.pergunta,
          resposta,
          perguntaIndex: params.perguntaIndex,
        },
      }),
      TIMEOUT_MS,
    )
    if (error) return fallback
    const eco = typeof data === "string" ? data : data && typeof data === "object" ? (data as { eco?: string }).eco : ""
    const limpo = (eco ?? "").trim().replace(/^["“«]+|["”»]+$/g, "").slice(0, MAX_ECO_IA)
    if (limpo.length < 8) return fallback
    return limpo
  } catch {
    return fallback
  }
}
