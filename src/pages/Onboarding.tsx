import { useCallback, useEffect, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/Button"
import { ProgressDots } from "../components/Progress"
import { useAcesso } from "../lib/acesso-context"
import { Shell } from "../components/Shell"
import { CardInner, DestinoBadge, PreparandoHalo, Tag } from "../components/Ui"
import { salvarOnboarding } from "../lib/acesso"
import { esperarConfirmacao } from "../lib/feedback"
import { pedirLeituraAbertura } from "../lib/pedir-leitura"
import {
  anoPessoal,
  idadeValida,
  mascararDataBR,
  mapaDoNome,
  numeroDestino,
  paraISOLocal,
  parseDataBR,
  primeiroNome,
  significadoDestino,
  significadoDoNome,
} from "../lib/numerologia"

type Passo = "nome" | "data" | "nomeSignificado" | "destino"

const INDICE: Record<Passo, number> = {
  nome: 1,
  data: 2,
  nomeSignificado: 3,
  destino: 4,
}

export function Onboarding() {
  const { email, setPerfil } = useAcesso()
  const navigate = useNavigate()
  const [passo, setPasso] = useState<Passo>("nome")
  const [nome, setNome] = useState("")
  const [dataBr, setDataBr] = useState("")
  const [erro, setErro] = useState("")
  const [salvando, setSalvando] = useState(false)
  const [numeroRevelado, setNumeroRevelado] = useState(false)
  const [leituraMapa, setLeituraMapa] = useState("")
  const [confirmando, setConfirmando] = useState("")
  const marcarRevelado = useCallback(() => setNumeroRevelado(true), [])

  const nomeOk = nome.trim().split(/\s+/).length >= 2
  const data = parseDataBR(dataBr)
  const vibra = nomeOk ? significadoDoNome(nome) : null
  const destinoNum = data ? numeroDestino(data) : null
  const destinoTxt = destinoNum !== null ? significadoDestino(destinoNum) : null
  const vazio = passo === "nome" || passo === "data"

  useEffect(() => {
    setConfirmando("")
  }, [passo])

  useEffect(() => {
    if (!numeroRevelado || destinoNum === null || !nomeOk) return
    const mapa = mapaDoNome(nome)
    void pedirLeituraAbertura({
      email,
      nome: nome.trim(),
      destino: destinoNum,
      expressao: mapa.expressao,
      motivacao: mapa.motivacao,
      personalidade: mapa.personalidade,
    }).then((texto) => {
      if (texto) setLeituraMapa(texto)
    })
  }, [numeroRevelado, destinoNum, nome, nomeOk, email])

  async function comGosto(frase: string, depois: () => void) {
    if (confirmando) return
    setConfirmando(frase)
    await esperarConfirmacao()
    depois()
  }

  function seguirNome(e: FormEvent) {
    e.preventDefault()
    if (!nomeOk) {
      setErro("Digite seu nome completo.")
      return
    }
    setErro("")
    void comGosto("Vibração captada.", () => setPasso("data"))
  }

  function seguirData(e: FormEvent) {
    e.preventDefault()
    if (!data) {
      setErro("Use o formato dd/mm/aaaa com uma data válida.")
      return
    }
    if (!idadeValida(data)) {
      setErro("Confira a data de nascimento.")
      return
    }
    setErro("")
    void comGosto("✓", () => setPasso("nomeSignificado"))
  }

  async function concluir() {
    if (!data || confirmando) return
    setConfirmando("✓")
    await esperarConfirmacao()
    setSalvando(true)
    setErro("")
    try {
      const perfil = await salvarOnboarding({
        email,
        nome: nome.trim(),
        dataNascimento: paraISOLocal(data),
      })
      setPerfil(perfil)
      navigate("/home", { replace: true })
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar. Tente de novo.")
      setSalvando(false)
      setConfirmando("")
    }
  }

  const classeBotao = `cta-principal${confirmando ? " btn-sucesso" : ""}`

  return (
    <Shell>
      <div className={`screen${passo === "destino" ? " center" : ""}${vazio ? " has-halo" : ""}`}>
        {vazio ? <PreparandoHalo /> : null}
        <ProgressDots atual={INDICE[passo]} />

        {passo === "nome" ? (
          <form onSubmit={seguirNome} className="screen">
            <h2>Qual seu nome completo?</h2>
            <p className="desc">
              Cada letra do seu nome carrega uma vibração numérica. Vamos calcular a sua.
            </p>
            <input
              className="field"
              type="text"
              autoComplete="name"
              placeholder="Nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={Boolean(confirmando)}
            />
            {erro ? <p className="field-error">{erro}</p> : null}
            <Button type="submit" className={classeBotao} disabled={Boolean(confirmando)}>
              {confirmando || "Continuar"}
            </Button>
          </form>
        ) : null}

        {passo === "data" ? (
          <form onSubmit={seguirData} className="screen">
            <h2>E sua data de nascimento?</h2>
            <p className="desc">
              Com ela calculamos seu número de destino — o ciclo que rege sua relação com dinheiro
              agora.
            </p>
            <input
              className="field"
              type="text"
              inputMode="numeric"
              placeholder="dd/mm/aaaa"
              value={dataBr}
              onChange={(e) => setDataBr(mascararDataBR(e.target.value))}
              disabled={Boolean(confirmando)}
            />
            {erro ? <p className="field-error">{erro}</p> : null}
            <Button type="submit" className={classeBotao} disabled={Boolean(confirmando)}>
              {confirmando || "Calcular meu número"}
            </Button>
          </form>
        ) : null}

        {passo === "nomeSignificado" && vibra ? (
          <>
            <Tag>Numerologia do nome</Tag>
            <h2>
              {primeiroNome(nome)}, seu nome vibra em {vibra.numero}
            </h2>
            <p className="desc">{vibra.texto}</p>
            <CardInner k="Ponto forte" v={vibra.pontoForte} plain />
            <CardInner k="Bloqueio comum" v={vibra.bloqueio} plain />
            <CardInner k="O que o nome pede por dentro" v={mapaDoNome(nome).interior} plain />
            <CardInner k="Como o mundo te lê" v={mapaDoNome(nome).visivel} plain />
            <Button
              className={classeBotao}
              disabled={Boolean(confirmando)}
              onClick={() => {
                void comGosto("✓", () => {
                  setNumeroRevelado(false)
                  setPasso("destino")
                })
              }}
            >
              {confirmando || "Ver meu número de destino"}
            </Button>
          </>
        ) : null}

        {passo === "destino" && destinoNum !== null && destinoTxt ? (
          <>
            <DestinoBadge numero={destinoNum} onRevelado={marcarRevelado} />
            <h2>
              {numeroRevelado
                ? `Seu número de destino é ${destinoNum}`
                : "Lendo seu código…"}
            </h2>
            <p className="desc">
              {numeroRevelado ? destinoTxt.texto : "Os dígitos se acomodam no número calculado da sua data — não é sorteio."}
            </p>
            {numeroRevelado ? (
              <>
                <CardInner k="O que favorece" v={destinoTxt.favorece} plain />
                <CardInner k="Onde trava" v={destinoTxt.cuidado} plain />
                <CardInner k="Movimento agora" v={destinoTxt.movimento} plain />
                {data ? (
                  <CardInner
                    k={`Ano pessoal ${anoPessoal(paraISOLocal(data)).ano}`}
                    v={`Número ${anoPessoal(paraISOLocal(data)).numero}. ${anoPessoal(paraISOLocal(data)).texto}`}
                    plain
                  />
                ) : null}
                {leituraMapa ? (
                  <CardInner k="Leitura combinada do seu mapa" v={leituraMapa} plain />
                ) : (
                  <p className="desc">Combinando destino, expressão, motivação e personalidade numa leitura só sua…</p>
                )}
              </>
            ) : null}
            {erro ? <p className="field-error">{erro}</p> : null}
            <Button
              className={classeBotao}
              onClick={() => void concluir()}
              disabled={salvando || !numeroRevelado || Boolean(confirmando)}
            >
              {confirmando || (salvando ? "Abrindo sua jornada…" : "Começar minha jornada")}
            </Button>
          </>
        ) : null}
      </div>
    </Shell>
  )
}
