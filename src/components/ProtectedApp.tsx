import { useEffect, useState } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { obterPerfil, onboardingCompleto, verificarSessao, type Perfil } from "../lib/acesso"
import { AcessoContext } from "../lib/acesso-context"
import { getEmailSessao, getSessaoToken } from "../lib/session"
import { modoPreview, supabaseConfigurado } from "../lib/supabase"
import { Shell } from "./Shell"

export function ProtectedApp() {
  const location = useLocation()
  const [status, setStatus] = useState<"loading" | "ok" | "unpaid" | "error">("loading")
  const [email, setEmail] = useState("")
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [erro, setErro] = useState("")

  useEffect(() => {
    let cancel = false
    async function run() {
      if (modoPreview()) {
        const stored = getEmailSessao()
        if (!stored) {
          if (!cancel) setStatus("unpaid")
          return
        }
        const dados = await obterPerfil(stored)
        if (!cancel) {
          setEmail(stored)
          setPerfil(dados)
          setStatus(dados ? "ok" : "error")
        }
        return
      }

      const stored = getEmailSessao()
      const token = getSessaoToken()
      if (!stored || !token) {
        if (!cancel) setStatus("unpaid")
        return
      }
      if (!supabaseConfigurado()) {
        if (!cancel) {
          setErro("Supabase ainda não está configurado neste ambiente.")
          setStatus("error")
        }
        return
      }
      try {
        const ok = await verificarSessao(stored, token)
        if (!ok) {
          if (!cancel) setStatus("unpaid")
          return
        }
        const dados = await obterPerfil(stored)
        if (!dados) {
          if (!cancel) setStatus("unpaid")
          return
        }
        if (!cancel) {
          setEmail(stored)
          setPerfil(dados)
          setStatus("ok")
        }
      } catch (e) {
        if (!cancel) {
          setErro(e instanceof Error ? e.message : "Não foi possível validar o acesso.")
          setStatus("error")
        }
      }
    }
    void run()
    return () => {
      cancel = true
    }
  }, [location.pathname])

  if (status === "loading") {
    return (
      <Shell care={false}>
        <div className="loading">
          <p>Confirmando seu acesso…</p>
        </div>
      </Shell>
    )
  }

  if (status === "unpaid") {
    return <Navigate to="/entrar" replace />
  }

  if (status === "error" || !perfil) {
    return (
      <Shell>
        <div className="screen center">
          <h2>Não conseguimos validar agora</h2>
          <p className="desc">{erro || "Tente de novo em instantes."}</p>
        </div>
      </Shell>
    )
  }

  const pronto = onboardingCompleto(perfil)
  const emOnboarding = location.pathname === "/onboarding"

  if (!pronto && !emOnboarding) {
    return <Navigate to="/onboarding" replace />
  }
  if (pronto && emOnboarding) {
    return <Navigate to="/home" replace />
  }

  return (
    <AcessoContext.Provider value={{ email, perfil, setPerfil }}>
      <Outlet />
    </AcessoContext.Provider>
  )
}
