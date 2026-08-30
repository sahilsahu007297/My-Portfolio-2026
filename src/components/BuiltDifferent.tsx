import { useEffect, useRef } from "react"

// The phrases cycle one after another as you scroll.
const PHRASES = [
  "Built different",
  "Design with purpose",
  "Code with passion",
  "Create with vision",
  "Innovate always",
]

const clamp = (value: number) => Math.min(1, Math.max(0, value))
const easeOutQuad = (value: number) => 1 - Math.pow(1 - value, 2)
const easeInOutQuad = (value: number) =>
  value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2
const easeInQuad = (value: number) => value * value

export default function BuiltDifferent() {
  const sectionRef = useRef<HTMLElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const vLineRef = useRef<HTMLDivElement>(null)
  const hLineRef = useRef<HTMLDivElement>(null)
  // lettersRef[phraseIndex][letterIndex]
  const lettersRef = useRef<(HTMLSpanElement | null)[][]>(
    PHRASES.map(() => []),
  )

  useEffect(() => {
    let raf = 0

    const update = () => {
      const section = sectionRef.current
      const frame = frameRef.current
      if (!section || !frame) return

      const vh = window.innerHeight || 1
      const total = Math.max(section.offsetHeight - vh, 1)
      const local = clamp((window.scrollY - section.offsetTop) / total)

      // 1. Begin the iris at the instant Services clears, with a small opening
      // already visible, then give it a longer, slower cinematic expansion.
      // With snapping, we mapped pos from 0 to 5 (6 snap points).
      // pos = 0: Iris closed.
      // pos = 1: Iris fully open, phrase 1 centered.
      const pos = local * 5
      const cover = easeInOutQuad(clamp(pos))
      frame.style.clipPath = `circle(${cover * 150}% at 50% 0%)`
      frame.style.opacity = cover > 0 ? "1" : "0"

      PHRASES.forEach((phrase, phraseIndex) => {
        const letters = lettersRef.current[phraseIndex]
        if (!letters) return

        // Phrase i is centered at pos = i + 1
        const centerPos = phraseIndex + 1
        const dist = pos - centerPos
        
        // p = 0.5 when perfectly centered (dist = 0).
        // p = 0 when one full snap distance above (dist = -1).
        // p = 1 when one full snap distance below (dist = 1).
        const p = 0.5 + dist * 0.5
        const isLast = phraseIndex === PHRASES.length - 1

        const count = phrase.length || 1
        const stagger = 0.6 // more overlap between letters

        letters.forEach((letter, letterIndex) => {
          if (!letter) return
          const frac = letterIndex / count

          // Enter: p goes from 0 to 0.5
          const enterRaw = clamp(((p / 0.5) - frac * stagger) / (1 - stagger))
          const enter = easeOutQuad(enterRaw) 

          // Exit: p goes from 0.5 to 1.0
          const exitRaw = isLast
            ? 0
            : clamp((((p - 0.5) / 0.5) - frac * stagger) / (1 - stagger))
          const exit = easeInQuad(exitRaw)

          const y = (1 - enter) * 100 - exit * 45 // Slightly smaller movement distance
          letter.style.transform = `translate3d(0, ${y}%, 0)`
          letter.style.opacity = `${enter * (1 - exit)}`
          letter.style.filter = `blur(${(1 - enter) * 12 + exit * 9}px)`
        })
      })

      // 3. A traveling dot tracks scroll progress along a faint crosshair.
      const chrome = easeOutQuad(clamp((local - 0.06) / 0.14))

      const x = 12 + local * 76
      const y = 24 + easeOutQuad(local) * 64
      if (dotRef.current) {
        dotRef.current.style.left = `${x}%`
        dotRef.current.style.top = `${y}%`
        dotRef.current.style.opacity = `${chrome}`
      }
      if (vLineRef.current) {
        vLineRef.current.style.left = `${x}%`
        vLineRef.current.style.opacity = `${chrome * 0.5}`
      }
      if (hLineRef.current) {
        hLineRef.current.style.top = `${y}%`
        hLineRef.current.style.opacity = `${chrome * 0.5}`
      }
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section ref={sectionRef} className="relative bg-black" aria-label="Built different">
      {/* 
        The visual frame is sticky, but the section's scroll height is driven by 
        the invisible snap points below.
      */}
      <div className="sticky top-0 h-screen w-full overflow-hidden z-10 pointer-events-none">
        <div
          ref={frameRef}
          className="built-different-frame absolute inset-0 flex min-h-screen flex-col bg-[#0f0f12] px-6 py-7 text-[#f7f6f2] md:px-10 md:py-9"
        >
          {/* Faint crosshair grid + traveling progress dot */}
          <div
            ref={vLineRef}
            className="absolute inset-y-0 w-px bg-white/10"
          />
          <div
            ref={hLineRef}
            className="absolute inset-x-0 h-px bg-white/10"
          />
          <div
            ref={dotRef}
            className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90"
          />

          <div className="relative flex flex-1 items-center justify-center">
            {PHRASES.map((phrase, phraseIndex) => (
              <h2
                key={phrase}
                className="absolute flex w-full max-w-none flex-nowrap items-end justify-center whitespace-nowrap px-2 text-center text-[clamp(1.85rem,9vw,8rem)] font-semibold leading-[1.08] tracking-[-0.04em] md:px-4 md:text-[clamp(3rem,6.8vw,8rem)]"
              >
                {Array.from(phrase).map((character, letterIndex) =>
                  character === " " ? (
                    <span key={`space-${letterIndex}`} className="inline-block w-[0.24em]" aria-hidden />
                  ) : (
                    <span key={`${character}-${letterIndex}`} className="overflow-hidden inline-block" aria-hidden>
                      <span
                        ref={(element) => {
                          if (!lettersRef.current[phraseIndex]) {
                            lettersRef.current[phraseIndex] = []
                          }
                          lettersRef.current[phraseIndex][letterIndex] = element
                        }}
                        className="inline-block will-change-transform"
                      >
                        {character}
                      </span>
                    </span>
                  ),
                )}
                <span className="sr-only">{phrase}</span>
              </h2>
            ))}
          </div>
        </div>
      </div>

      {/* 
        Snap Track:
        6 total snap points for BuiltDifferent (1 for closed iris, 5 for phrases).
      */}
      <div className="relative z-0 -mt-[100vh] pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-screen w-full snap-center" />
        ))}
      </div>
    </section>
  )
}
