import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { appJaInstalado, plataformaPwa } from "../lib/pwa"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function safariNoIos(): boolean {
  const ua = navigator.userAgent || ""
  return /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|Chrome|Android/i.test(ua)
}

export function InstalarApp() {
  const [aberto, setAberto] = useState(false)
  const [guia, setGuia] = useState(false)
  const [promptEvento, setPromptEvento] = useState<BeforeInstallPromptEvent | null>(null)
  const [instalando, setInstalando] = useState(false)
  const plataforma = typeof navigator === "undefined" ? "outro" : plataformaPwa()

  useEffect(() => {
    if (appJaInstalado()) return
    setAberto(true)
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setPromptEvento(event as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", onPrompt)
    return () => window.removeEventListener("beforeinstallprompt", onPrompt)
  }, [])

  if (!aberto || appJaInstalado() || typeof document === "undefined") return null

  function fechar() {
    setAberto(false)
    setGuia(false)
  }

  async function instalar() {
    if (!promptEvento) {
      setGuia(true)
      return
    }
    setInstalando(true)
    try {
      await promptEvento.prompt()
      const escolha = await promptEvento.userChoice
      if (escolha.outcome === "accepted") fechar()
    } finally {
      setInstalando(false)
    }
  }

  const podeBaixar = Boolean(promptEvento)
  const dica = podeBaixar
    ? "Atalho na tela inicial, sem loja"
    : plataforma === "ios"
      ? "Safari → Compartilhar → Tela de Início"
      : "Menu do navegador → Instalar app"

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

  const passosAndroid = [
    "Toque no menu ⋮ no canto do Chrome.",
    "Toque em Instalar app ou Adicionar à tela inicial.",
    "Confirme. O ícone aparece junto aos outros apps.",
  ]

  const passosOutro = [
    "No Chrome ou Edge, abra o menu do navegador.",
    "Toque em Instalar Fluxo da Prosperidade (ou Instalar app).",
    "Confirme. O app abre em janela própria, sem a barra do site.",
  ]

  const passos = plataforma === "ios" ? passosIos : plataforma === "android" ? passosAndroid : passosOutro

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
        <button
          type="button"
          className="pwa-cta"
          onClick={() => void instalar()}
          disabled={instalando}
        >
          {instalando ? "…" : podeBaixar ? "Instalar" : "Como instalar"}
        </button>
        <button type="button" className="pwa-fechar" onClick={fechar} aria-label="Fechar">
          ×
        </button>
        {guia ? (
          <ol className="pwa-passos">
            {passos.map((passo) => (
              <li key={passo}>{passo}</li>
            ))}
          </ol>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
