import { useEffect, useState } from "react"
import { Button } from "./Button"
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

  if (!aberto || appJaInstalado()) return null

  async function instalarAndroid() {
    if (!promptEvento) return
    setInstalando(true)
    try {
      await promptEvento.prompt()
      const escolha = await promptEvento.userChoice
      if (escolha.outcome === "accepted") setAberto(false)
    } finally {
      setInstalando(false)
    }
  }

  return (
    <div className="pwa-backdrop" role="dialog" aria-labelledby="pwa-titulo" aria-modal="true">
      <div className="pwa-card">
        <img src="/apple-touch-icon.png" alt="" className="pwa-logo" width={56} height={56} />
        <h2 id="pwa-titulo">Instale o Fluxo no celular</h2>
        <p className="desc">
          Abre mais rápido, fica na tela inicial e funciona como um app — sem loja.
        </p>

        {plataforma === "android" ? (
          <>
            {promptEvento ? (
              <Button onClick={() => void instalarAndroid()} disabled={instalando}>
                {instalando ? "Abrindo instalação…" : "Baixar e instalar agora"}
              </Button>
            ) : (
              <ol className="pwa-passos">
                <li>Toque no menu ⋮ no canto do Chrome.</li>
                <li>Escolha <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong>.</li>
                <li>Confirme. O ícone do Fluxo aparece na sua tela.</li>
              </ol>
            )}
          </>
        ) : plataforma === "ios" ? (
          <ol className="pwa-passos">
            <li>
              Toque em <strong>Compartilhar</strong>{" "}
              <span className="pwa-ios-share" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3v12M8 7l4-4 4 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              na barra do Safari (em baixo, no iPhone).
            </li>
            <li>
              Role e toque em <strong>Adicionar à Tela de Início</strong>.
            </li>
            <li>
              Toque em <strong>Adicionar</strong>. Abra pelo ícone dourado — não pelo Safari.
            </li>
          </ol>
        ) : (
          <ol className="pwa-passos">
            <li>No Chrome ou Edge, abra o menu do navegador.</li>
            <li>
              Escolha <strong>Instalar Fluxo da Prosperidade</strong> ou <strong>Adicionar à tela inicial</strong>.
            </li>
          </ol>
        )}

        <Button variant="ghost" type="button" onClick={() => setAberto(false)}>
          Continuar no navegador
        </Button>
      </div>
    </div>
  )
}
