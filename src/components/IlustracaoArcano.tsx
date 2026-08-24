type Props = {
  id: number
  className?: string
}

export function IlustracaoArcano({ id, className }: Props) {
  const n = Number.isFinite(id) ? Math.max(0, Math.min(21, id)) : 0
  return (
    <img
      className={className ?? "arcano-ilustra"}
      src={`/arcanos/${n}.svg`}
      alt=""
      width={300}
      height={400}
      decoding="async"
      style={{ width: "100%", height: "auto", display: "block", background: "#2a1848" }}
    />
  )
}

export const GRIMORIO_TODAS_ABERTAS = true
