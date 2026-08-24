import { Navigate } from "react-router-dom"

/** Checkout agora abre como modal na home. */
export function Checkout() {
  return <Navigate to="/?checkout=1" replace />
}
