import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { registerSW } from "virtual:pwa-register"
import { App } from "./App"
import "./index.css"
import { zerarAcessoLocalSePreciso } from "./lib/session"

registerSW({ immediate: true })

zerarAcessoLocalSePreciso()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
