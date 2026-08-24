export type PlataformaPwa = "ios" | "android" | "outro"

export function appJaInstalado(): boolean {
  if (typeof window === "undefined") return false
  const standalone = window.matchMedia("(display-mode: standalone)").matches
  const iosStandalone = "standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  return standalone || iosStandalone
}

export function plataformaPwa(): PlataformaPwa {
  const ua = navigator.userAgent || ""
  const iphone = /iPhone|iPad|iPod/i.test(ua)
  const ipadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1
  if (iphone || ipadOs) return "ios"
  if (/Android/i.test(ua)) return "android"
  return "outro"
}
