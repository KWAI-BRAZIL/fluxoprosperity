import { useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import { Button } from "./Button"
import { checkoutUrl } from "../lib/acesso"
import { modoPreview } from "../lib/supabase"

export function CheckoutModal({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const navigate = useNavigate()
  const url = useMemo(() => checkoutUrl(), [])
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
        <p className="checkout-hint">
          Pague o Pix. O cadastro só libera quando o pagamento chegar no servidor — um checkout
          travado ou um link de obrigado não conta.
        </p>
        {preview ? (
          <p className="desc checkout-hint">Modo local sem Supabase: use /pos-compra só em desenvolvimento.</p>
        ) : url ? (
          <>
            <iframe
              className="checkout-frame"
              title="Pagamento Cakto"
              src={url}
              allow="payment *; clipboard-write"
            />
            <p className="checkout-hint">
              Se a janela não carregar,{" "}
              <a href={url} target="_blank" rel="noreferrer">
                abra o Pix numa nova aba
              </a>
              . Depois volte e crie a senha em Cadastro, com o e-mail da compra.
            </p>
          </>
        ) : (
          <p className="desc checkout-hint">O link de pagamento não está configurado.</p>
        )}
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            onFechar()
            navigate("/pos-compra")
          }}
        >
          Já paguei — criar senha
        </Button>
      </div>
    </div>,
    document.body,
  )
}
