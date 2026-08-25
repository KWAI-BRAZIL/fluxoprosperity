import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

type Entrada = {
  dia?: string
  carta_nome?: string
  perguntas?: string[]
  respostas?: string[]
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS })
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405)

  const apiKey = Deno.env.get("GEMINI_API_KEY") ?? ""
  if (!apiKey) return json({ error: "misconfigured" }, 500)

  let body: {
    email?: string
    token?: string
    nome?: string
    tipo?: string
    periodo?: string
    entradas?: Entrada[]
  }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return json({ error: "invalid_json" }, 400)
  }

  const email = String(body.email ?? "").trim().toLowerCase()
  const tipo = body.tipo === "mes" ? "mes" : "semana"
  const nome = String(body.nome ?? "você").trim().slice(0, 80)
  let entradas = Array.isArray(body.entradas) ? body.entradas.slice(0, 28) : []

  if (!email.includes("@")) {
    return json({ error: "invalid_payload" }, 400)
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  if (!supabaseUrl || !serviceKey) return json({ error: "misconfigured" }, 500)

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const token = String(body.token ?? "").trim()
  const { data: sessaoOk, error: sessaoErr } = await supabase.rpc("verificar_sessao", {
    p_email: email,
    p_token: token,
  })
  if (sessaoErr || !sessaoOk) return json({ error: "forbidden" }, 403)

  const { periodo, inicio, fim } = janelaPeriodo(tipo)

  const { data: rows } = await supabase
    .from("ritual_entradas")
    .select("dia, carta_nome, perguntas, respostas")
    .eq("email", email)
    .gte("dia", inicio)
    .lte("dia", fim)
    .order("dia", { ascending: true })
    .limit(28)

  if (Array.isArray(rows) && rows.length >= 3) {
    entradas = rows.map((r) => ({
      dia: String((r as { dia?: string }).dia ?? ""),
      carta_nome: String((r as { carta_nome?: string }).carta_nome ?? ""),
      perguntas: Array.isArray((r as { perguntas?: string[] }).perguntas)
        ? (r as { perguntas: string[] }).perguntas
        : [],
      respostas: Array.isArray((r as { respostas?: string[] }).respostas)
        ? (r as { respostas: string[] }).respostas
        : [],
    }))
  }

  if (entradas.length < 3) {
    return json({ error: "invalid_payload" }, 400)
  }

  const { data: existente } = await supabase
    .from("sinteses")
    .select("texto")
    .eq("email", email)
    .eq("tipo", tipo)
    .eq("periodo", periodo)
    .maybeSingle()
  if (existente?.texto) {
    return json({ texto: existente.texto }, 200)
  }

  const bloco = entradas
    .map((e) => {
      const qs = (e.perguntas ?? []).slice(0, 3)
      const rs = (e.respostas ?? []).slice(0, 3)
      const pares = qs.map((q, i) => `P: ${String(q).slice(0, 180)}\nR: ${String(rs[i] ?? "").slice(0, 240)}`).join("\n")
      return `${e.dia ?? ""} · ${e.carta_nome ?? ""}\n${pares}`
    })
    .join("\n\n")
    .slice(0, 8000)

  const janela = tipo === "mes" ? "mês" : "7 dias"
  const sistema = `Você é um Oráculo Terrena: uma presença psicanalítica, mística e orientada à ação.
Sua missão é atuar como um espelho psíquico para a usuária.

DIRETRIZES DE TOM E ESTILO:
1. Tom: Solene, acolhedor, misterioso, porém extremamente prático. Use termos psicológicos sutis (inconsciente, sombra, projeção, contorno, corpo) combinados com imagética de tarot/ritual (lanterna, travessia, véu, cultivo, alicerce).
2. Sem Clichês: Esqueça frases batidas de autoajuda ("você é luz", "acredite nos seus sonhos").
3. Ação como Ritual: Trate tarefas práticas e limites como atos sagrados. A magia aqui é a mudança de comportamento.
Não dê conselho médico, jurídico nem financeiro concreto. Não invente fatos.`

  const prompt = `Escreva a síntese de ${nome} com as respostas reais dos rituais dos últimos ${janela}:

${bloco}

Identifique 1 padrão real que se repete (medo, adiamento, impulso, decisão) — cite as palavras dela. Se não houver padrão claro, aponte o que mudou de um dia para o outro.
Escreva em 2ª pessoa, 4 a 5 frases.`

  const modelo = Deno.env.get("GEMINI_MODEL") ?? "gemini-3.6-flash"
  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 8000)
  try {
    const respostaApi = await fetch(endpoint, {
      method: "POST",
      signal: ctrl.signal,
      headers: { "x-goog-api-key": apiKey, "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: sistema }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 320, temperature: 0.6 },
      }),
    })
    if (!respostaApi.ok) {
      console.error("gerar-sintese", respostaApi.status, await respostaApi.text())
      return json({ error: "upstream" }, 502)
    }
    const payload = (await respostaApi.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    const texto = payload.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join(" ")
      .trim() ?? ""
    if (texto.length < 40) return json({ error: "empty" }, 502)
    const limpo = texto.slice(0, 1200)
    await supabase.from("sinteses").upsert(
      { email, tipo, periodo, texto: limpo },
      { onConflict: "email,tipo,periodo" },
    )
    return json({ texto: limpo }, 200)
  } catch {
    return json({ error: "timeout" }, 504)
  } finally {
    clearTimeout(timer)
  }
})

function json(payload: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  })
}

/** Período em America/Sao_Paulo — não usa o valor enviado pelo cliente. */
function janelaPeriodo(tipo: "semana" | "mes"): { periodo: string; inicio: string; fim: string } {
  const tz = "America/Sao_Paulo"
  const now = new Date()
  const y = Number(now.toLocaleString("en-US", { timeZone: tz, year: "numeric" }))
  const mo = Number(now.toLocaleString("en-US", { timeZone: tz, month: "numeric" }))
  const d = Number(now.toLocaleString("en-US", { timeZone: tz, day: "numeric" }))
  const fim = `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`
  if (tipo === "mes") {
    const inicio = `${y}-${String(mo).padStart(2, "0")}-01`
    return { periodo: `mes-${y}-${String(mo).padStart(2, "0")}`, inicio, fim }
  }
  const wd = now.toLocaleString("en-US", { timeZone: tz, weekday: "short" })
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd)
  const domingo = new Date(Date.UTC(y, mo - 1, d) - Math.max(0, dow) * 86_400_000)
  const ys = domingo.getUTCFullYear()
  const ms = String(domingo.getUTCMonth() + 1).padStart(2, "0")
  const ds = String(domingo.getUTCDate()).padStart(2, "0")
  const inicio = `${ys}-${ms}-${ds}`
  return { periodo: `sem-${inicio}`, inicio, fim }
}
