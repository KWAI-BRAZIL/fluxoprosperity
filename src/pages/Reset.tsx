import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { limparSessao } from "../lib/session"

export function Reset() {
  const navigate = useNavigate()
  useEffect(() => {
    limparSessao()
    navigate("/", { replace: true })
  }, [navigate])
  return null
}
