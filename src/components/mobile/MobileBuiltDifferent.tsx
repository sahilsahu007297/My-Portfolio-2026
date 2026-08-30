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

export default function MobileBuiltDifferent() {
  const sectionRef = useRef<HTMLElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
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

      const pos = local * 5
      const cover = easeInOutQuad(clamp(pos))
      // Use a circular reveal similar to desktop
      frame.style.clipPath = `circle(${cover * 150}% at 50% 0%)`
      frame.style.opacity = cover > 0 ? "1" : "0"

      PHRASES.forEach((phrase, phraseIndex) => {
        const letters = lettersRef.current[phraseIndex]
        if (!letters) return

        const centerPos = phraseIndex + 1
        const dist = pos - centerPos
        
        const p = 0.5 + dist * 0.5
        const isLast = phraseIndex === PHRASES.length - 1

        const count = phrase.length || 1
        const stagger = 0.6 

        letters.forEach((letter, letterIndex) => {
          if (!letter) return
          const frac = letterIndex / count

          const enterRaw = clamp(((p / 0.5) - frac * stagger) / (1 - stagger))
          const enter = easeOutQuad(enterRaw)

          const exitRaw = isLast
            ? 0
            : clamp((((p - 0.5) / 0.5) - frac * stagger) / (1 - stagger))
          const exit = easeInQuad(exitRaw)

          const y = (1 - enter) * 100 - exit * 45
          letter.style.transform = `translate3d(0, ${y}%, 0)`
          letter.style.opacity = `${enter * (1 - exit)}`
          letter.style.filter = `blur(${(1 - enter) * 12 + exit * 9}px)`
        })
      })
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
    <section ref={sectionRef} aria-label="Built different" className="relative w-full bg-black">
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden pointer-events-none z-10">
        <div ref={frameRef} className="absolute inset-0 flex h-full w-full items-center justify-center bg-[#0f0f12]">
          {PHRASES.map((phrase, phraseIndex) => (
            <h2
              key={phrase}
              className="absolute flex w-full max-w-none flex-nowrap items-end justify-center whitespace-nowrap px-4 text-center text-[10vw] font-semibold leading-[1.08] tracking-[-0.04em]"
            >
              {Array.from(phrase).map((character, letterIndex) =>
                character === " " ? (
                  <span key={`space-${letterIndex}`} className="w-[2vw]" aria-hidden />
                ) : (
                  <span key={`${character}-${letterIndex}`} className="overflow-hidden" aria-hidden>
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

      {/* 
        6 total snap points for BuiltDifferent (1 for closed iris, 5 for phrases).
        These give the section its height in the main document flow.
      */}
      <div className="relative z-0 -mt-[100dvh] pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[100dvh] w-full" />
        ))}
      </div>
    </section>
  )
}
