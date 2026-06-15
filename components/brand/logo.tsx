import { cn } from "@/lib/utils"

/**
 * The Briefd "brief" mark — three silver bars condensing into one, evoking a
 * newsletter distilled to its summary. Self-contained obsidian badge so it
 * reads the same on any background and matches the favicon / OG image.
 */
export function BriefdMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-8", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="bd-silver"
          x1="9"
          y1="11"
          x2="31"
          y2="29"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F8FAFC" />
          <stop offset="1" stopColor="#94A3B8" />
        </linearGradient>
      </defs>
      <rect
        x="0.5"
        y="0.5"
        width="39"
        height="39"
        rx="10"
        fill="#080808"
        stroke="#FFFFFF"
        strokeOpacity="0.12"
      />
      <rect
        x="9"
        y="11"
        width="22"
        height="3.5"
        rx="1.75"
        fill="url(#bd-silver)"
      />
      <rect
        x="9"
        y="18.25"
        width="16"
        height="3.5"
        rx="1.75"
        fill="url(#bd-silver)"
        fillOpacity="0.8"
      />
      <rect
        x="9"
        y="25.5"
        width="10"
        height="3.5"
        rx="1.75"
        fill="url(#bd-silver)"
        fillOpacity="0.55"
      />
    </svg>
  )
}

/** Mark + wordmark lockup used in the nav and footer. */
export function BriefdLogo({
  className,
  markClassName,
}: {
  className?: string
  markClassName?: string
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BriefdMark className={markClassName} />
      <span className="font-mono text-sm tracking-[0.4em] text-foreground uppercase">
        Briefd
      </span>
    </span>
  )
}
