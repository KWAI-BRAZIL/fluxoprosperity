export type PromptInstalacao = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

let promptSalvo: PromptInstalacao | null = null
const ouvintes = new Set<(evento: PromptInstalacao | null) => void>()

function avisar() {
  for (const fn of ouvintes) fn(promptSalvo)
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault()
    promptSalvo = event as PromptInstalacao
    avisar()
  })
  window.addEventListener("appinstalled", () => {
    promptSalvo = null
    avisar()
  })
}

export function promptInstalacaoAtual(): PromptInstalacao | null {
  return promptSalvo
}

export function onPromptInstalacao(fn: (evento: PromptInstalacao | null) => void): () => void {
  ouvintes.add(fn)
  fn(promptSalvo)
  return () => {
    ouvintes.delete(fn)
  }
}

export async function pedirInstalacaoNativa(): Promise<"accepted" | "dismissed" | "unavailable"> {
  const evento = promptSalvo
  if (!evento) return "unavailable"
  await evento.prompt()
  const { outcome } = await evento.userChoice
  promptSalvo = null
  avisar()
  return outcome
}

export function esperarPrompt(ms: number): Promise<PromptInstalacao | null> {
  if (promptSalvo) return Promise.resolve(promptSalvo)
  return new Promise((resolve) => {
    const t = window.setTimeout(() => {
      off()
      resolve(promptSalvo)
    }, ms)
    const off = onPromptInstalacao((evento) => {
      if (!evento) return
      window.clearTimeout(t)
      off()
      resolve(evento)
    })
  })
}
