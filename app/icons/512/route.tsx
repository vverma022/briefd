import { ImageResponse } from "next/og"

export const contentType = "image/png"

// 512×512 PWA icon (also used maskable). Extra padding keeps the bars inside the
// maskable safe zone so launchers can crop without clipping the mark.
export function GET() {
  const bar = (width: number, opacity: number) => ({
    width,
    height: 44,
    borderRadius: 22,
    background: "linear-gradient(135deg, #F8FAFC 0%, #94A3B8 100%)",
    opacity,
  })

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 48,
        paddingLeft: 150,
        background: "#080808",
      }}
    >
      <div style={bar(220, 1)} />
      <div style={bar(160, 0.8)} />
      <div style={bar(100, 0.55)} />
    </div>,
    { width: 512, height: 512 }
  )
}
