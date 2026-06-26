import { ImageResponse } from "next/og"

export const contentType = "image/png"

export function GET() {
  const bar = (width: number, opacity: number) => ({
    width,
    height: 17,
    borderRadius: 9,
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
        gap: 19,
        paddingLeft: 48,
        background: "#080808",
      }}
    >
      <div style={bar(102, 1)} />
      <div style={bar(74, 0.8)} />
      <div style={bar(47, 0.55)} />
    </div>,
    { width: 192, height: 192 }
  )
}
