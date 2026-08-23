import { useEffect, useRef, useState, type ReactNode } from "react"
import { modoPreview } from "../lib/supabase"

export function CardInner({
  k,
  v,
  plain,
  children,
}: {
  k: string
  v?: ReactNode
  plain?: boolean
  children?: ReactNode
}) {
  return (
    <div className="card-inner">
      <p className="k">{k}</p>
      {v !== undefined ? <p className={`v${plain ? " plain" : ""}`}>{v}</p> : null}
      {children}
    </div>
  )
}

export function Tag({
  variant = "gold",
  children,
}: {
  variant?: "gold" | "good"
  children: ReactNode
}) {
  return <span className={`tag tag-${variant}`}>{children}</span>
}

export function SectionKicker({ children }: { children: ReactNode }) {
  return <p className="section-kicker">{children}</p>
}

export function SectionCard({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`section-card${className ? ` ${className}` : ""}`}>{children}</div>
}

export function DevBanner({ children }: { children: ReactNode }) {
  if (!import.meta.env.DEV) return null
  if (!modoPreview()) return null
  return <div className="dev-banner">{children}</div>
}

export function PreparandoHalo() {
  return <div className="preparando-halo" aria-hidden="true" />
}

export function Push({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="push">
      <div className="dot">{icon}</div>
      <div>
        <h4>{title}</h4>
        <p>{text}</p>
      </div>
    </div>
  )
}

export function JobCard({
  titulo,
  detalhe,
  href,
}: {
  titulo: string
  detalhe: string
  href?: string
}) {
  return (
    <div className="job-card">
      <h4>{titulo}</h4>
      <p>{detalhe}</p>
      {href ? (
        <a className="apply" href={href} target="_blank" rel="noreferrer">
          Candidatar-se →
        </a>
      ) : (
        <span className="apply">Candidatar-se →</span>
      )}
    </div>
  )
}

export function CareBox({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="care-box">
      <h4>{titulo}</h4>
      <p>{texto}</p>
    </div>
  )
}

export function NumBadge({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`num-badge ${className}`}>{children}</div>
}

export function DestinoBadge({
  numero,
  onRevelado,
}: {
  numero: number
  onRevelado?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [revelado, setRevelado] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduzir) {
      el.textContent = String(numero)
      setRevelado(true)
      onRevelado?.()
      return
    }
    const inicio = performance.now()
    let frame = 0
    function passo(agora: number) {
      const progresso = Math.min((agora - inicio) / 1400, 1)
      if (progresso < 1) {
        el.textContent = String(Math.floor(Math.random() * 9) + 1)
        frame = requestAnimationFrame(passo)
      } else {
        el.textContent = String(numero)
        setRevelado(true)
        onRevelado?.()
      }
    }
    frame = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(frame)
  }, [numero, onRevelado])

  return (
    <div
      ref={ref}
      className={`num-badge${revelado ? " numero-revelado" : ""}`}
      aria-label={revelado ? `Número de destino ${numero}` : "Calculando número de destino"}
    >
      ·
    </div>
  )
}
