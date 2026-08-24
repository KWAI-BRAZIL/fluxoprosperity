import type { ReactNode } from "react"

/** Ilustrações dos 22 arcanos — traço ouro sobre noite, mesmo vocabulário do app. */

type Props = {
  id: number
  className?: string
}

function Moldura({ id, children }: { id: number; children: ReactNode }) {
  const g = `ceu-${id}`
  const ouro = `ouro-${id}`
  return (
    <svg viewBox="0 0 120 160" className="arcano-ilustra" role="img" aria-hidden="true">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a2d72" />
          <stop offset="55%" stopColor="#241536" />
          <stop offset="100%" stopColor="#120c1c" />
        </linearGradient>
        <linearGradient id={ouro} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e2d0a0" />
          <stop offset="100%" stopColor="#d9a441" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="117" height="157" rx="10" fill={`url(#${g})`} stroke={`url(#${ouro})`} strokeWidth="1.6" />
      <rect x="6" y="6" width="108" height="148" rx="6" fill="none" stroke="rgba(217,164,65,0.28)" strokeWidth="0.7" />
      {children}
    </svg>
  )
}

function Cena({ id }: { id: number }) {
  const s = "#e2d0a0"
  const g = "#d9a441"
  switch (id) {
    case 0:
      return (
        <g fill="none" stroke={g} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="88" cy="28" r="10" fill="rgba(217,164,65,0.18)" />
          <path d="M12 128 L48 92 L72 108 L108 78" />
          <path d="M48 92 L58 128" />
          <circle cx="62" cy="58" r="7" />
          <path d="M62 65 L62 92 M52 74 L72 78" />
          <path d="M72 50 L86 38" />
          <circle cx="38" cy="118" r="5" />
          <path d="M18 42 l3 8 8 2-7 5 2 8-6-5-7 4 3-8-6-6 8 1z" fill={s} stroke="none" />
        </g>
      )
    case 1:
      return (
        <g fill="none" stroke={g} strokeWidth="1.4" strokeLinecap="round">
          <path d="M40 128 h40 v-28 h-40z" />
          <circle cx="60" cy="48" r="9" />
          <path d="M60 57 v18 M48 68 h24" />
          <path d="M44 42 a16 10 0 0 1 32 0" />
          <circle cx="48" cy="114" r="4" />
          <circle cx="72" cy="114" r="4" />
          <path d="M28 36 L36 28 M92 36 L84 28" />
          <path d="M60 22 v8" />
        </g>
      )
    case 2:
      return (
        <g fill="none" stroke={g} strokeWidth="1.4" strokeLinecap="round">
          <path d="M28 132 V42" />
          <path d="M92 132 V42" />
          <path d="M28 48 H92" />
          <circle cx="60" cy="72" r="11" fill="rgba(217,164,65,0.12)" />
          <path d="M52 72 h16 M60 64 v16" />
          <path d="M40 88 q20 18 40 0" />
          <circle cx="60" cy="28" r="6" />
        </g>
      )
    case 3:
      return (
        <g fill="none" stroke={g} strokeWidth="1.4" strokeLinecap="round">
          <circle cx="60" cy="50" r="10" />
          <path d="M60 60 v22 M46 74 h28" />
          <path d="M38 98 q22-16 44 0 v30 H38z" fill="rgba(217,164,65,0.1)" />
          <path d="M24 132 q18-28 18-48 M96 132 q-18-28-18-48" />
          <path d="M48 28 l6 10 12 0-8 8 4 12-10-6-10 6 4-12-8-8 12 0z" fill={s} stroke="none" />
        </g>
      )
    case 4:
      return (
        <g fill="none" stroke={g} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M28 132 h64 v-18 H28z" />
          <path d="M40 114 v-36 h40 v36" />
          <circle cx="60" cy="52" r="9" />
          <path d="M48 40 h24 l-6-10 h-12z" />
          <path d="M18 88 L40 70 M102 88 L80 70" />
        </g>
      )
    case 5:
      return (
        <g fill="none" stroke={g} strokeWidth="1.4" strokeLinecap="round">
          <path d="M32 132 V50 h56 v82" />
          <path d="M32 58 h56" />
          <circle cx="60" cy="78" r="10" />
          <path d="M48 102 h24 M60 92 v28" />
          <path d="M44 44 L60 28 L76 44" />
          <circle cx="48" cy="122" r="5" />
          <circle cx="72" cy="122" r="5" />
        </g>
      )
    case 6:
      return (
        <g fill="none" stroke={g} strokeWidth="1.4" strokeLinecap="round">
          <circle cx="60" cy="26" r="8" fill="rgba(217,164,65,0.2)" />
          <circle cx="40" cy="78" r="8" />
          <circle cx="80" cy="78" r="8" />
          <path d="M40 86 v30 M80 86 v30" />
          <path d="M32 100 h16 M72 100 h16" />
          <path d="M48 70 Q60 58 72 70" />
          <path d="M24 132 h72" />
        </g>
      )
    case 7:
      return (
        <g fill="none" stroke={g} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M28 118 h64 v14 H28z" />
          <path d="M36 118 V88 h48 v30" />
          <circle cx="60" cy="68" r="8" />
          <path d="M48 118 L36 138 M72 118 L84 138" />
          <path d="M44 48 h32 l-16-16z" />
          <circle cx="36" cy="128" r="6" />
          <circle cx="84" cy="128" r="6" />
        </g>
      )
    case 8:
      return (
        <g fill="none" stroke={g} strokeWidth="1.4" strokeLinecap="round">
          <circle cx="48" cy="48" r="9" />
          <path d="M48 57 v28 M38 70 h20" />
          <ellipse cx="78" cy="96" rx="18" ry="12" />
          <circle cx="90" cy="90" r="6" />
          <path d="M64 88 Q54 78 50 68" />
          <path d="M28 128 h64" />
        </g>
      )
    case 9:
      return (
        <g fill="none" stroke={g} strokeWidth="1.4" strokeLinecap="round">
          <path d="M18 132 L48 78 L72 102 L108 58" />
          <circle cx="70" cy="52" r="8" />
          <path d="M70 60 v28 M60 74 h16" />
          <path d="M78 48 L92 36" />
          <circle cx="96" cy="32" r="7" fill="rgba(217,164,65,0.22)" />
          <path d="M96 28 v8 M92 32 h8" stroke={s} />
        </g>
      )
    case 10:
      return (
        <g fill="none" stroke={g} strokeWidth="1.4" strokeLinecap="round">
          <circle cx="60" cy="80" r="32" />
          <circle cx="60" cy="80" r="18" />
          <path d="M60 48 v64 M28 80 h64" />
          <path d="M38 58 L82 102 M82 58 L38 102" />
          <circle cx="60" cy="80" r="4" fill={g} stroke="none" />
        </g>
      )
    case 11:
      return (
        <g fill="none" stroke={g} strokeWidth="1.4" strokeLinecap="round">
          <path d="M60 28 v36" />
          <path d="M36 64 h48" />
          <path d="M36 64 v28 M84 64 v20" />
          <circle cx="36" cy="98" r="8" />
          <circle cx="84" cy="90" r="8" />
          <path d="M60 64 L60 132" />
          <path d="M52 120 h16" />
          <circle cx="60" cy="42" r="7" />
        </g>
      )
    case 12:
      return (
        <g fill="none" stroke={g} strokeWidth="1.4" strokeLinecap="round">
          <path d="M28 28 h64" />
          <path d="M60 28 v22" />
          <circle cx="60" cy="92" r="8" />
          <path d="M60 84 v-26" />
          <path d="M48 70 h24" />
          <path d="M50 100 L42 122 M70 100 L78 122" />
        </g>
      )
    case 13:
      return (
        <g fill="none" stroke={g} strokeWidth="1.4" strokeLinecap="round">
          <path d="M28 128 h64" />
          <path d="M70 128 L70 48" />
          <path d="M70 52 L42 78 L48 84 L70 62" fill="rgba(217,164,65,0.12)" />
          <circle cx="48" cy="108" r="5" />
          <path d="M22 48 q38-22 76 0" />
          <path d="M86 92 l5 9 10 1-8 6 3 10-10-5-9 6 2-10-7-7 10 1z" fill={s} stroke="none" />
        </g>
      )
    case 14:
      return (
        <g fill="none" stroke={g} strokeWidth="1.4" strokeLinecap="round">
          <circle cx="60" cy="46" r="9" />
          <path d="M60 55 v22 M48 70 h24" />
          <path d="M38 92 q0-12 12-12 h4 v28 h-8 q-8 0-8-8z" />
          <path d="M82 92 q0-12-12-12 h-4 v28 h8 q8 0 8-8z" />
          <path d="M54 108 Q60 122 66 108" />
          <path d="M24 132 h72" />
        </g>
      )
    case 15:
      return (
        <g fill="none" stroke={g} strokeWidth="1.4" strokeLinecap="round">
          <path d="M36 132 V70 h48 v62" />
          <circle cx="60" cy="52" r="12" />
          <path d="M48 46 l6-10 12 0" />
          <path d="M48 44 l12-8 12 8" />
          <path d="M44 92 h32" />
          <circle cx="48" cy="118" r="6" />
          <circle cx="72" cy="118" r="6" />
          <path d="M48 124 L60 108 L72 124" />
        </g>
      )
    case 16:
      return (
        <g fill="none" stroke={g} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M40 128 L48 58 h24 L80 128z" />
          <path d="M48 78 h24 M52 98 h16" />
          <path d="M28 36 L60 58 L52 28" />
          <path d="M88 42 L70 62" />
          <circle cx="28" cy="34" r="4" fill={g} stroke="none" />
        </g>
      )
    case 17:
      return (
        <g fill="none" stroke={g} strokeWidth="1.4" strokeLinecap="round">
          <path d="M60 22 l4 12 12 2-10 8 3 12-9-6-9 6 3-12-10-8 12-2z" fill={s} stroke="none" />
          <circle cx="60" cy="68" r="8" />
          <path d="M60 76 v18 M50 88 h20" />
          <path d="M44 108 q8 10 16 0 M60 108 q8 10 16 0" />
          <path d="M22 128 q38 10 76 0" />
        </g>
      )
    case 18:
      return (
        <g fill="none" stroke={g} strokeWidth="1.4" strokeLinecap="round">
          <path d="M78 28 a16 16 0 1 1-18 18" fill="rgba(217,164,65,0.15)" />
          <path d="M32 70 v50 M88 70 v50" />
          <path d="M40 118 Q60 92 80 118" />
          <ellipse cx="60" cy="128" rx="10" ry="6" />
          <circle cx="52" cy="48" r="2" fill={s} stroke="none" />
          <circle cx="90" cy="56" r="1.5" fill={s} stroke="none" />
        </g>
      )
    case 19:
      return (
        <g fill="none" stroke={g} strokeWidth="1.4" strokeLinecap="round">
          <circle cx="60" cy="58" r="18" fill="rgba(217,164,65,0.2)" />
          <path d="M60 28 v8 M60 80 v8 M32 58 h8 M80 58 h8 M40 38 l6 6 M74 38 l-6 6 M40 78 l6-6 M74 78 l-6-6" />
          <circle cx="54" cy="54" r="1.5" fill={s} stroke="none" />
          <circle cx="66" cy="54" r="1.5" fill={s} stroke="none" />
          <path d="M52 66 q8 8 16 0" />
          <path d="M24 128 h72" />
        </g>
      )
    case 20:
      return (
        <g fill="none" stroke={g} strokeWidth="1.4" strokeLinecap="round">
          <circle cx="60" cy="32" r="8" />
          <path d="M60 40 v10" />
          <path d="M48 50 h24 l-8 14 h-8z" fill="rgba(217,164,65,0.15)" />
          <circle cx="38" cy="108" r="7" />
          <circle cx="60" cy="100" r="7" />
          <circle cx="82" cy="108" r="7" />
          <path d="M38 115 v17 M60 107 v25 M82 115 v17" />
          <path d="M24 132 h72" />
        </g>
      )
    case 21:
      return (
        <g fill="none" stroke={g} strokeWidth="1.4" strokeLinecap="round">
          <ellipse cx="60" cy="80" rx="28" ry="36" />
          <circle cx="60" cy="78" r="8" />
          <path d="M60 86 v22 M48 98 h24" />
          <path d="M44 48 l8-10 16 0 8 10" />
          <circle cx="32" cy="44" r="4" />
          <circle cx="88" cy="44" r="4" />
          <circle cx="32" cy="116" r="4" />
          <circle cx="88" cy="116" r="4" />
        </g>
      )
    default:
      return (
        <g fill="none" stroke={g} strokeWidth="1.4">
          <circle cx="60" cy="80" r="22" />
        </g>
      )
  }
}

export function IlustracaoArcano({ id, className }: Props) {
  return (
    <div className={className ?? "arcano-ilustra-wrap"}>
      <Moldura id={id}>
        <Cena id={id} />
      </Moldura>
    </div>
  )
}

/** Grimório aberto para revisão das artes. Desligar depois de fechar as cartas. */
export const GRIMORIO_TODAS_ABERTAS = true
