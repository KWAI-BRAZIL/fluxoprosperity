import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Galaxy } from "./components/Galaxy"
import { InstalarApp } from "./components/InstalarApp"
import { ProtectedApp } from "./components/ProtectedApp"
import { zerarAcessoLocalSePreciso } from "./lib/session"
import { Checkout } from "./pages/Checkout"
import { Cuidados } from "./pages/Cuidados"
import { Grimorio } from "./pages/Grimorio"
import { Home } from "./pages/Home"
import { Landing } from "./pages/Landing"
import { Login } from "./pages/Login"
import { Onboarding } from "./pages/Onboarding"
import { Padroes } from "./pages/Padroes"
import { PostCheckout } from "./pages/PostCheckout"
import { Reset } from "./pages/Reset"
import { Ritual } from "./pages/Ritual"
import { Verbete } from "./pages/Verbete"

export function App() {
  zerarAcessoLocalSePreciso()

  return (
    <BrowserRouter>
      <div className="app-bg">
        <Galaxy />
        <InstalarApp />
        <div className="app-fg">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/pos-compra" element={<PostCheckout />} />
            <Route path="/entrar" element={<Login />} />
            <Route path="/cuidados" element={<Cuidados />} />
            <Route path="/reset" element={<Reset />} />
            <Route element={<ProtectedApp />}>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/home" element={<Home />} />
              <Route path="/ritual" element={<Ritual />} />
              <Route path="/grimorio" element={<Grimorio />} />
              <Route path="/grimorio/:cartaId" element={<Verbete />} />
              <Route path="/padroes" element={<Padroes />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
