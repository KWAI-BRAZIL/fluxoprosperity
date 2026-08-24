import { Link } from "react-router-dom"
import { useAcesso } from "../lib/acesso-context"
import { GRIMORIO_TODAS_ABERTAS, IlustracaoArcano } from "../components/IlustracaoArcano"
import { Shell } from "../components/Shell"
import { arcanosMaiores } from "../lib/diario"

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-")
  if (!ano || !mes || !dia) return iso
  return `${dia}/${mes}/${ano}`
}

export function Grimorio() {
  const { perfil } = useAcesso()
  const vividas = new Map((perfil.cartas_vividas ?? []).map((c) => [c.id, c]))
  const total = arcanosMaiores().length
  const descobertos = arcanosMaiores().filter((carta) => vividas.has(carta.id)).length

  return (
    <Shell nav>
      <div className="screen">
        <h2>Seu grimório</h2>
        <p className="desc">
          {GRIMORIO_TODAS_ABERTAS
            ? "Prévia das 22 ilustrações — todas abertas para revisão. Depois fechamos as que você ainda não viveu."
            : `${descobertos} de ${total} arcanos descobertos${
                descobertos < total
                  ? " — cada ritual revela uma carta. Toque numa vivida para reler o que você escreveu."
                  : " — as 22 portas já se abriram. Reler o que você escreveu é parte do caminho."
              }`}
        </p>
        <Link to="/padroes" className="grimorio-atalho">
          Ver seus padrões neste mês
        </Link>

        <div className="grimorio-grid">
          {arcanosMaiores().map((carta) => {
            const vivida = vividas.get(carta.id)
            const revelada = GRIMORIO_TODAS_ABERTAS || Boolean(vivida)
            if (!revelada) {
              return (
                <div key={carta.id} className="arcano-card arcano-oculto" aria-label="Arcano ainda não revelado">
                  <span className="arcano-silhueta" aria-hidden="true">
                    ✦
                  </span>
                </div>
              )
            }
            return (
              <Link key={carta.id} to={`/grimorio/${carta.id}`} className="arcano-card arcano-vivo">
                <IlustracaoArcano id={carta.id} />
                <p className="arcano-romano">{String(carta.id).padStart(2, "0")}</p>
                <p className="arcano-nome">{carta.nome}</p>
                <p className="arcano-data">{vivida ? formatarData(vivida.em) : "prévia da arte"}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </Shell>
  )
}
