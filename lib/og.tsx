import { ImageResponse } from "next/og"

export const ogSize = { width: 1200, height: 630 }
export const ogAlt = "Briefd — Your newsletters, briefed."

const silver = "linear-gradient(135deg, #F8FAFC 0%, #94A3B8 100%)"

function bar(width: number, opacity: number) {
  return (
    <div
      style={{
        width,
        height: 7,
        borderRadius: 4,
        background: silver,
        opacity,
      }}
    />
  )
}

/**
 * Shared Open Graph / Twitter card render — obsidian background, hairline
 * frame, silver "brief" mark and two-tone silver headline, mirroring the
 * landing's Modern Obsidian theme. Production tone (no waitlist language).
 */
export function renderBrandOg() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#080808",
        color: "#E2E8F0",
        padding: 72,
        position: "relative",
      }}
    >
      {/* soft silver glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(900px circle at 82% -10%, rgba(255,255,255,0.08), transparent 55%)",
        }}
      />
      {/* hairline frame */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 40,
          right: 40,
          bottom: 40,
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 28,
        }}
      />

      {/* top row: brand + label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#0c0c0c",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 6,
              paddingLeft: 15,
            }}
          >
            {bar(34, 1)}
            {bar(24, 0.8)}
            {bar(15, 0.55)}
          </div>
          <div
            style={{
              fontSize: 26,
              letterSpacing: 10,
              color: "#E2E8F0",
            }}
          >
            BRIEFD
          </div>
        </div>
        <div
          style={{
            fontSize: 17,
            letterSpacing: 5,
            color: "rgba(226,232,240,0.45)",
          }}
        >
          NEWSLETTER DIGEST
        </div>
      </div>

      {/* headline */}
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 92,
            lineHeight: 1.02,
            letterSpacing: -3,
          }}
        >
          <div style={{ color: "#F1F5F9" }}>Your newsletters,</div>
          <div style={{ color: "#9FB0C3" }}>briefed.</div>
        </div>
        <div
          style={{
            fontSize: 26,
            letterSpacing: 1,
            color: "rgba(226,232,240,0.6)",
            maxWidth: 760,
          }}
        >
          Connect Gmail and let AI distill every newsletter into a three-line
          brief, pushed to your phone.
        </div>
      </div>

      {/* bottom row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 17,
          letterSpacing: 4,
          color: "rgba(226,232,240,0.4)",
        }}
      >
        <div>CONNECT · SUMMARIZE · NOTIFY · READ</div>
        <div>briefd.app</div>
      </div>
    </div>,
    { ...ogSize }
  )
}
