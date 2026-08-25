/** Config pública do front. A chave anon é feita para o browser; a service role nunca entra aqui. */
const env = import.meta.env

export const SUPABASE_URL = (env.VITE_SUPABASE_URL || 'https://ruirfbndsnzaqaezidfr.supabase.co').trim()
export const SUPABASE_ANON_KEY = (env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1aXJmYm5kc256YXFhZXppZGZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MDM4MTEsImV4cCI6MjEwMzA3OTgxMX0.rtCrAQef5QGak0QOcFOnwLPohcVs-1xHf6dN7nqTy4w').trim()
export const CAKTO_CHECKOUT_URL = (env.VITE_CAKTO_CHECKOUT_URL || 'https://pay.cakto.com.br/34empb2_1059459').trim()
