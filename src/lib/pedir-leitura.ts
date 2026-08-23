import { getSupabase, modoPreview, supabaseConfigurado } from "./supabase"

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

export async function pedirLeituraAbertura(params: {
  email: string
  nome: string
  destino: number
  expressao: number
  motivacao: number
  personalidade: number
}): Promise<string | null> {
  if (modoPreview() || !supabaseConfigurado()) return null
  try {
    const { data, error } = await comTimeout(
      getSupabase().functions.invoke("gerar-leitura", {
        body: params,
      }),
      8000,
    )
    if (error) return null
    const texto =
      typeof data === "string"
        ? data
        : data && typeof data === "object"
          ? (data as { texto?: string }).texto
          : ""
    const limpo = (texto ?? "").trim()
    return limpo.length >= 80 ? limpo : null
  } catch {
    return null
  }
}
