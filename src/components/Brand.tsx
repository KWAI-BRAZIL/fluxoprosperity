type BrandSize = "avatar"

export function BrandMark({ size = "avatar" }: { size?: BrandSize }) {
  return (
    <div className={`brand-mark brand-${size}`}>
      <img
        className="brand-logo"
        src="/logo-fluxo.png"
        alt="Fluxo da Prosperidade"
        width={1024}
        height={1024}
      />
    </div>
  )
}
