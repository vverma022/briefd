import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

// Apple touch icon — obsidian tile with the silver "brief" bars, matching the
// landing theme and the SVG favicon.
export default function AppleIcon() {
  const bar = (width: number, opacity: number) => ({
    width,
    height: 16,
    borderRadius: 8,
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
        gap: 18,
        paddingLeft: 44,
        background: "#080808",
      }}
    >
      <div style={bar(96, 1)} />
      <div style={bar(70, 0.8)} />
      <div style={bar(44, 0.55)} />
    </div>,
    { ...size }
  )
}
