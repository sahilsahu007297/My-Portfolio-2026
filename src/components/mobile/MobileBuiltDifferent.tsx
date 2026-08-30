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
const easeInQuad = (value: number) => value * value

export default function MobileBuiltDifferent() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  // lettersRef[phraseIndex][letterIndex]
  const lettersRef = useRef<(HTMLSpanElement | null)[][]>(
    PHRASES.map(() => []),
  )

  useEffect(() => {
    let raf = 0

    const update = () => {
      const scroller = scrollContainerRef.current
      if (!scroller) return

      const max = scroller.scrollHeight - scroller.clientHeight
      const local = max > 0 ? clamp(scroller.scrollTop / max) : 0
      const pos = local * 5

      PHRASES.forEach((phrase, phraseIndex) => {
        const letters = lettersRef.current[phraseIndex]
        if (!letters) return

        // Map local to exactly this phrase's snap point.
        // Phrase i is centered at pos = i + 1
        const centerPos = phraseIndex + 1
        const dist = pos - centerPos
        
        // p = 0.5 when perfectly centered (dist = 0).
        // p = 0 when one full snap distance above (dist = -1).
        // p = 1 when one full snap distance below (dist = 1).
        const p = 0.5 + dist * 0.5
        const isLast = phraseIndex === PHRASES.length - 1

        const count = phrase.length || 1
        const stagger = 0.6 // overlap between letters

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

    const scroller = scrollContainerRef.current
    if (scroller) {
      scroller.addEventListener("scroll", onScroll, { passive: true })
      // Run once to set initial state
      update()
    }
    
    window.addEventListener("resize", onScroll)
    return () => {
      if (scroller) scroller.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section aria-label="Built different" className="relative h-[100dvh] w-full bg-black">
      <div
        ref={scrollContainerRef}
        className="absolute inset-0 z-10 h-full w-full overflow-y-scroll snap-y snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        
        <div ref={frameRef} className="sticky top-0 h-[100dvh] w-full overflow-hidden pointer-events-none bg-[#0f0f12]">
          <div className="relative flex h-full w-full items-center justify-center">
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
          Snap Track:
          6 total snap points for BuiltDifferent (1 for closed iris, 5 for phrases).
        */}
        <div className="relative z-0 -mt-[100dvh] pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[100dvh] w-full snap-center" />
          ))}
        </div>
      </div>
    </section>
  )
}
