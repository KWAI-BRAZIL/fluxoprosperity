import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

/**
 * Webhook Cakto — compra única (legado) e assinatura mensal.
 *
 * Segredo no JSON `secret` ou header. Docs Cakto: webhooks.
 *
 * Secrets: CAKTO_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

type Json = Record<string, unknown>

type StatusAssinatura = "ativa" | "atrasada" | "cancelada" | "inativa"

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405)
  }

  const expected = Deno.env.get("CAKTO_WEBHOOK_SECRET") ?? ""
  if (!expected) {
    console.error("cakto-webhook: CAKTO_WEBHOOK_SECRET ausente")
    return json({ ok: false, error: "misconfigured" }, 500)
  }

  let body: Json
  try {
    body = (await req.json()) as Json
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400)
  }

  const headerSecret =
    req.headers.get("x-webhook-secret") ??
    req.headers.get("x-cakto-secret") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    ""
  const provided = String(body.secret ?? headerSecret)

  if (!(await secretsIguais(provided, expected))) {
    console.error("cakto-webhook: secret inválido")
    return json({ ok: false, error: "unauthorized" }, 401)
  }

  const event = String(body.event ?? body.type ?? "").toLowerCase()
  const acao = classificarEvento(event)
  if (acao === "ignorar") {
    return json({ ok: true, ignored: event }, 200)
  }

  const data = (body.data ?? body) as Json
  const customer = (data.customer ?? data.buyer ?? {}) as Json
  const email = String(customer.email ?? data.email ?? "")
    .trim()
    .toLowerCase()
  const nome = String(customer.name ?? customer.full_name ?? "").trim() || null

  if (!email.includes("@")) {
    console.error("cakto-webhook: e-mail ausente", { event })
    return json({ ok: false, error: "missing_email" }, 400)
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  if (!supabaseUrl || !serviceKey) {
    return json({ ok: false, error: "misconfigured" }, 500)
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const proxima = proximaCobranca(data, acao)
  const patch = montarPatch(acao, nome, proxima)

  const { error } = await supabase.from("acessos").upsert(
    { email, ...patch },
    { onConflict: "email" },
  )

  if (error) {
    console.error("cakto-webhook: falha no upsert", error.message)
    return json({ ok: false, error: "db_error" }, 500)
  }

  return json({ ok: true, action: acao }, 200)
})

function classificarEvento(event: string): "ativar" | "falha" | "cancelar" | "ignorar" {
  if (
    /purchase_approved|paid|subscription_renewed|subscription\.renewed|subscription_created|subscription\.created|subscription_activated|recurring.*approv|renov/.test(
      event,
    )
  ) {
    return "ativar"
  }
  if (/charge_fail|payment_fail|overdue|atrasad|past_due|unpaid/.test(event)) {
    return "falha"
  }
  if (/cancel|unsubscrib/.test(event)) {
    return "cancelar"
  }
  return "ignorar"
}

function proximaCobranca(data: Json, acao: "ativar" | "falha" | "cancelar"): string {
  const sub = (data.subscription ?? data.offer ?? {}) as Json
  const raw = [
    data.next_billing_date,
    data.next_charge_date,
    data.next_payment_date,
    sub.next_billing_date,
    sub.next_charge_date,
  ]
    .map((v) => String(v ?? ""))
    .find((v) => /^\d{4}-\d{2}-\d{2}/.test(v))
  if (raw) return raw.slice(0, 10)
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + (acao === "falha" ? 0 : 30))
  return d.toISOString().slice(0, 10)
}

function montarPatch(
  acao: "ativar" | "falha" | "cancelar",
  nome: string | null,
  proxima: string,
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    produto: "assinatura",
    proxima_cobranca: proxima,
    ...(nome ? { nome } : {}),
  }
  if (acao === "ativar") {
    return {
      ...base,
      pago: true,
      assinatura_status: "ativa" satisfies StatusAssinatura,
      cancelada_em: null,
    }
  }
  if (acao === "falha") {
    return {
      ...base,
      assinatura_status: "atrasada" satisfies StatusAssinatura,
    }
  }
  return {
    ...base,
    assinatura_status: "cancelada" satisfies StatusAssinatura,
    cancelada_em: new Date().toISOString(),
  }
}

async function secretsIguais(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder()
  const ha = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(a)))
  const hb = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(b)))
  if (ha.length !== hb.length) return false
  let diff = 0
  for (let i = 0; i < ha.length; i += 1) diff |= ha[i] ^ hb[i]
  return diff === 0
}

function json(payload: Json, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}
