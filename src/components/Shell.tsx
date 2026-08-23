import type { ReactNode } from "react"
import { Link, NavLink } from "react-router-dom"

export function Shell({
  children,
  nav = false,
  care,
}: {
  children: ReactNode
  nav?: boolean
  care?: boolean
}) {
  const showCare = care ?? !nav

  return (
    <div className="app-root">
      <div className={`shell screen-bg${nav ? " has-nav" : ""}`}>
        {showCare ? (
          <div className="care-bar">
            <Link to="/cuidados">Precisa conversar agora? Toque aqui</Link>
          </div>
        ) : null}
        {children}
      </div>
      {nav ? <BottomNav /> : null}
    </div>
  )
}

function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      <NavLink to="/home" className={({ isActive }) => (isActive ? "active" : "")}>
        <span className="nav-ico">✦</span>
        Home
      </NavLink>
      <NavLink to="/ritual" className={({ isActive }) => (isActive ? "active" : "")}>
        <span className="nav-ico">☾</span>
        Ritual
      </NavLink>
      <NavLink to="/grimorio" className={({ isActive }) => (isActive ? "active" : "")}>
        <span className="nav-ico">✧</span>
        Grimório
      </NavLink>
      <NavLink to="/cuidados" className={({ isActive }) => (isActive ? "active" : "")}>
        <span className="nav-ico">♡</span>
        Cuidados
      </NavLink>
    </nav>
  )
}
