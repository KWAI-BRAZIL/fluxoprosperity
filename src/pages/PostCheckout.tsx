import { useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { BrandMark } from "../components/Brand"
import { Button } from "../components/Button"
import { Shell } from "../components/Shell"
import { PreparandoHalo, SectionCard, SectionKicker } from "../components/Ui"
import { cadastrarConta, obterPerfil, onboardingCompleto, statusConta } from "../lib/acesso"
import { EMAIL_PREVIEW, emailValido, getEmailSessao } from "../lib/session"
import { modoPreview } from "../lib/supabase"

function emailInicial(params: URLSearchParams): string {
  return params.get("email") ?? getEmailSessao() ?? ""
}

export function PostCheckout() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preview = modoPreview()
  const [email, setEmail] = useState(() => emailInicial(params))
  const [senha, setSenha] = useState("")
  const [confirma, setConfirma] = useState("")
  const [pagoNoServidor, setPagoNoServidor] = useState(preview)
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "nao" | "error">("idle")
  const [mensagem, setMensagem] = useState("")

  useEffect(() => {
    if (window.self === window.top) return
    try {
      window.top?.location.replace(`${window.location.pathname}${window.location.search}`)
    } catch {
      /* iframe de outro domínio */
    }
  }, [])

  async function conferirPagamento(destino: string): Promise<boolean> {
    if (preview) return true
    if (!emailValido(destino)) {
      setStatus("error")
      setMensagem("Use o mesmo e-mail da compra.")
      return false
    }
    setStatus("loading")
    setMensagem("")
    try {
      const estado = await statusConta(destino)
      if (estado === "cadastrar") {
        setPagoNoServidor(true)
        setStatus("idle")
        setMensagem("")
        return true
      }
      if (estado === "entrar") {
        setStatus("error")
        setMensagem("Esta conta já tem senha. Entre pelo login.")
        return false
      }
      setPagoNoServidor(false)
      setStatus("nao")
      setMensagem(
        "Ainda não há pagamento deste e-mail no servidor. Se o Pix acabou de cair, aguarde um minuto e tente de novo.",
      )
      return false
    } catch (e) {
      setStatus("error")
      setMensagem(e instanceof Error ? e.message : "Não foi possível conferir o pagamento.")
      return false
    }
  }

  useEffect(() => {
    const daUrl = params.get("email")
    if (preview || !daUrl || !emailValido(daUrl)) return
    void conferirPagamento(daUrl)
  }, [params, preview])

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
    const ok = await conferirPagamento(destino)
    if (!ok) return
    setStatus("loading")
    try {
      await cadastrarConta(destino, senha)
      await irAoApp(destino)
    } catch (e) {
      setPagoNoServidor(false)
      setStatus("error")
      setMensagem(e instanceof Error ? e.message : "Não foi possível criar o acesso.")
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!pagoNoServidor) {
      void conferirPagamento(email)
      return
    }
    void cadastrar(email)
  }

  return (
    <Shell>
      <div className="screen has-halo">
        <div className="screen-head">
          <div className="brand-row">
            <BrandMark />
          </div>
          <PreparandoHalo />
          <h2>{pagoNoServidor ? "Pagamento encontrado. Crie seu acesso." : "Confirme o e-mail do Pix"}</h2>
          <p className="desc">
            {pagoNoServidor
              ? "Defina uma senha para este e-mail. Sem pagamento no servidor, a conta não é criada."
              : "O cadastro só abre quando o Pix deste e-mail estiver confirmado no servidor. Tela de obrigado ou checkout travado não liberam acesso."}
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
                onChange={(ev) => {
                  setEmail(ev.target.value)
                  setPagoNoServidor(preview)
                }}
                required={!preview}
              />
              {pagoNoServidor ? (
                <>
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
                </>
              ) : null}
              {mensagem ? (
                <p className={`status ${status === "nao" || status === "error" ? "error" : ""}`}>
                  {mensagem}
                </p>
              ) : null}
            </SectionCard>
          </div>
          <div className="acesso-actions">
            <Button type="submit" className="cta-principal" disabled={status === "loading"}>
              {status === "loading"
                ? "Conferindo pagamento…"
                : pagoNoServidor
                  ? "Criar senha e entrar"
                  : "Conferir pagamento deste e-mail"}
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
