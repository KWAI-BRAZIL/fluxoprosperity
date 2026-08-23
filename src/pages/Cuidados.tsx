import { useEffect, useState } from "react"
import { ButtonLink } from "../components/Button"
import { Shell } from "../components/Shell"
import { CareBox } from "../components/Ui"
import { verificarAcesso } from "../lib/acesso"
import { getEmailSessao } from "../lib/session"
import { modoPreview, supabaseConfigurado } from "../lib/supabase"

const CVV_TEL = "tel:188"
const CVV_SITE = "https://cvv.org.br/"
const JA_SITE = "https://www.jogadoresanonimos.com.br/"

export function Cuidados() {
  const [nav, setNav] = useState(() => modoPreview())

  useEffect(() => {
    if (modoPreview()) return
    const email = getEmailSessao()
    if (!email || !supabaseConfigurado()) return
    void verificarAcesso(email)
      .then(setNav)
      .catch(() => setNav(false))
  }, [])

  return (
    <Shell nav={nav} care={false}>
      <div className="screen">
        <h2>Cuidando de mim</h2>
        <p className="desc">Espaço para quem quer reconstruir a relação com dinheiro e impulso.</p>
        <CareBox
          titulo="Antes de gastar por impulso"
          texto="Espere 10 minutos e beba um copo de água antes de decidir."
        />
        <CareBox
          titulo="Sinta a vontade, não aja nela"
          texto="Anote o que você está sentindo agora, sem julgamento."
        />
        <CareBox
          titulo="Você não precisa passar por isso sozinha"
          texto="Jogadores Anônimos Brasil e CVV (188) oferecem apoio gratuito e sigiloso."
        />
        <div className="stack">
          <ButtonLink variant="green" href={CVV_TEL}>
            Ligar para o CVV — 188
          </ButtonLink>
          <ButtonLink variant="ghost" href={CVV_SITE} external>
            Chat e site do CVV
          </ButtonLink>
          <ButtonLink variant="ghost" href={JA_SITE} external>
            Jogadores Anônimos Brasil
          </ButtonLink>
          {!nav ? (
            <ButtonLink variant="ghost" to="/">
              Voltar
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </Shell>
  )
}
