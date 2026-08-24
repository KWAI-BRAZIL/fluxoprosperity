import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ButtonLink } from "../components/Button"
import { IlustracaoArcano } from "../components/IlustracaoArcano"
import { Shell } from "../components/Shell"
import { useAcesso } from "../lib/acesso-context"
import { listarEntradasRitual, type EntradaRitual } from "../lib/acesso"
import { arcanosMaiores } from "../lib/diario"

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-")
  if (!ano || !mes || !dia) return iso
  return `${dia}/${mes}/${ano}`
}

export function Verbete() {
  const { cartaId } = useParams()
  const { email, perfil } = useAcesso()
  const id = Number(cartaId)
  const carta = useMemo(() => arcanosMaiores().find((c) => c.id === id), [id])
  const [entradas, setEntradas] = useState<EntradaRitual[]>([])

  useEffect(() => {
    void listarEntradasRitual(email).then((lista) => {
      setEntradas(lista.filter((e) => e.carta_id === id).sort((a, b) => a.dia.localeCompare(b.dia)))
    })
  }, [email, id])

  if (!carta) {
    return (
      <Shell nav>
        <div className="screen">
          <p className="desc">Carta não encontrada.</p>
          <ButtonLink variant="ghost" to="/grimorio">
            Voltar ao grimório
          </ButtonLink>
        </div>
      </Shell>
    )
  }

  const vivida = (perfil.cartas_vividas ?? []).find((c) => c.id === carta.id)
  const anterior = entradas.length >= 2 ? entradas[entradas.length - 2] : null
  const atual = entradas[entradas.length - 1]

  return (
    <Shell nav>
      <div className="screen">
        <Link to="/grimorio" className="grimorio-atalho">
          ← Grimório
        </Link>
        <div className="verbete-carta">
          <IlustracaoArcano id={carta.id} />
        </div>
        <h2>{carta.nome}</h2>
        <p className="desc">
          {vivida ? `Vivida em ${formatarData(vivida.em)}` : "Você ainda não viveu esta carta."}
          {entradas.length > 1 ? ` · voltou ${entradas.length} vezes` : ""}
        </p>
        <p className="desc">{carta.leitura}</p>

        {entradas.length === 0 ? (
          <p className="desc">Quando você fizer o ritual desta carta, as suas respostas ficam guardadas aqui.</p>
        ) : (
          entradas.map((entrada) => (
            <article key={entrada.dia} className="verbete">
              <p className="section-kicker">{formatarData(entrada.dia)}</p>
              {entrada.perguntas.map((pergunta, i) => (
                <div key={`${entrada.dia}-${i}`} className="verbete-bloco">
                  <p className="k">{pergunta}</p>
                  <p className="v plain">“{entrada.respostas[i] || "—"}”</p>
                </div>
              ))}
              {entrada.conselho ? (
                <div className="verbete-bloco">
                  <p className="k">Conselho que você recebeu</p>
                  <p className="v plain">{entrada.conselho}</p>
                </div>
              ) : null}
            </article>
          ))
        )}

        {anterior && atual ? (
          <div className="verbete verbete-eco">
            <p className="k">Quando esta carta voltou</p>
            <p className="v plain">
              Da última vez você escreveu “{(anterior.respostas[0] ?? "").slice(0, 120)}”. Hoje: “
              {(atual.respostas[0] ?? "").slice(0, 120)}”. Isso já não é mais a mesma pergunta — ou é?
            </p>
          </div>
        ) : null}

        <ButtonLink variant="gold" to="/ritual" className="cta-principal">
          Fazer o ritual de hoje
        </ButtonLink>
      </div>
    </Shell>
  )
}
