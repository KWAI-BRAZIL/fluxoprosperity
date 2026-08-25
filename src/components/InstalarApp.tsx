import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { esperarPrompt, pedirInstalacaoNativa } from "../lib/pwa-install"
import { appJaInstalado, plataformaPwa } from "../lib/pwa"

function safariNoIos(): boolean {
  const ua = navigator.userAgent || ""
  return /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|Chrome|Android/i.test(ua)
}

export function InstalarApp() {
  const [aberto, setAberto] = useState(false)
  const [guia, setGuia] = useState(false)
  const [instalando, setInstalando] = useState(false)
  const [avisoAndroid, setAvisoAndroid] = useState(false)
  const plataforma = typeof navigator === "undefined" ? "outro" : plataformaPwa()
  const iphone = plataforma === "ios"

  useEffect(() => {
    if (appJaInstalado()) return
    setAberto(true)
  }, [])

  if (!aberto || appJaInstalado() || typeof document === "undefined") return null

  function fechar() {
    setAberto(false)
    setGuia(false)
  }

  async function noCta() {
    if (iphone) {
      setGuia(true)
      return
    }
    setInstalando(true)
    setAvisoAndroid(false)
    try {
      await esperarPrompt(2500)
      let resultado = await pedirInstalacaoNativa()
      if (resultado === "unavailable") {
        await esperarPrompt(1500)
        resultado = await pedirInstalacaoNativa()
      }
      if (resultado === "accepted") fechar()
      if (resultado === "unavailable") setAvisoAndroid(true)
    } finally {
      setInstalando(false)
    }
  }

  const dica = iphone
    ? "Safari → Compartilhar → Tela de Início"
    : avisoAndroid
      ? "Abra no Chrome e toque em Instalar de novo"
      : "Salva na tela inicial, sem loja"

  const passosIos = safariNoIos()
    ? [
        "Toque no botão Compartilhar (quadrado com a seta para cima).",
        "Role a lista e toque em Adicionar à Tela de Início.",
        "Confirme em Adicionar. O ícone aparece na tela inicial.",
      ]
    : [
        "Abra este site no Safari (no iPhone o atalho só funciona no Safari).",
        "Toque em Compartilhar (quadrado com a seta para cima).",
        "Toque em Adicionar à Tela de Início e depois em Adicionar.",
      ]

  return createPortal(
    <div className="pwa-layer" style={{ zIndex: 4000, pointerEvents: "auto" }}>
      <button type="button" className="pwa-scrim" aria-label="Fechar aviso de instalação" onClick={fechar} />
      <div
        role="dialog"
        aria-labelledby="pwa-titulo"
        className={`pwa-banner${guia ? " pwa-banner-guia" : ""}`}
      >
        <img className="pwa-logo" src="/apple-touch-icon.png" alt="" width={28} height={28} />
        <div className="pwa-banner-texto">
          <p id="pwa-titulo" className="pwa-titulo">
            Instale no celular
          </p>
          <p className="pwa-dica">{dica}</p>
        </div>
        <button type="button" className="pwa-cta" onClick={() => void noCta()} disabled={instalando}>
          {instalando ? "…" : iphone ? "Como instalar" : "Instalar"}
        </button>
        <button type="button" className="pwa-fechar" onClick={fechar} aria-label="Fechar">
          ×
        </button>
        {iphone && guia ? (
          <ol className="pwa-passos">
            {passosIos.map((passo) => (
              <li key={passo}>{passo}</li>
            ))}
          </ol>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
