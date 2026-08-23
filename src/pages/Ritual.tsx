import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Button, ButtonLink } from "../components/Button"
import { useAcesso } from "../lib/acesso-context"
import { Shell } from "../components/Shell"
import { registrarRitual, salvarEntradaRitual } from "../lib/acesso"
import { conteudoDiario } from "../lib/diario"
import { conselhoDoRitual, ritualDaCarta } from "../lib/ritual-chat"
import { pedirEco } from "../lib/pedir-eco"
import { MAX_RESPOSTA_ECO } from "../lib/ritual-eco"
import { esperarConfirmacao } from "../lib/feedback"
import { copySelo, nivelSelo, simboloSelo, tituloSelo } from "../lib/selo"

type Bolha = {
  id: number
  quem: "guia" | "voce" | "conselho"
  texto: string
}

function delayGuiaMs(): number {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return 0
  }
  return 1100
}

function pausaConselhoMs(): number {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return 0
  }
  return 600
}

function esperar(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve()
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function IndicadorDigitando({ nome }: { nome: string }) {
  return (
    <div className="bubble guia digitando" aria-live="polite" aria-label={`${nome} está escrevendo`}>
      <p className="chat-who">{nome}</p>
      <div className="digitando-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}

export function Ritual() {
  const { email, perfil, setPerfil } = useAcesso()
  const navigate = useNavigate()
  const diario = useMemo(
    () =>
      conteudoDiario({
        numeroDestino: perfil.numero_destino ?? 1,
        nome: perfil.nome,
        dataNascimento: perfil.data_nascimento,
      }),
    [perfil.numero_destino, perfil.nome, perfil.data_nascimento],
  )
  const chat = useMemo(() => ritualDaCarta(diario.carta), [diario.carta])
  const chatRef = useRef(chat)
  chatRef.current = chat
  const [passo, setPasso] = useState(0)
  const [sequenciaNova, setSequenciaNova] = useState(false)
  const [resposta, setResposta] = useState("")
  const [respostas, setRespostas] = useState<string[]>([])
  const [bolhas, setBolhas] = useState<Bolha[]>([])
  const [digitando, setDigitando] = useState(true)
  const [mostrarInput, setMostrarInput] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selando, setSelando] = useState(false)
  const [selo, setSelo] = useState(false)
  const [erro, setErro] = useState("")
  const listaRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(1)
  const genRef = useRef(0)
  const ocupadoRef = useRef(false)
  const conselhoVisivel = bolhas.some((b) => b.quem === "conselho")

  useEffect(() => {
    listaRef.current?.scrollTo({ top: listaRef.current.scrollHeight, behavior: "smooth" })
  }, [bolhas, digitando])

  useEffect(() => {
    const gen = ++genRef.current
    ocupadoRef.current = false
    const roteiro = chatRef.current
    void (async () => {
      await falarComoGuia(roteiro.abertura, gen)
      await falarComoGuia(roteiro.perguntas[0], gen)
      if (genRef.current === gen) setMostrarInput(true)
    })()
    return () => {
      genRef.current += 1
    }
  }, [diario.carta.id])

  async function falarComoGuia(texto: string, gen = genRef.current) {
    if (genRef.current !== gen) return
    setDigitando(true)
    await esperar(delayGuiaMs())
    if (genRef.current !== gen) return
    setDigitando(false)
    setBolhas((atual) => [...atual, { id: idRef.current++, quem: "guia", texto }])
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const texto = resposta.trim()
    if (!texto || respostas.length >= 3 || ocupadoRef.current || digitando) return
    ocupadoRef.current = true
    const gen = genRef.current
    const indice = respostas.length
    const novasRespostas = [...respostas, texto]
    setBolhas((atual) => [...atual, { id: idRef.current++, quem: "voce", texto }])
    setRespostas(novasRespostas)
    setResposta("")
    setPasso(indice + 1)
    setMostrarInput(false)

    const eco = await pedirEco({
      email,
      carta: diario.carta,
      pergunta: chat.perguntas[indice],
      resposta: texto,
      perguntaIndex: indice,
    })
    if (genRef.current !== gen) return
    await falarComoGuia(eco, gen)

    if (indice < 2) {
      await falarComoGuia(chat.perguntas[indice + 1], gen)
      if (genRef.current === gen) {
        setMostrarInput(true)
        ocupadoRef.current = false
      }
      return
    }

    await esperar(pausaConselhoMs())
    if (genRef.current !== gen) return
    setBolhas((atual) => [
      ...atual,
      {
        id: idRef.current++,
        quem: "conselho",
        texto: conselhoDoRitual(diario.carta, novasRespostas, perfil.nome),
      },
    ])
    ocupadoRef.current = false
  }

  async function concluir() {
    if (saving || selando) return
    setSelando(true)
    setErro("")
    await esperarConfirmacao()
    setSaving(true)
    try {
      await salvarEntradaRitual({
        email,
        carta: diario.carta,
        perguntas: [...chat.perguntas],
        respostas,
        conselho: conselhoDoRitual(diario.carta, respostas, perfil.nome),
      })
      const atualizado = await registrarRitual(email, diario.carta)
      setSequenciaNova(!perfil.ritual_feito_hoje)
      setPerfil(atualizado)
      setSelo(true)
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível registrar o ritual.")
      setSaving(false)
      setSelando(false)
    }
  }

  if (selo) {
    const streak = perfil.streak_dias ?? 0
    const recorde = Math.max(perfil.recorde_streak ?? 0, streak)
    const nivel = nivelSelo(recorde)
    return (
      <Shell nav>
        <div className="screen center">
          <div className={`seal seal-${nivel}`}>{simboloSelo(nivel)}</div>
          <h2>{tituloSelo(nivel)}</h2>
          <p className="desc">
            {copySelo(streak, recorde)}
            {sequenciaNova ? " Sua sequência foi atualizada." : ""}
          </p>
          <p className="seal-recorde">
            Sequência atual: {streak} {streak === 1 ? "dia" : "dias"} · seu recorde: {recorde}{" "}
            {recorde === 1 ? "dia" : "dias"}
          </p>
          <ButtonLink variant="ghost" to="/grimorio">
            Ver seu grimório
          </ButtonLink>
          <Button className="mt-auto" onClick={() => navigate("/home")}>
            Voltar à home
          </Button>
        </div>
      </Shell>
    )
  }

  return (
    <Shell nav>
      <div className="screen">
        <h2>{diario.carta.nome}</h2>
        <p className="desc">
          {diario.carta.resumo} · {Math.min(passo + (conselhoVisivel ? 0 : mostrarInput ? 1 : 0), 3)} de 3
        </p>

        <div className="chat" ref={listaRef}>
          {bolhas.map((bolha) => (
            <div
              key={bolha.id}
              className={`bubble ${bolha.quem}${bolha.quem === "conselho" ? " conselho-final" : ""}`}
            >
              <p className="chat-who">
                {bolha.quem === "voce" ? "Você" : bolha.quem === "conselho" ? "Conselho do dia" : diario.carta.nome}
              </p>
              {bolha.texto.split("\n\n").map((trecho, i) => (
                <p key={`${bolha.id}-${i}`}>{trecho}</p>
              ))}
            </div>
          ))}
          {digitando ? <IndicadorDigitando nome={diario.carta.nome} /> : null}
        </div>

        {erro ? <p className="field-error">{erro}</p> : null}

        {conselhoVisivel ? (
          <Button
            className={`mt-auto cta-principal${selando || saving ? " btn-sucesso" : ""}`}
            onClick={() => void concluir()}
            disabled={saving}
          >
            {selando || saving ? "Ritual selado." : "Concluir ritual"}
          </Button>
        ) : mostrarInput ? (
          <form className="chat-form" onSubmit={(ev) => void enviar(ev)}>
            <textarea
              className="field chat-input"
              rows={3}
              maxLength={MAX_RESPOSTA_ECO}
              placeholder="Escreva sua resposta…"
              value={resposta}
              onChange={(ev) => setResposta(ev.target.value)}
            />
            <Button type="submit" disabled={resposta.trim().length < 2 || digitando}>
              Responder
            </Button>
          </form>
        ) : (
          <div className="chat-form-placeholder" aria-hidden="true" />
        )}
      </div>
    </Shell>
  )
}
