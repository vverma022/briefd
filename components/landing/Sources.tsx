import { HugeiconsIcon } from "@hugeicons/react"
import { InboxIcon } from "@hugeicons/core-free-icons"

const senders = [
  { name: "Lenny's Newsletter", topic: "Product", initials: "LN" },
  { name: "Stratechery", topic: "Strategy", initials: "ST" },
  { name: "Morning Brew", topic: "Business", initials: "MB" },
  { name: "Pragmatic Engineer", topic: "Engineering", initials: "PE" },
]

export function Sources() {
  return (
    <section id="sources" className="relative z-10 mx-auto w-[92vw] py-12">
      <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-foreground/10 lg:grid-cols-3">
        {/* Copy panel */}
        <div className="flex flex-col justify-between gap-8 bg-foreground/1 p-8">
          <span className="font-mono text-[10px] tracking-[0.5em] text-foreground/40 uppercase">
            Sources / Watched senders
          </span>
          <div className="flex flex-col gap-3">
            <h2 className="font-serif text-3xl leading-[0.9] text-foreground italic sm:text-4xl">
              Watch the senders,{" "}
              <span className="silver-text">skip the inbox.</span>
            </h2>
            <p className="font-mono text-[12px] leading-relaxed tracking-wide text-foreground/50">
              Paste in the newsletters you care about. Everything else in Gmail
              stays exactly where it is.
            </p>
          </div>
        </div>

        {/* Sender badges */}
        <div className="bento-card relative overflow-hidden border-t border-foreground/10 p-8 lg:col-span-2 lg:border-t-0 lg:border-l">
          <HugeiconsIcon
            icon={InboxIcon}
            size={200}
            strokeWidth={1}
            className="pointer-events-none absolute -right-8 -bottom-8 text-foreground/5"
          />
          <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-2">
            {senders.map((sender) => (
              <div
                key={sender.initials}
                className="group flex items-center gap-4 transition-transform duration-300 hover:translate-x-1"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-linear-to-br from-foreground/20 to-foreground/5 font-mono text-[10px] tracking-wider text-foreground/70 grayscale transition-transform duration-300 group-hover:scale-110">
                  {sender.initials}
                </span>
                <div className="flex flex-col">
                  <span className="font-mono text-[12px] tracking-wide text-foreground/70 transition-colors group-hover:text-foreground">
                    {sender.name}
                  </span>
                  <span className="font-mono text-[8px] tracking-[0.25em] text-foreground/30 uppercase">
                    {sender.topic}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
