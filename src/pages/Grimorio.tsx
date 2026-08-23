import { Link } from "react-router-dom"
import { useAcesso } from "../lib/acesso-context"
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
          {descobertos} de {total} arcanos descobertos
          {descobertos < total
            ? " — cada ritual revela uma carta. Toque numa vivida para reler o que você escreveu."
            : " — as 22 portas já se abriram. Reler o que você escreveu é parte do caminho."}
        </p>
        <Link to="/padroes" className="grimorio-atalho">
          Ver seus padrões neste mês
        </Link>

        <div className="grimorio-grid">
          {arcanosMaiores().map((carta) => {
            const vivida = vividas.get(carta.id)
            if (!vivida) {
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
                <p className="arcano-nome">{carta.nome}</p>
                <p className="arcano-data">{formatarData(vivida.em)}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </Shell>
  )
}
