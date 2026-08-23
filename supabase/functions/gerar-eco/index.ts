import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

/** Eco do ritual: Gemini (GEMINI_API_KEY). Sem chave ou timeout → o front usa eco local. */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

type Body = {
  email?: string
  cartaId?: number
  cartaNome?: string
  essencia?: string
  pergunta?: string
  resposta?: string
  perguntaIndex?: number
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS })
  }
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405)
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY") ?? ""
  if (!apiKey) {
    return json({ error: "misconfigured" }, 500)
  }

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return json({ error: "invalid_json" }, 400)
  }

  const email = String(body.email ?? "")
    .trim()
    .toLowerCase()
  const resposta = String(body.resposta ?? "").trim().slice(0, 300)
  const pergunta = String(body.pergunta ?? "").trim().slice(0, 280)
  const cartaNome = String(body.cartaNome ?? "a carta do dia").trim().slice(0, 80)
  const essencia = String(body.essencia ?? "").trim().slice(0, 280)

  if (!email.includes("@") || resposta.length < 2 || pergunta.length < 2) {
    return json({ error: "invalid_payload" }, 400)
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "misconfigured" }, 500)
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: liberado, error: acessoErr } = await supabase.rpc("verificar_acesso", {
    p_email: email,
  })
  if (acessoErr || !liberado) {
    return json({ error: "forbidden" }, 403)
  }

  const hoje = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" })
  const { data: row } = await supabase
    .from("ritual_ecos_dia")
    .select("chamadas")
    .eq("email", email)
    .eq("dia", hoje)
    .maybeSingle()

  const chamadas = Number(row?.chamadas ?? 0)
  if (chamadas >= 4) {
    return json({ error: "rate_limited" }, 429)
  }

  await supabase.from("ritual_ecos_dia").upsert(
    { email, dia: hoje, chamadas: chamadas + 1 },
    { onConflict: "email,dia" },
  )

  const prompt = `Você é o guia da carta "${cartaNome}" num app de ritual diário de numerologia.
Tom: acolhedor, direto, sem clichê espiritual vazio, no máximo 2 frases curtas.
A pessoa respondeu à pergunta "${pergunta}": "${resposta}"
Escreva um eco breve que reaja ao que ela escreveu de verdade (cite ou reflita o conteúdo, não repita a pergunta), no espírito da carta: ${essencia || cartaNome}.
Não dê conselho ainda — isso vem depois. Só reflita.
Não dê conselho médico, jurídico nem financeiro concreto.`

  const modelo = Deno.env.get("GEMINI_MODEL") ?? "gemini-3.6-flash"
  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 2800)
  try {
    const respostaApi = await fetch(endpoint, {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "x-goog-api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 120, temperature: 0.7 },
      }),
    })
    if (!respostaApi.ok) {
      console.error("gerar-eco: Gemini", respostaApi.status, await respostaApi.text())
      return json({ error: "upstream" }, 502)
    }
    const payload = (await respostaApi.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    const texto = payload.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join(" ")
      .trim() ?? ""
    if (texto.length < 8) {
      return json({ error: "empty" }, 502)
    }
    return json({ eco: texto.slice(0, 400) }, 200)
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
