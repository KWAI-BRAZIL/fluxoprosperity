export function ProgressDots({ atual, total = 4 }: { atual: number; total?: number }) {
  const pontos = Array.from({ length: total }, (_, i) => (i < atual ? "●" : "○")).join("")
  return (
    <p className="progress-dots" aria-label={`Passo ${atual} de ${total}`}>
      <span className="dots">{pontos}</span>
      <span>
        {atual} de {total}
      </span>
    </p>
  )
}

export function WeekBar({ dias }: { dias: boolean[] }) {
  const feitos = dias.filter(Boolean).length
  return (
    <div className="week-bar">
      <div className="week-bar-top">
        <span>Progresso da semana</span>
        <span>
          {feitos}/{dias.length} dias
        </span>
      </div>
      <div className="week-dots" aria-hidden="true">
        {dias.map((feito, i) => (
          <span key={i} className={`week-dot${feito ? " on" : ""}`} />
        ))}
      </div>
    </div>
  )
}
