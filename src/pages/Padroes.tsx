import { useEffect, useMemo, useState } from "react"
import { Button } from "../components/Button"
import { Shell } from "../components/Shell"
import { CardInner, SectionKicker } from "../components/Ui"
import { useAcesso } from "../lib/acesso-context"
import { listarEntradasRitual } from "../lib/acesso"
import { hojeISO } from "../lib/diario"
import { primeiroNome } from "../lib/numerologia"
import { pedirSintese } from "../lib/pedir-sintese"
import {
  chaveMes,
  chaveSemana,
  contarTemas,
  entradasDaSemana,
  entradasDoMes,
  ROTULO_TEMA,
  type EntradaRitual,
} from "../lib/temas"

export function Padroes() {
  const { email, perfil } = useAcesso()
  const nome = primeiroNome(perfil.nome ?? "") || "você"
  const [entradas, setEntradas] = useState<EntradaRitual[]>([])
  const [semana, setSemana] = useState("")
  const [mes, setMes] = useState("")
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    void listarEntradasRitual(email).then(setEntradas)
  }, [email])

  const hoje = hojeISO()
  const doMes = useMemo(() => entradasDoMes(entradas), [entradas])
  const daSemana = useMemo(() => entradasDaSemana(entradas, hoje), [entradas, hoje])
  const temas = useMemo(() => contarTemas(doMes), [doMes])
  const fraseTemas =
    temas.length === 0
      ? "Este mês ainda não tem rituais suficientes para um mapa de temas."
      : `Neste mês você refletiu ${temas
          .map((t) => `sobre ${ROTULO_TEMA[t.tema]} ${t.n}×`)
          .join(", ")
          .replace(/, ([^,]*)$/, " e $1")}.`

  async function gerar(tipo: "semana" | "mes") {
    setCarregando(true)
    try {
      const lista = tipo === "semana" ? daSemana : doMes
      const texto = await pedirSintese({
        email,
        nome,
        tipo,
        periodo: tipo === "semana" ? chaveSemana(hoje) : chaveMes(),
        entradas: lista,
      })
      if (tipo === "semana") setSemana(texto)
      else setMes(texto)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <Shell nav>
      <div className="screen">
        <SectionKicker>Autoconhecimento</SectionKicker>
        <h2>Seus padrões</h2>
        <p className="desc">{fraseTemas}</p>

        <SectionKicker>Síntese da semana</SectionKicker>
        {semana ? (
          <p className="desc">{semana}</p>
        ) : (
          <p className="desc">
            Depois de pelo menos 3 rituais na semana, o Gemini lê o que você escreveu e devolve um padrão — com as
            suas palavras.
          </p>
        )}
        <Button variant="ghost" disabled={carregando || daSemana.length < 3} onClick={() => void gerar("semana")}>
          {carregando ? "Lendo seus rituais…" : "Gerar síntese da semana"}
        </Button>

        <SectionKicker>O mês inteiro</SectionKicker>
        {temas.map((t) => (
          <CardInner key={t.tema} k={ROTULO_TEMA[t.tema]} v={`${t.n} ${t.n === 1 ? "ritual" : "rituais"}`} />
        ))}
        {mes ? <p className="desc">{mes}</p> : null}
        <Button variant="ghost" disabled={carregando || doMes.length < 8} onClick={() => void gerar("mes")}>
          {doMes.length < 8 ? "A síntese do mês abre com 8 rituais" : "Gerar síntese do mês"}
        </Button>

        <p className="desc">O que mudou em você desde o dia 1?</p>
      </div>
    </Shell>
  )
}
