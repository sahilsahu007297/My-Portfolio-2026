import { useEffect, useRef } from "react"

// Services section modeled on the bolddesign.framer.website process cards:
// a row of columns on a black canvas, each split into a tall TOP card holding a
// giant number and a BOTTOM card holding the heading + copy, in the same color.
// The number cards sit ready on load; as the section scrolls the text cards rise
// up one-by-one to meet their number card above.
type Service = {
  num: string
  color: string
  fg: string
  title: string
  intro: string
}

const SERVICES: Service[] = [
  {
    num: "01",
    color: "#524646",
    fg: "#FCF2E5",
    title: "I Design",
    intro:
      "Turning problems into purposeful products — from research, flows and UI to design systems and high-fidelity, accessible interfaces people understand, enjoy and return to.",
  },
  {
    num: "02",
    color: "#A8A492",
    fg: "#111111",
    title: "I Build",
    intro:
      "Taking ideas beyond the canvas — front-end implementation, interactive prototypes, motion and component thinking that turn design decisions into functional experiences.",
  },
  {
    num: "03",
    color: "#FCF2E5",
    fg: "#111111",
    title: "I Improve",
    intro:
      "Designing for what happens after users arrive — activation, conversion and retention, experimentation and journey optimization. Experiences that don't just work, they grow.",
  },
  {
    num: "04",
    color: "#524646",
    fg: "#FCF2E5",
    title: "I Strategize",
    intro:
      "Connecting user needs, business goals and product direction — problem framing, positioning, journey mapping and roadmaps. Deciding why it deserves to exist before building it.",
  },
  {
    num: "05",
    color: "#A8A492",
    fg: "#111111",
    title: "I Design Systems",
    intro:
      "Designing the structure behind the experience — design systems, information architecture, tokens and scalable patterns. Consistency across products without killing flexibility.",
  },
]

export default function Services() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const wrapper = wrapperRef.current
        if (!wrapper) return
        const vh = window.innerHeight || 1
        const total = Math.max(wrapper.offsetHeight - vh, 1)
        const local = Math.min(Math.max(window.scrollY - wrapper.offsetTop, 0), total)
        const p = local / total

        const n = SERVICES.length
        // Pos goes from 0 to N. 
        // 0 = all down. 1 = first up. 2 = second up.
        const pos = p * n

        cardRefs.current.forEach((card, i) => {
          if (!card) return
          // Each card rises precisely over 1 unit of pos (which corresponds to exactly 1 snap block)
          const rise = Math.min(1, Math.max(0, pos - i))
          const eased = 1 - Math.pow(1 - Math.min(1, Math.max(0, rise)), 2)
          
          // From completely off-screen (150%) to attached (0)
          card.style.transform = `translateY(${((1 - eased) * 150).toFixed(2)}%)`
        })
      })
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const numberClass =
    "pointer-events-none absolute left-1/2 -translate-x-1/2 font-['Impact',sans-serif] text-[11rem] leading-none tracking-normal md:text-[16rem] lg:text-[13vw]"

  return (
    <section ref={wrapperRef} className="relative z-10 bg-black">
      <div className="sticky top-0 h-screen overflow-hidden bg-black pointer-events-none">
        <div className="flex h-full flex-col px-3 py-4 md:px-4 md:py-5">
          <div className="grid h-full grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 lg:gap-4 pointer-events-auto">
            {SERVICES.map((s, i) => (
              <div key={s.num} className="flex h-full min-h-0 flex-col">
                {/* Top card — only the TOP HALF of the number is visible, sitting
                    at the card's bottom edge (the seam). */}
                <div
                  className="relative h-[22%] overflow-hidden rounded-[1.75rem]"
                  style={{ background: s.color, color: s.fg }}
                >
                  <span className={`${numberClass} bottom-0 translate-y-1/2`}>
                    {s.num}
                  </span>
                </div>

                {/* Bottom card — carries the BOTTOM HALF of the number at its top
                    edge. Rises on scroll until it attaches to the top card and
                    the two halves complete the full number. */}
                <div
                  ref={(el) => {
                    cardRefs.current[i] = el
                  }}
                  className="relative min-h-0 flex-1 overflow-hidden rounded-[1.75rem] will-change-transform"
                  style={{ background: s.color, color: s.fg }}
                >
                  <span className={`${numberClass} top-0 -translate-y-1/2`}>
                    {s.num}
                  </span>
                  <div className="flex h-full flex-col px-5 pb-5 pt-[4.5rem] md:px-6 md:pt-24 lg:px-8 lg:pt-32 lg:pb-8">
                    <h3 className="font-['Impact',sans-serif] text-4xl tracking-normal md:text-5xl lg:text-[2.75vw]">
                      {s.title}
                    </h3>
                    <p
                      className="mt-4 text-base font-medium leading-snug md:text-lg lg:mt-6 lg:text-xl lg:leading-relaxed"
                      style={{ color: s.fg, opacity: 0.9 }}
                    >
                      {s.intro}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invisible Snap Points */}
      <div className="relative z-0 -mt-[100vh] pointer-events-none">
        {/* N + 1 snap points to give 1 initial state + N card rise states */}
        {Array.from({ length: SERVICES.length + 1 }).map((_, i) => (
          <div key={i} className="h-screen w-full snap-center" />
        ))}
      </div>
    </section>
  )
}
