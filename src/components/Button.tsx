import type { ButtonHTMLAttributes, ReactNode } from "react"
import { Link } from "react-router-dom"

type Variant = "gold" | "ghost" | "green"

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
}

export function Button({ variant = "gold", className = "", children, ...props }: Props) {
  return (
    <button className={`btn btn-${variant} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function ButtonLink({
  variant = "gold",
  className = "",
  to,
  href,
  children,
  external,
}: {
  variant?: Variant
  className?: string
  to?: string
  href?: string
  children: ReactNode
  external?: boolean
}) {
  const cls = `btn btn-${variant} ${className}`
  if (href) {
    return (
      <a
        className={cls}
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {children}
      </a>
    )
  }
  if (to) {
    return (
      <Link className={cls} to={to}>
        {children}
      </Link>
    )
  }
  return null
}
