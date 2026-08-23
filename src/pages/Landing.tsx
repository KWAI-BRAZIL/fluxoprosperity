import { BrandMark } from "../components/Brand"
import { ButtonLink } from "../components/Button"
import { Shell } from "../components/Shell"
import { SectionCard, SectionKicker } from "../components/Ui"
const FEATURES = [
  { icon: "✦", title: "Número de destino, mapa do nome e ano pessoal" },
  { icon: "☾", title: "Leitura do dia com carta, conselho e atenção" },
  { icon: "🔥", title: "Ritual guiado e grimório da sua sequência" },
] as const

export function Landing() {
  const cta = (
    <ButtonLink variant="gold" to="/checkout" className="cta-principal">
      Desbloquear meu acesso — R$9,97/mês
    </ButtonLink>
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
            <p className="price-ref">Assinatura mensal, cancelável quando quiser</p>
            <div className="price-row">
              <span className="price-old">R$150</span>
              <span className="price">R$9,97<span className="price-period">/mês</span></span>
            </div>
            <p className="price-note">Leitura, ritual e grimório inclusos. Cancele quando quiser, sem burocracia.</p>
          </SectionCard>
        </div>

        <div className="landing-cta">
          {cta}
          <p className="cta-trust">Pix na primeira cobrança. Cancele quando quiser, sem burocracia.</p>
        </div>

        <ButtonLink variant="ghost" to="/entrar" className="cta-secondary">
          Já cadastrei senha — entrar
        </ButtonLink>
      </div>
    </Shell>
  )
}
