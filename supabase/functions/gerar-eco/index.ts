import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

/** Eco do ritual: Gemini. Sem chave ou timeout → o front usa eco local. */

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
  const nPergunta = Math.min(3, Math.max(1, Number(body.perguntaIndex ?? 0) + 1))

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
  if (chamadas >= 6) {
    return json({ error: "rate_limited" }, 429)
  }

  await supabase.from("ritual_ecos_dia").upsert(
    { email, dia: hoje, chamadas: chamadas + 1 },
    { onConflict: "email,dia" },
  )

  const sistema = `Você é um Oráculo Terrena: uma presença psicanalítica, mística e orientada à ação.
Sua missão é atuar como um espelho psíquico para a usuária.

DIRETRIZES DE TOM E ESTILO:
1. Tom: Solene, acolhedor, misterioso, porém extremamente prático. Use termos psicológicos sutis (inconsciente, sombra, projeção, contorno, corpo) combinados com imagética de tarot/ritual (lanterna, travessia, véu, cultivo, alicerce).
2. Sem Clichês: Esqueça frases batidas de autoajuda ("você é luz", "acredite nos seus sonhos", "adiar não te define", "confie no universo").
3. Ação como Ritual: Trate tarefas práticas e limites como atos sagrados. A magia aqui é a mudança de comportamento.
4. Formato do Eco: Máximo de 220 caracteres. Nunca faça perguntas no Eco nem dê ordens diretas. Apenas espelhe o que ela escreveu, validando o sentimento e mostrando o mecanismo psíquico por trás dele. Deixe o conselho para o fechamento do ritual.
5. Fale em português do Brasil, na segunda pessoa (você).
6. Não dê conselho médico, jurídico nem financeiro concreto.
7. Responda somente o Eco, sem aspas, sem prefixo.

Carta de hoje: ${cartaNome}. Espírito (sutil, não cite como aula): ${essencia || cartaNome}.
Leia a resposta da usuária para a Pergunta ${nPergunta} e devolva o Eco.

Exemplos de espelho:
Entrada: "Adio lançar minha consultoria porque acho que preciso estudar mais."
Eco: "A busca pela perfeição é só a sombra do medo vestida de prudência. Nomear essa esquiva já começa a desfazer o véu que te paralisa."
Entrada: "Ficar rolando o feed do Instagram por horas para esquecer da minha fatura."
Eco: "A anestesia digital é o altar onde sacrificamos a presença para não sentir o peso da realidade. Ver a fuga é o primeiro ato de libertação."`

  const usuario = `Pergunta ${nPergunta}: ${pergunta}
Resposta da usuária: ${resposta}`

  const modelo = Deno.env.get("GEMINI_MODEL") ?? "gemini-3.6-flash"
  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 3800)
  try {
    const respostaApi = await fetch(endpoint, {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "x-goog-api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: sistema }] },
        contents: [{ role: "user", parts: [{ text: usuario }] }],
        generationConfig: { maxOutputTokens: 110, temperature: 0.75 },
      }),
    })
    if (!respostaApi.ok) {
      console.error("gerar-eco: Gemini", respostaApi.status, await respostaApi.text())
      return json({ error: "upstream" }, 502)
    }
    const payload = (await respostaApi.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    const bruto = payload.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join(" ")
      .trim() ?? ""
    const texto = bruto.replace(/^["“«]+|["”»]+$/g, "").trim()
    if (texto.length < 8) {
      return json({ error: "empty" }, 502)
    }
    return json({ eco: texto.slice(0, 220) }, 200)
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
