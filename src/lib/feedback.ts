export function delayConfirmacaoMs(): number {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return 0
  }
  return 450
}

export function esperarConfirmacao(): Promise<void> {
  const ms = delayConfirmacaoMs()
  if (ms <= 0) return Promise.resolve()
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
