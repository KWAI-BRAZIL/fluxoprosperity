import { createContext, useContext } from "react"
import type { Perfil } from "./acesso"

export type AcessoCtx = {
  email: string
  perfil: Perfil
  setPerfil: (perfil: Perfil) => void
}

export const AcessoContext = createContext<AcessoCtx | null>(null)

export function useAcesso(): AcessoCtx {
  const ctx = useContext(AcessoContext)
  if (!ctx) throw new Error("useAcesso precisa estar dentro de ProtectedApp")
  return ctx
}
