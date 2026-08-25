import { useState, type FormEvent } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { BrandMark } from "../components/Brand"
import { Button } from "../components/Button"
import { Shell } from "../components/Shell"
import { SectionCard, SectionKicker } from "../components/Ui"
import { entrarConta, obterPerfil, onboardingCompleto, statusConta } from "../lib/acesso"
import { EMAIL_PREVIEW, emailValido, getEmailSessao } from "../lib/session"
import { modoPreview } from "../lib/supabase"

export function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preview = modoPreview()
  const [email, setEmail] = useState(() => params.get("email") ?? getEmailSessao() ?? "")
  const [senha, setSenha] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")
  const [mensagem, setMensagem] = useState("")

  async function entrar(destino: string) {
    const bruto = destino.trim()
    if (preview) {
      const usado = emailValido(bruto) ? bruto : EMAIL_PREVIEW
      await entrarConta(usado, senha || "preview12")
      const perfil = await obterPerfil(usado)
      navigate(onboardingCompleto(perfil) ? "/home" : "/onboarding", { replace: true })
      return
    }
    if (!emailValido(destino) || senha.length < 1) {
      setStatus("error")
      setMensagem("Digite o e-mail e a senha cadastrados após o pagamento.")
      return
    }
    setStatus("loading")
    setMensagem("")
    try {
      const estado = await statusConta(destino)
      if (estado === "nao_pago" || estado === "invalido") {
        setStatus("error")
        setMensagem("Não há pagamento para este e-mail. Pague para criar um acesso.")
        return
      }
      if (estado === "cadastrar") {
        navigate(`/pos-compra?email=${encodeURIComponent(destino.trim().toLowerCase())}`, {
          replace: true,
        })
        return
      }
      await entrarConta(destino, senha)
      const perfil = await obterPerfil(destino)
      navigate(onboardingCompleto(perfil) ? "/home" : "/onboarding", { replace: true })
    } catch (e) {
      setStatus("error")
      setMensagem(e instanceof Error ? e.message : "Não foi possível entrar.")
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void entrar(email)
  }

  return (
    <Shell>
      <div className="screen screen-auth">
        <div className="screen-head">
          <BrandMark />
          <h2>Entrar no app</h2>
        </div>

        <form onSubmit={onSubmit} className="acesso-form">
          <div>
            <SectionKicker>Login</SectionKicker>
            <SectionCard>
              <input
                className="field"
                type="email"
                autoComplete="email"
                placeholder="E-mail"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                required={!preview}
              />
              <input
                className="field"
                type="password"
                autoComplete="current-password"
                placeholder="Senha"
                value={senha}
                onChange={(ev) => setSenha(ev.target.value)}
                required={!preview}
              />
              {mensagem ? <p className="status error">{mensagem}</p> : null}
            </SectionCard>
          </div>
          <Button type="submit" className="cta-principal" disabled={status === "loading"}>
            {status === "loading" ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      </div>
    </Shell>
  )
}
