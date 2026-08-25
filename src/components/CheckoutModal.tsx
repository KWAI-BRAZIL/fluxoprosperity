import { useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "./Button"
import { checkoutUrl } from "../lib/acesso"

export function CheckoutModal({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const url = checkoutUrl()

  useEffect(() => {
    if (!aberto) return
    document.body.style.overflow = "hidden"
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onFechar()
    }
    window.addEventListener("keydown", onKey)
    if (url) {
      window.location.assign(url)
    }
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [aberto, onFechar, url])

  if (!aberto) return null

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
        {url ? (
          <p className="checkout-hint">Abrindo o checkout da Cakto…</p>
        ) : (
          <p className="desc checkout-hint">O link de pagamento não está configurado.</p>
        )}
      </div>
    </div>,
    document.body,
  )
}
