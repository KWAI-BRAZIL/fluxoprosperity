import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    destino?: number
    expressao?: number
    motivacao?: number
    personalidade?: number
  }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return json({ error: "invalid_json" }, 400)
  }

  const email = String(body.email ?? "").trim().toLowerCase()
  const nome = String(body.nome ?? "").trim().slice(0, 80)
  const destino = Number(body.destino)
  const expressao = Number(body.expressao)
  const motivacao = Number(body.motivacao)
  const personalidade = Number(body.personalidade)

  if (!email.includes("@") || nome.length < 2 || ![destino, expressao, motivacao, personalidade].every(Number.isFinite)) {
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

  const { data: salva } = await supabase
    .from("leituras_onboarding")
    .select("texto")
    .eq("email", email)
    .maybeSingle()
  if (salva?.texto && String(salva.texto).trim().length >= 80) {
    return json({ texto: String(salva.texto).slice(0, 1800) }, 200)
  }

  const sistema = `Você é um Oráculo Terrena: uma presença psicanalítica, mística e orientada à ação.
Sua missão é atuar como um espelho psíquico para a usuária.

DIRETRIZES DE TOM E ESTILO:
1. Tom: Solene, acolhedor, misterioso, porém extremamente prático. Use termos psicológicos sutis (inconsciente, sombra, projeção, contorno, corpo) combinados com imagética de tarot/ritual (lanterna, travessia, véu, cultivo, alicerce).
2. Sem Clichês: Esqueça frases batidas de autoajuda ("você é luz", "acredite nos seus sonhos").
3. Ação como Ritual: Trate tarefas práticas e limites como atos sagrados. A magia aqui é a mudança de comportamento.
Não dê conselho médico, jurídico nem financeiro concreto.`

  const prompt = `Escreva a primeira leitura de ${nome}.
Números calculados: destino ${destino}, expressão ${expressao}, motivação ${motivacao}, personalidade ${personalidade}.
Escreva 3 parágrafos curtos: (1) como esses números se combinam nela — mostre a interação, não cada número isolado; (2) uma tensão ou contradição real entre os números; (3) uma pergunta reflexiva para ela carregar no dia.`

  const modelo = Deno.env.get("GEMINI_MODEL") ?? "gemini-3.6-flash"
  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 7000)
  try {
    const respostaApi = await fetch(endpoint, {
      method: "POST",
      signal: ctrl.signal,
      headers: { "x-goog-api-key": apiKey, "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: sistema }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 420, temperature: 0.7 },
      }),
    })
    if (!respostaApi.ok) {
      console.error("gerar-leitura", respostaApi.status, await respostaApi.text())
      return json({ error: "upstream" }, 502)
    }
    const payload = (await respostaApi.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    const texto = payload.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join("\n")
      .trim() ?? ""
    if (texto.length < 80) return json({ error: "empty" }, 502)
    const limpo = texto.slice(0, 1800)
    const { error: insErr } = await supabase.from("leituras_onboarding").insert({ email, texto: limpo })
    if (insErr?.code === "23505") {
      const { data: deNovo } = await supabase
        .from("leituras_onboarding")
        .select("texto")
        .eq("email", email)
        .maybeSingle()
      if (deNovo?.texto) return json({ texto: String(deNovo.texto).slice(0, 1800) }, 200)
    }
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
