const quotes = [
  {
    quote:
      "I had 600 unread newsletters. Now I read three lines a day and actually feel caught up.",
    name: "Priya N.",
    title: "Early tester",
    initials: "PN",
  },
  {
    quote:
      "It's the only reason I finally read the newsletters I pay for instead of archiving them.",
    name: "Daniel R.",
    title: "Early tester",
    initials: "DR",
  },
]

export function Testimonials() {
  return (
    <section
      id="reviews"
      className="relative z-10 w-full border-y border-foreground/10 bg-foreground/1 py-20"
    >
      <div className="mx-auto w-[92vw]">
        <h2 className="mx-auto max-w-3xl text-center font-serif text-4xl leading-[0.9] text-foreground italic sm:text-5xl">
          Caught up, for the first
          <br />
          <span className="silver-text">time in years.</span>
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-2">
          {quotes.map((item) => (
            <figure
              key={item.initials}
              className="border-l border-foreground/10 pl-8 sm:pl-12"
            >
              <blockquote className="font-serif text-2xl leading-tight text-foreground/90 italic sm:text-3xl">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-4">
                <span className="flex size-10 items-center justify-center rounded-full bg-linear-to-br from-foreground/20 to-foreground/5 font-mono text-[10px] text-foreground/70 contrast-125 grayscale">
                  {item.initials}
                </span>
                <div className="flex flex-col">
                  <span className="font-mono text-[12px] tracking-wide text-foreground">
                    {item.name}
                  </span>
                  <span className="font-mono text-[9px] tracking-[0.3em] text-foreground/40 uppercase">
                    {item.title}
                  </span>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
