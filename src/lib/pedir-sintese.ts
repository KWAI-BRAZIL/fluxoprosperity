import { listarEntradasRitual, obterSinteseSalva, type EntradaRitual } from "./acesso"
import { getSessaoToken } from "./session"
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

export function sinteseLocal(entradas: EntradaRitual[], nome: string): string {
  const trechos = entradas
    .flatMap((e) => e.respostas)
    .map((r) => r.trim())
    .filter((r) => r.length > 8)
    .slice(0, 4)
  if (trechos.length === 0) {
    return `${nome}, ainda não há o bastante nesta janela para um padrão claro. Volte depois de mais alguns rituais — a síntese precisa das suas palavras, não de um chute.`
  }
  const citado = trechos[0]!.slice(0, 90)
  return `Olhando o que você escreveu, um fio volta: “${citado}”. Não é um diagnóstico — é o que suas próprias frases repetem. Se isso mudou de um dia para o outro, a mudança também conta. Honra o que você já nomeou; o próximo ritual continua essa conversa.`
}

export async function pedirSintese(params: {
  email: string
  nome: string
  tipo: "semana" | "mes"
  periodo: string
  entradas: EntradaRitual[]
}): Promise<string> {
  const fallback = sinteseLocal(params.entradas, params.nome)
  if (params.entradas.length < 3) return fallback
  const salva = await obterSinteseSalva(params.email, params.tipo, params.periodo)
  if (salva) return salva
  if (modoPreview() || !supabaseConfigurado()) return fallback
  try {
    const { data, error } = await comTimeout(
      getSupabase().functions.invoke("gerar-sintese", {
        body: {
          email: params.email,
          token: getSessaoToken() ?? "",
          nome: params.nome,
          tipo: params.tipo,
          periodo: params.periodo,
          entradas: params.entradas.map((e) => ({
            dia: e.dia,
            carta_nome: e.carta_nome,
            perguntas: e.perguntas,
            respostas: e.respostas,
          })),
        },
      }),
      9000,
    )
    if (error) return fallback
    const texto =
      typeof data === "string"
        ? data
        : data && typeof data === "object"
          ? (data as { texto?: string }).texto
          : ""
    const limpo = (texto ?? "").trim()
    if (limpo.length < 40) return fallback
    return limpo
  } catch {
    return fallback
  }
}

export async function carregarEntradas(email: string): Promise<EntradaRitual[]> {
  return listarEntradasRitual(email)
}
