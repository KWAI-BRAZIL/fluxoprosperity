import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env-publico"

let client: SupabaseClient | null = null

export function supabaseConfigurado(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

/** Só no `npm run dev` sem .env — produção nunca entra aqui. */
export function modoPreview(): boolean {
  return import.meta.env.DEV && !supabaseConfigurado()
}

export function getSupabase(): SupabaseClient {
  if (!supabaseConfigurado()) {
    throw new Error("Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.")
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return client
}
