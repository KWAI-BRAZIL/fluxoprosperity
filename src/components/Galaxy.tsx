import { useEffect, useRef } from "react"

type Estrela = {
  x: number
  y: number
  z: number
  r: number
  a: number
  fase: number
  vel: number
  ouro: boolean
}

type No = {
  x: number
  y: number
  z: number
  r: number
  ouro: boolean
  fase: number
  vel: number
}

type Nuvem = {
  x: number
  y: number
  rx: number
  ry: number
  cor: [number, number, number]
  a: number
}

function semente(n: number) {
  return function rand() {
    n |= 0
    n = (n + 0x6d2b79f5) | 0
    let t = Math.imul(n ^ (n >>> 15), 1 | n)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function criarEstrelas(qtd: number, camada: number, rand: () => number): Estrela[] {
  const lista: Estrela[] = []
  for (let i = 0; i < qtd; i += 1) {
    lista.push({
      x: rand(),
      y: rand(),
      z: camada,
      r: 0.4 + rand() * 0.55,
      a: 0.14 + rand() * 0.26,
      fase: rand() * Math.PI * 2,
      vel: 0.35 + rand() * 1.1,
      ouro: rand() > 0.7,
    })
  }
  return lista
}

function criarNos(qtd: number, rand: () => number): No[] {
  const nos: No[] = []
  let tentativas = 0
  while (nos.length < qtd && tentativas < qtd * 50) {
    tentativas += 1
    const x = 0.05 + rand() * 0.9
    const y = 0.06 + rand() * 0.88
    if (nos.some((n) => (n.x - x) ** 2 + (n.y - y) ** 2 < 0.011)) continue
    nos.push({
      x,
      y,
      z: rand(),
      r: 1.05 + rand() * 1.35,
      ouro: rand() > 0.48,
      fase: rand() * Math.PI * 2,
      vel: 0.22 + rand() * 0.4,
    })
  }
  return nos
}

function ligarNos(nos: No[]): Array<[number, number]> {
  const ligacoes: Array<[number, number]> = []
  const visto = new Set<string>()
  for (let i = 0; i < nos.length; i += 1) {
    const distancias = nos
      .map((n, j) => ({ j, d: (n.x - nos[i].x) ** 2 + (n.y - nos[i].y) ** 2 }))
      .filter((item) => item.j !== i)
      .sort((a, b) => a.d - b.d)
    const max = 1 + (i % 2 === 0 ? 1 : 0)
    for (let c = 0; c < max && c < distancias.length; c += 1) {
      if (distancias[c].d > 0.048) break
      const j = distancias[c].j
      const chave = i < j ? `${i}-${j}` : `${j}-${i}`
      if (visto.has(chave)) continue
      visto.add(chave)
      ligacoes.push([i, j])
    }
  }
  return ligacoes
}

function distPontoSeg(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = dx * dx + dy * dy
  if (len === 0) return Math.hypot(px - x1, py - y1)
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len))
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}

const NUVENS: Nuvem[] = [
  { x: 0.28, y: 0.18, rx: 0.55, ry: 0.38, cor: [88, 48, 148], a: 0.24 },
  { x: 0.78, y: 0.42, rx: 0.5, ry: 0.42, cor: [48, 28, 98], a: 0.26 },
  { x: 0.52, y: 0.78, rx: 0.48, ry: 0.32, cor: [140, 96, 48], a: 0.12 },
]

