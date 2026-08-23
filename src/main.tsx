import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import "./index.css"
import { zerarAcessoLocalSePreciso } from "./lib/session"

zerarAcessoLocalSePreciso()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
