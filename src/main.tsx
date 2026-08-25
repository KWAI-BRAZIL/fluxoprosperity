import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import "./index.css"
import { zerarAcessoLocalSePreciso } from "./lib/session"

zerarAcessoLocalSePreciso()

const SW_CACHE = "v6"

async function limparCacheDoApp(): Promise<void> {
  if (typeof window === "undefined") return
  try {
    if (localStorage.getItem("abundancia_sw_cache") === SW_CACHE) return
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map((reg) => reg.unregister()))
    }
    if ("caches" in window) {
      const nomes = await caches.keys()
      await Promise.all(nomes.map((nome) => caches.delete(nome)))
    }
    localStorage.setItem("abundancia_sw_cache", SW_CACHE)
  } catch {
    /* ignore */
  }
}

void limparCacheDoApp()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
