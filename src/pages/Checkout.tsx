import { useRef } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { BrandMark } from "../components/Brand"
import { Shell } from "../components/Shell"
import { checkoutUrl } from "../lib/acesso"

function caminhoDoFrame(frame: HTMLIFrameElement): string | null {
  try {
    const loc = frame.contentWindow?.location
    if (!loc) return null
    const path = `${loc.pathname}${loc.search}`
    if (path.includes("/pos-compra") || path.includes("/entrar")) return path
    return null
  } catch {
    return null
  }
}

export function Checkout() {
  const navigate = useNavigate()
  const url = checkoutUrl()
  const frameRef = useRef<HTMLIFrameElement>(null)

  if (!url) {
    return <Navigate to="/pos-compra" replace />
  }

  function aoCarregar() {
    const frame = frameRef.current
    if (!frame) return
    const path = caminhoDoFrame(frame)
    if (path) navigate(path, { replace: true })
  }

  return (
    <Shell>
      <div className="checkout-screen">
        <div className="checkout-bar">
          <BrandMark />
          <Link to="/">Voltar</Link>
          <Link to="/pos-compra" className="checkout-bar-end">
            Já paguei — criar senha
          </Link>
        </div>
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
