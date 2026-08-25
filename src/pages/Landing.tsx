import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { BrandMark } from "../components/Brand"
import { Button, ButtonLink } from "../components/Button"
import { CheckoutModal } from "../components/CheckoutModal"
import { Shell } from "../components/Shell"
import { SectionCard, SectionKicker } from "../components/Ui"
import { checkoutUrl } from "../lib/acesso"

const FEATURES = [
  { icon: "✦", title: "Número de destino, mapa do nome e ano pessoal" },
  { icon: "☾", title: "Leitura do dia com carta, conselho e atenção" },
  { icon: "🔥", title: "Ritual guiado e grimório da sua sequência" },
] as const

export function Landing() {
  const [params, setParams] = useSearchParams()
  const [aberto, setAberto] = useState(() => params.get("checkout") === "1")

  function abrirCheckout() {
    const url = checkoutUrl()
    if (url) {
      window.location.assign(url)
      return
    }
    setAberto(true)
    setParams({ checkout: "1" }, { replace: true })
  }

  function fecharCheckout() {
    setAberto(false)
    if (params.get("checkout") === "1") setParams({}, { replace: true })
  }

  const cta = (
    <Button type="button" variant="gold" className="cta-principal" onClick={abrirCheckout}>
      Desbloquear meu acesso
    </Button>
  )

  return (
    <Shell care>
      <div className="landing-stack">
        <div className="brand-row">
          <BrandMark />
        </div>
        <div className="teaser-numero">
          <span className="teaser-label">Seu número está esperando</span>
          <div className="teaser-badge">
            <span className="teaser-digit">?</span>
            <span className="teaser-lock" aria-hidden="true">
              🔒
            </span>
          </div>
        </div>

        <div className="landing-copy">
          <h1 className="headline">
            Seu nome e sua data de nascimento carregam um código numérico que a maioria das pessoas
            nunca decifrou.
          </h1>
          <p className="desc">
            Em 2 minutos, você descobre o seu — e o que ele revela sobre onde seu dinheiro anda
            travando.
          </p>
        </div>

        <div>
          <SectionKicker>O que você recebe</SectionKicker>
          <SectionCard className="feature-stack">
            {FEATURES.map((item) => (
              <div key={item.title} className="feature-row">
                <div className="feature-icon">{item.icon}</div>
                <p className="feature-title">{item.title}</p>
              </div>
            ))}
          </SectionCard>
        </div>

        <div>
          <SectionKicker>Investimento</SectionKicker>
          <SectionCard className="section-card-preco">
            <p className="price-ref">Acesso único, pagamento único</p>
            <div className="price-row">
              <span className="price-old">R$150</span>
              <span className="price">R$14,97</span>
            </div>
            <p className="price-note">Leitura, ritual e grimório inclusos. Um pagamento, sem mensalidade.</p>
          </SectionCard>
        </div>

        <div className="landing-cta">
          {cta}
          <p className="cta-trust">Pix único. Sem renovação automática.</p>
        </div>

        <ButtonLink variant="ghost" to="/entrar" className="cta-secondary">
          Já cadastrei senha — entrar
        </ButtonLink>
      </div>
      <CheckoutModal aberto={aberto} onFechar={fecharCheckout} />
    </Shell>
  )
}
