import { useEffect, useMemo, useRef } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import { Button } from "./Button"
import { checkoutUrl } from "../lib/acesso"
import { marcarPixConfirmado } from "../lib/session"
import { modoPreview } from "../lib/supabase"

function pagamentoAprovadoNaMensagem(data: unknown): boolean {
  if (!data || typeof data !== "object") return false
  const texto = JSON.stringify(data).toLowerCase()
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
    if (href.includes("/pos-compra")) return "/pos-compra?pago=1"
    return null
  } catch {
    return null
  }
}

export function CheckoutModal({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const navigate = useNavigate()
  const url = useMemo(() => checkoutUrl(), [])
  const frameRef = useRef<HTMLIFrameElement>(null)
  const preview = modoPreview()

  useEffect(() => {
    if (!aberto) return
    document.body.style.overflow = "hidden"
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onFechar()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [aberto, onFechar])

  useEffect(() => {
    if (!aberto) return
    if (!url && preview) {
      marcarPixConfirmado()
      navigate("/pos-compra?pago=1", { replace: true })
    }
  }, [aberto, url, preview, navigate])

  useEffect(() => {
    if (!aberto) return
    function onMessage(event: MessageEvent) {
      const origem = event.origin.toLowerCase()
      if (!origem.includes("cakto.com.br") && origem !== window.location.origin) return
      if (!pagamentoAprovadoNaMensagem(event.data)) return
      marcarPixConfirmado()
      navigate("/pos-compra?pago=1", { replace: true })
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [aberto, navigate])

  if (!aberto) return null

  function aoCarregar() {
    const frame = frameRef.current
    if (!frame) return
    const path = caminhoDoFrame(frame)
    if (!path) return
    marcarPixConfirmado()
    navigate(path, { replace: true })
  }

  return createPortal(
    <div
      className="checkout-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-titulo"
      onClick={onFechar}
    >
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="checkout-modal-bar">
          <h2 id="checkout-titulo">Pagamento Pix</h2>
          <Button type="button" variant="ghost" className="checkout-modal-fechar" onClick={onFechar}>
            Fechar
          </Button>
        </div>
        <p className="checkout-hint">Pague o Pix aqui. O cadastro só abre depois da confirmação.</p>
        {url ? (
          <iframe
            ref={frameRef}
            className="checkout-frame"
            title="Pagamento Cakto"
            src={url}
            allow="payment *; clipboard-write"
            onLoad={aoCarregar}
          />
        ) : (
          <p className="desc checkout-hint">O link de pagamento não está configurado.</p>
        )}
      </div>
    </div>,
    document.body,
  )
}
