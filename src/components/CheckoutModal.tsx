import { useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import { Button } from "./Button"
import { checkoutUrl } from "../lib/acesso"

export function CheckoutModal({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const url = useMemo(() => checkoutUrl(), [])

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
        <p className="checkout-hint">Pague o Pix aqui. O cadastro só abre depois que o pagamento chegar no servidor.</p>
        {url ? (
          <iframe
            className="checkout-frame"
            title="Pagamento Cakto"
            src={url}
            allow="payment *; clipboard-write"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <p className="desc checkout-hint">O link de pagamento não está configurado.</p>
        )}
      </div>
    </div>,
    document.body,
  )
}
