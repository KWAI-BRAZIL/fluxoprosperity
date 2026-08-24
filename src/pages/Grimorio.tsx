import { Link } from "react-router-dom"
import { IlustracaoArcano } from "../components/IlustracaoArcano"
import { Shell } from "../components/Shell"
import { useAcesso } from "../lib/acesso-context"
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

  return (
    <Shell nav>
      <div className="screen">
        <h2>Seu grimório</h2>
        <p className="desc">
          As {total} ilustrações estão reveladas para você conferir a arte.
        </p>
        <Link to="/padroes" className="grimorio-atalho">
          Ver seus padrões neste mês
        </Link>

        <div className="grimorio-grid">
          {arcanosMaiores().map((carta) => {
            const vivida = vividas.get(carta.id)
            return (
              <Link key={carta.id} to={`/grimorio/${carta.id}`} className="arcano-card arcano-vivo">
                <IlustracaoArcano id={carta.id} />
                <p className="arcano-romano">{String(carta.id).padStart(2, "0")}</p>
                <p className="arcano-nome">{carta.nome}</p>
                <p className="arcano-data">{vivida ? formatarData(vivida.em) : "revelada"}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </Shell>
  )
}
