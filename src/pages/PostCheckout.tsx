import { useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { BrandMark } from "../components/Brand"
import { Button } from "../components/Button"
import { Shell } from "../components/Shell"
import { PreparandoHalo, SectionCard, SectionKicker } from "../components/Ui"
import { cadastrarConta, obterPerfil, onboardingCompleto, statusConta } from "../lib/acesso"
import { EMAIL_PREVIEW, emailValido, getEmailSessao, marcarPixConfirmado, pixConfirmado } from "../lib/session"
import { modoPreview } from "../lib/supabase"

function emailInicial(params: URLSearchParams): string {
  return params.get("email") ?? getEmailSessao() ?? ""
}

export function PostCheckout() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preview = modoPreview()
  const [liberado, setLiberado] = useState(
    () => preview || pixConfirmado() || params.get("pago") === "1",
  )

  useEffect(() => {
    if (params.get("pago") === "1") marcarPixConfirmado()
  }, [params])

  useEffect(() => {
    if (window.self === window.top) return
    try {
      window.top?.location.replace(`${window.location.pathname}${window.location.search}`)
    } catch {
      /* iframe de outro domínio */
    }
  }, [])

  useEffect(() => {
    if (preview || pixConfirmado() || params.get("pago") === "1") {
      setLiberado(true)
      return
    }
    const email = emailInicial(params)
    if (!emailValido(email)) {
      navigate("/?checkout=1", { replace: true })
      return
    }
    void statusConta(email).then((estado) => {
      if (estado === "cadastrar" || estado === "entrar") {
        marcarPixConfirmado()
        setLiberado(true)
        return
      }
      navigate("/?checkout=1", { replace: true })
    })
  }, [navigate, params, preview])
  const [email, setEmail] = useState(() => emailInicial(params))
  const [senha, setSenha] = useState("")
  const [confirma, setConfirma] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "nao" | "error">("idle")
  const [mensagem, setMensagem] = useState("")

  async function irAoApp(destino: string) {
    const perfil = await obterPerfil(destino)
    setStatus("ok")
    navigate(onboardingCompleto(perfil) ? "/home" : "/onboarding", { replace: true })
  }

  async function cadastrar(destino: string) {
    const bruto = destino.trim()
    if (preview) {
      const usado = emailValido(bruto) ? bruto : EMAIL_PREVIEW
      await cadastrarConta(usado, senha || "preview12")
      await irAoApp(usado)
      return
    }
    if (!emailValido(destino)) {
      setStatus("error")
      setMensagem("Use o mesmo e-mail da compra.")
      return
    }
    if (senha.length < 8) {
      setStatus("error")
      setMensagem("A senha precisa ter pelo menos 8 caracteres.")
      return
    }
    if (senha !== confirma) {
      setStatus("error")
      setMensagem("As senhas não coincidem.")
      return
    }
    setStatus("loading")
    setMensagem("")
    try {
      const estado = await statusConta(destino)
      if (estado === "nao_pago" || estado === "invalido") {
        setStatus("nao")
        setMensagem(
          "Ainda não encontramos um pagamento para este e-mail. Se você acabou de pagar, aguarde um minuto e tente de novo.",
        )
        return
      }
      if (estado === "entrar") {
        setStatus("error")
        setMensagem("Esta conta já tem senha. Entre pelo login.")
        return
      }
      await cadastrarConta(destino, senha)
      await irAoApp(destino)
    } catch (e) {
      setStatus("error")
      setMensagem(e instanceof Error ? e.message : "Não foi possível criar o acesso.")
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void cadastrar(email)
  }

  if (!liberado) {
    return (
      <Shell>
        <div className="screen">
          <p className="desc">Confirmando o Pix…</p>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="screen has-halo">
        <div className="screen-head">
          <div className="brand-row">
            <BrandMark />
          </div>
          <PreparandoHalo />
          <h2>Pagamento confirmado. Crie seu acesso.</h2>
          <p className="desc">
            Use o e-mail da compra e defina uma senha. Só quem cadastrar depois de pagar entra no
            app.
          </p>
        </div>

        <form onSubmit={onSubmit} className="acesso-form">
          <div>
            <SectionKicker>Cadastro</SectionKicker>
            <SectionCard>
            <input
              className="field"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={preview ? "E-mail (opcional)" : "E-mail da compra"}
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              required={!preview}
            />
            <input
              className="field"
              type="password"
              autoComplete="new-password"
              placeholder="Senha (mín. 8 caracteres)"
              value={senha}
              onChange={(ev) => setSenha(ev.target.value)}
              required={!preview}
              minLength={preview ? undefined : 8}
            />
            <input
              className="field"
              type="password"
              autoComplete="new-password"
              placeholder="Confirmar senha"
              value={confirma}
              onChange={(ev) => setConfirma(ev.target.value)}
              required={!preview}
            />
            {mensagem ? (
              <p className={`status ${status === "nao" || status === "error" ? "error" : ""}`}>
                {mensagem}
              </p>
            ) : null}
          </SectionCard>
          </div>
          <div className="acesso-actions">
            <Button type="submit" className="cta-principal" disabled={status === "loading"}>
              {status === "loading" ? "Criando acesso…" : "Criar senha e entrar"}
            </Button>
            <p className="desc">
              Já cadastrou? <Link to="/entrar">Entrar com e-mail e senha</Link>
            </p>
          </div>
        </form>
      </div>
    </Shell>
  )
}
