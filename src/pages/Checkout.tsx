import { useEffect, useMemo, useRef } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { BrandMark } from "../components/Brand"
import { Shell } from "../components/Shell"
import { checkoutUrl } from "../lib/acesso"
import { marcarPixConfirmado } from "../lib/session"
import { modoPreview } from "../lib/supabase"

function pagamentoAprovadoNaMensagem(data: unknown): boolean {
  if (!data || typeof data !== "object") return false
  const row = data as Record<string, unknown>
  const texto = JSON.stringify(row).toLowerCase()
  return (
    texto.includes("purchase_approved") ||
    texto.includes("payment_approved") ||
    texto.includes("pix_pago") ||
    texto.includes("\"paid\"") ||
    texto.includes("status\":\"paid") ||
    texto.includes("pagamento_aprovado")
  )
}

function caminhoDoFrame(frame: HTMLIFrameElement): string | null {
  try {
    const href = frame.contentWindow?.location.href ?? ""
    if (!href) return null
    if (href.includes("/pos-compra")) return "/pos-compra?pago=1"
    return null
  } catch {
    return null
  }
}

export function Checkout() {
  const navigate = useNavigate()
  const url = useMemo(() => checkoutUrl(), [])
  const frameRef = useRef<HTMLIFrameElement>(null)
  const preview = modoPreview()

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const origem = event.origin.toLowerCase()
      if (!origem.includes("cakto.com.br") && origem !== window.location.origin) return
      if (!pagamentoAprovadoNaMensagem(event.data)) return
      marcarPixConfirmado()
      navigate("/pos-compra?pago=1", { replace: true })
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [navigate])

  if (!url) {
    if (preview) {
      marcarPixConfirmado()
      return <Navigate to="/pos-compra?pago=1" replace />
    }
    return (
      <Shell>
        <div className="screen">
          <h2>Checkout indisponível</h2>
          <p className="desc">O link de pagamento não está configurado. Volte e tente de novo em instantes.</p>
          <Link to="/">Voltar</Link>
        </div>
      </Shell>
    )
  }

  function aoCarregar() {
    const frame = frameRef.current
    if (!frame) return
    const path = caminhoDoFrame(frame)
    if (!path) return
    marcarPixConfirmado()
    navigate(path, { replace: true })
  }

  return (
    <Shell>
      <div className="checkout-screen">
        <div className="checkout-bar">
          <BrandMark />
          <Link to="/">Voltar</Link>
        </div>
        <p className="checkout-hint">Pague o Pix nesta tela. O cadastro só abre depois da confirmação.</p>
        <iframe
          ref={frameRef}
          className="checkout-frame"
          title="Pagamento Cakto"
          src={url}
          allow="payment *; clipboard-write"
          onLoad={aoCarregar}
        />
      </div>
    </Shell>
  )
}
