import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { BrandMark } from "../components/Brand"
import { IlustracaoArcano } from "../components/IlustracaoArcano"
import { Button, ButtonLink } from "../components/Button"
import { WeekBar } from "../components/Progress"
import { useAcesso } from "../lib/acesso-context"
import { Shell } from "../components/Shell"
import { CardInner, SectionKicker, Tag } from "../components/Ui"
import { arcanosMaiores, conteudoDiario, progressoSemana } from "../lib/diario"
import { anoPessoal, primeiroNome, significadoDestino } from "../lib/numerologia"
import { nivelSelo } from "../lib/selo"
import { listarEntradasRitual } from "../lib/acesso"
import { contarTemas, entradasDoMes, ROTULO_TEMA } from "../lib/temas"

export function Home() {
  const { email, perfil } = useAcesso()
  const [cartaAberta, setCartaAberta] = useState(false)
  const [fraseTemas, setFraseTemas] = useState("")
  const diario = useMemo(
    () =>
      conteudoDiario({
        numeroDestino: perfil.numero_destino ?? 1,
        nome: perfil.nome,
        dataNascimento: perfil.data_nascimento,
      }),
    [perfil.numero_destino, perfil.nome, perfil.data_nascimento],
  )
  const semana = useMemo(
    () => progressoSemana(perfil.rituais_em ?? []),
    [perfil.rituais_em],
  )
  const destino = useMemo(
    () => significadoDestino(perfil.numero_destino ?? 1),
    [perfil.numero_destino],
  )
  const cicloAno = useMemo(
    () => (perfil.data_nascimento ? anoPessoal(perfil.data_nascimento) : null),
    [perfil.data_nascimento],
  )
  const nome = primeiroNome(perfil.nome ?? "")
  const streak = perfil.streak_dias ?? 0
  const recorde = Math.max(perfil.recorde_streak ?? 0, streak)
  const descobertos = (perfil.cartas_vividas ?? []).length
  const totalArcanos = arcanosMaiores().length
  const nivel = nivelSelo(recorde)

  useEffect(() => {
    void listarEntradasRitual(email).then((lista) => {
      const temas = contarTemas(entradasDoMes(lista))
      if (temas.length === 0) {
        setFraseTemas("")
        return
      }
      setFraseTemas(
        `Neste mês você refletiu ${temas
          .map((t) => `sobre ${ROTULO_TEMA[t.tema]} ${t.n}×`)
          .join(", ")
          .replace(/, ([^,]*)$/, " e $1")}.`,
      )
    })
  }, [email])

  if (cartaAberta) {
    return (
      <Shell nav>
        <div className="screen">
          <SectionKicker>Leitura de hoje</SectionKicker>
          <div className="verbete-carta">
            <IlustracaoArcano id={diario.carta.id} />
          </div>
          <h2>{diario.carta.nome}</h2>
          <p className="desc">{diario.carta.leitura}</p>
          <CardInner k="Conselho" v={diario.conselho} plain />
          <CardInner k="Atenção" v={diario.atencao} plain />
          <CardInner k="Favorece" v={diario.favorece} plain />
          <CardInner k="Número da sorte" v={diario.numeroSorte} />
          <ButtonLink variant="gold" to="/ritual" className="cta-principal">
            Fazer o ritual desta carta
          </ButtonLink>
          <Button variant="ghost" onClick={() => setCartaAberta(false)}>
            Voltar
          </Button>
        </div>
      </Shell>
    )
  }

  return (
    <Shell nav>
      <div className="screen">
        <div className="topbar">
          <div className="topbar-id">
            <BrandMark />
            <span className="hello">Olá{nome ? `, ${nome}` : ""}</span>
          </div>
          <span className={`streak streak-${nivel}`}>
            🔥 {streak} {streak === 1 ? "dia seguido" : "dias seguidos"}
            {perfil.ritual_feito_hoje ? <span className="streak-plus">+1 no seu ciclo</span> : null}
            {recorde > streak ? ` · recorde ${recorde}` : ""}
          </span>
        </div>
        <WeekBar dias={semana} />
        <Link to="/grimorio" className="grimorio-atalho">
          Grimório · {descobertos} de {totalArcanos} arcanos descobertos
        </Link>
        {fraseTemas ? (
          <Link to="/padroes" className="padroes-chip">
            {fraseTemas}
          </Link>
        ) : (
          <Link to="/padroes" className="padroes-chip">
            Seus padrões de autoconhecimento
          </Link>
        )}

        <SectionKicker>Seu código</SectionKicker>
        <CardInner k="Número de destino" v={destino.numero} />
        <CardInner k="Caminho" v={destino.movimento} plain />
        {cicloAno ? (
          <CardInner
            k={`Ano pessoal ${cicloAno.ano}`}
            v={`${cicloAno.numero} — ${cicloAno.texto}`}
            plain
          />
        ) : null}

        <SectionKicker>Leitura de hoje</SectionKicker>
        <Tag variant="good">Hoje é bom para</Tag>
        <CardInner k="Favorece" v={diario.favorece} plain />
        <CardInner k="Atenção" v={diario.atencao} plain />
        <CardInner k="Número da sorte" v={diario.numeroSorte} />
        <button
          type="button"
          className="card-inner"
          onClick={() => setCartaAberta(true)}
          style={{ cursor: "pointer", textAlign: "left" }}
        >
          <p className="k">Carta do dia · {diario.carta.nome}</p>
          <p className="v plain">{diario.carta.leitura}</p>
        </button>
        <ButtonLink variant="gold" to="/ritual" className="cta-principal">
          Fazer ritual de hoje
        </ButtonLink>
      </div>
    </Shell>
  )
}
