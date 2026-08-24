import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { appJaInstalado, plataformaPwa } from "../lib/pwa"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstalarApp() {
  const [aberto, setAberto] = useState(false)
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
  }

  async function instalarAndroid() {
    if (!promptEvento) return
    setInstalando(true)
    try {
      await promptEvento.prompt()
      const escolha = await promptEvento.userChoice
      if (escolha.outcome === "accepted") fechar()
    } finally {
      setInstalando(false)
    }
  }

  const dica =
    plataforma === "ios"
      ? "Safari → Compartilhar → Tela de Início"
      : plataforma === "android" && !promptEvento
        ? "Menu ⋮ → Instalar app"
        : "Atalho na tela inicial, sem loja"

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 4000,
      }}
    >
      <button
        type="button"
        aria-label="Fechar aviso de instalação"
        onClick={fechar}
        style={{
          position: "absolute",
          inset: 0,
          border: 0,
          background: "rgba(7, 5, 15, 0.35)",
          cursor: "pointer",
        }}
      />
      <div
        role="dialog"
        aria-labelledby="pwa-titulo"
        style={{
          position: "absolute",
          top: "calc(10px + env(safe-area-inset-top))",
          left: 12,
          right: 12,
          margin: "0 auto",
          maxWidth: 480,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 10px",
          background: "#1c1430",
          border: "1px solid rgba(217,164,65,0.35)",
          borderRadius: 14,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        <img
          src="/apple-touch-icon.png"
          alt=""
          width={28}
          height={28}
          style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p id="pwa-titulo" style={{ margin: 0, fontFamily: "Fraunces, serif", fontSize: 14, color: "#e2d0a0" }}>
            Instale no celular
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "#a79bc2", lineHeight: 1.3 }}>{dica}</p>
        </div>
        {plataforma === "android" && promptEvento ? (
          <button
            type="button"
            onClick={() => void instalarAndroid()}
            disabled={instalando}
            style={{
              flexShrink: 0,
              border: "1px solid #d9a441",
              background: "transparent",
              color: "#e2d0a0",
              fontSize: 12,
              padding: "6px 10px",
              borderRadius: 999,
            }}
          >
            {instalando ? "…" : "Instalar"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={fechar}
          aria-label="Fechar"
          style={{
            flexShrink: 0,
            width: 28,
            height: 28,
            border: 0,
            background: "transparent",
            color: "#a79bc2",
            fontSize: 22,
            lineHeight: 1,
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>
    </div>,
    document.body,
  )
}