export function Galaxy() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const rand = semente(77)
    const estrelas = criarEstrelas(28, 0, rand)
    const nos = criarNos(16, rand)
    const ligacoes = ligarNos(nos)
    const posX = new Float32Array(nos.length)
    const posY = new Float32Array(nos.length)
    const energia = new Float32Array(nos.length)

    const ponteiro = { mx: 0, my: 0, x: 0, y: 0, ativo: false }
    let largura = 0
    let altura = 0
    let dpr = 1
    let frame = 0
    const t0 = performance.now()

    function redimensionar() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      largura = window.innerWidth
      altura = window.innerHeight
      canvas.width = Math.floor(largura * dpr)
      canvas.height = Math.floor(altura * dpr)
      canvas.style.width = `${largura}px`
      canvas.style.height = `${altura}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (!ponteiro.x && !ponteiro.y) {
        ponteiro.x = largura * 0.5
        ponteiro.y = altura * 0.5
      }
    }

    function apontar(ev: PointerEvent | MouseEvent | TouchEvent) {
      if (!largura || !altura) return
      let x = 0
      let y = 0
      if ("touches" in ev && ev.touches[0]) {
        x = ev.touches[0].clientX
        y = ev.touches[0].clientY
      } else if ("clientX" in ev) {
        x = ev.clientX
        y = ev.clientY
      } else {
        return
      }
      ponteiro.x = x
      ponteiro.y = y
      ponteiro.mx = (x / largura - 0.5) * 2
      ponteiro.my = (y / altura - 0.5) * 2
      ponteiro.ativo = true
    }

    function desenhar(agora: number) {
      const t = (agora - t0) / 1000
      const mx = ponteiro.mx
      const my = ponteiro.my
      const mouseX = ponteiro.x
      const mouseY = ponteiro.y
      const alcance = Math.min(132, Math.min(largura, altura) * 0.2)

      ctx.clearRect(0, 0, largura, altura)

      for (const nuvem of NUVENS) {
        const px = (nuvem.x + mx * 0.02) * largura
        const py = (nuvem.y + my * 0.02) * altura
        const g = ctx.createRadialGradient(px, py, 0, px, py, Math.max(largura, altura) * nuvem.rx)
        g.addColorStop(0, `rgba(${nuvem.cor[0]}, ${nuvem.cor[1]}, ${nuvem.cor[2]}, ${nuvem.a * 0.42})`)
        g.addColorStop(0.45, `rgba(${nuvem.cor[0]}, ${nuvem.cor[1]}, ${nuvem.cor[2]}, ${nuvem.a * 0.14})`)
        g.addColorStop(1, "rgba(7, 5, 15, 0)")
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.ellipse(px, py, largura * nuvem.rx, altura * nuvem.ry, 0.4, 0, Math.PI * 2)
        ctx.fill()
      }

      for (const estrela of estrelas) {
        const sx = estrela.x * largura + mx * 8
        const sy = estrela.y * altura + my * 8
        const cintila = reduzido ? 0.55 : 0.62 + 0.18 * Math.sin(t * estrela.vel + estrela.fase)
        ctx.fillStyle = estrela.ouro
          ? `rgba(226, 206, 150, ${estrela.a * cintila})`
          : `rgba(170, 150, 200, ${estrela.a * cintila * 0.75})`
        ctx.beginPath()
        ctx.arc(sx, sy, estrela.r, 0, Math.PI * 2)
        ctx.fill()
      }

      for (let i = 0; i < nos.length; i += 1) {
        const no = nos[i]
        const flutuaX = reduzido ? 0 : Math.sin(t * no.vel + no.fase) * 4
        const flutuaY = reduzido ? 0 : Math.cos(t * no.vel * 0.85 + no.fase) * 3
        posX[i] = no.x * largura + mx * (18 + no.z * 42) + flutuaX
        posY[i] = no.y * altura + my * (18 + no.z * 42) + flutuaY
      }

      ctx.lineCap = "round"
      for (const [a, b] of ligacoes) {
        const x1 = posX[a]
        const y1 = posY[a]
        const x2 = posX[b]
        const y2 = posY[b]
        const perto = distPontoSeg(mouseX, mouseY, x1, y1, x2, y2)
        const acende = ponteiro.ativo ? Math.max(0, 1 - perto / (alcance * 1.15)) ** 2 : 0
        const ouro = nos[a].ouro || nos[b].ouro
        const alpha = 0.035 + acende * 0.1
        ctx.strokeStyle = ouro
          ? `rgba(217, 164, 65, ${alpha})`
          : `rgba(140, 100, 190, ${alpha * 0.7})`
        ctx.lineWidth = 0.4 + acende * 0.3
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }

      let brilhoCursor = 0
      for (let i = 0; i < nos.length; i += 1) {
        const dist = Math.hypot(posX[i] - mouseX, posY[i] - mouseY)
        const alvo = ponteiro.ativo && dist < alcance ? (1 - dist / alcance) ** 1.7 : 0
        energia[i] += (alvo - energia[i]) * (reduzido ? 1 : 0.11)
        if (energia[i] < 0.012) energia[i] = 0
        brilhoCursor = Math.max(brilhoCursor, energia[i])
      }

      const proximos = nos
        .map((_, i) => i)
        .filter((i) => energia[i] > 0)
        .sort((a, b) => energia[b] - energia[a])
        .slice(0, 3)

      ctx.lineCap = "round"
      for (const i of proximos) {
        const e = energia[i]
        ctx.strokeStyle = nos[i].ouro
          ? `rgba(220, 190, 110, ${e * 0.28})`
          : `rgba(170, 150, 200, ${e * 0.2})`
        ctx.lineWidth = 0.4 + e * 0.55
        ctx.beginPath()
        ctx.moveTo(posX[i], posY[i])
        ctx.lineTo(mouseX, mouseY)
        ctx.stroke()
      }

      if (brilhoCursor > 0.04) {
        const nucleo = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 12)
        nucleo.addColorStop(0, `rgba(255, 236, 180, ${0.16 * brilhoCursor})`)
        nucleo.addColorStop(0.5, `rgba(217, 164, 65, ${0.06 * brilhoCursor})`)
        nucleo.addColorStop(1, "rgba(217, 164, 65, 0)")
        ctx.fillStyle = nucleo
        ctx.beginPath()
        ctx.arc(mouseX, mouseY, 12, 0, Math.PI * 2)
        ctx.fill()
      }

      for (let i = 0; i < nos.length; i += 1) {
        const no = nos[i]
        const px = posX[i]
        const py = posY[i]
        const acende = energia[i]
        const raio = no.r + acende * 0.5
        const pulso = reduzido ? 1 : 0.85 + 0.15 * Math.sin(t * no.vel * 2 + no.fase)

        const halo = ctx.createRadialGradient(px, py, 0, px, py, raio * 2.4)
        if (no.ouro) {
          halo.addColorStop(0, `rgba(226, 206, 150, ${0.22 * pulso + acende * 0.18})`)
          halo.addColorStop(1, "rgba(217, 164, 65, 0)")
        } else {
          halo.addColorStop(0, `rgba(160, 140, 200, ${0.16 * pulso + acende * 0.12})`)
          halo.addColorStop(1, "rgba(110, 70, 170, 0)")
        }
        ctx.fillStyle = halo
        ctx.beginPath()
        ctx.arc(px, py, raio * 2.4, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = no.ouro
          ? `rgba(236, 218, 164, ${0.68 + acende * 0.2})`
          : `rgba(190, 172, 220, ${0.55 + acende * 0.15})`
        ctx.beginPath()
        ctx.arc(px, py, raio, 0, Math.PI * 2)
        ctx.fill()
      }

      frame = window.requestAnimationFrame(desenhar)
    }

    redimensionar()
    desenhar(performance.now())
    const opts: AddEventListenerOptions = { passive: true, capture: true }
    window.addEventListener("pointermove", apontar, opts)
    window.addEventListener("pointerdown", apontar, opts)
    window.addEventListener("mousemove", apontar, opts)
    window.addEventListener("touchmove", apontar, opts)
    window.addEventListener("resize", redimensionar)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener("pointermove", apontar, opts)
      window.removeEventListener("pointerdown", apontar, opts)
      window.removeEventListener("mousemove", apontar, opts)
      window.removeEventListener("touchmove", apontar, opts)
      window.removeEventListener("resize", redimensionar)
    }
  }, [])

  return <canvas ref={canvasRef} className="galaxy" aria-hidden="true" />
}
