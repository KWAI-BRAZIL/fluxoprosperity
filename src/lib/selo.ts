export type NivelSelo = "nenhum" | "bronze" | "prata" | "ouro"

export function nivelSelo(dias: number): NivelSelo {
  if (dias >= 40) return "ouro"
  if (dias >= 21) return "prata"
  if (dias >= 7) return "bronze"
  return "nenhum"
}

export function tituloSelo(nivel: NivelSelo): string {
  if (nivel === "bronze") return "Selo bronze"
  if (nivel === "prata") return "Selo prata"
  if (nivel === "ouro") return "Selo ouro"
  return "Selo do dia"
}

export function copySelo(streak: number, recorde: number): string {
  if (streak >= 40) return "40 dias. Você não faz mais o ritual, você É o ritual."
  if (streak >= 21) return "21 dias — o hábito criou raiz."
  if (streak >= 7) return "Uma semana de presença. Isso já é raro."
  if (recorde >= 40) {
    return `A sequência de agora recomeça — o ouro continua guardado. Seu recorde: ${recorde} dias.`
  }
  if (recorde >= 21) {
    return `A prata continua guardada. Seu recorde: ${recorde} dias.`
  }
  if (recorde >= 7) {
    return `O bronze continua com você. Seu recorde: ${recorde} dias.`
  }
  return "Ritual concluído. Não é prêmio — é o registro de um hábito que você cumpriu hoje."
}

export function simboloSelo(nivel: NivelSelo): string {
  if (nivel === "ouro") return "✦"
  if (nivel === "prata") return "✧"
  if (nivel === "bronze") return "•"
  return "✦"
}
