import { useEffect, useRef } from "react"

const PARAGRAPHS = [
  "I’m a UX Designer who likes to look one layer deeper—beyond screens, flows, and pixels, into the business problems that make those experiences necessary in the first place.",
  "For me, good design isn’t just about making something easy to use. It’s about understanding why it should exist, who it should serve, how it should create value, and what makes it sustainable as a business."
]
const WORDS = PARAGRAPHS.map(p => p.split(" "))
const TOTAL_WORDS = WORDS.reduce((sum, words) => sum + words.length, 0)

export default function TextRevealSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([])
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const handleScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        if (!containerRef.current) return
        
        const rect = containerRef.current.getBoundingClientRect()
        const vh = window.innerHeight
        // The container is 400vh tall (5 snap points total), so rect.top goes from 0 to -400vh
        const localScroll = Math.max(0, -rect.top)
        const scrollU = localScroll / vh
        
        wordsRef.current.forEach((word, i) => {
          if (!word) return
          const isPara1 = i < WORDS[0].length
          const paraWordIndex = isPara1 ? i : i - WORDS[0].length
          const paraWordCount = isPara1 ? WORDS[0].length : WORDS[1].length
          
          // Para 1 reveals from 0 to 1. Para 2 reveals from 1 to 2.
          const wordScroll = isPara1 
            ? Math.min(1, Math.max(0, scrollU))
            : Math.min(1, Math.max(0, scrollU - 1))
            
          const start = (paraWordIndex / paraWordCount) * 0.7
          const end = start + 0.3
          
          let opacity = 0.1
          let ty = 20
          
          if (wordScroll > start) {
            const p = Math.min(1, (wordScroll - start) / (end - start))
            // Easing out
            const e = 1 - Math.pow(1 - p, 3)
            opacity = 0.1 + (0.9 * e)
            ty = 20 * (1 - e)
          }
          
          word.style.opacity = opacity.toFixed(3)
          word.style.transform = `translateY(${ty}px)`
        })

        // Phase 2: Color switch to black (from 300vh to 400vh)
        // This corresponds to scrollU from 3 to 4.
        const colorProgress = Math.min(1, Math.max(0, scrollU - 3))
        if (bgRef.current) {
          // background: #F1F0EC (241, 240, 236) -> #000000
          const r = Math.round(241 * (1 - colorProgress))
          const g = Math.round(240 * (1 - colorProgress))
          const b = Math.round(236 * (1 - colorProgress))
          bgRef.current.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
          
          // text: #000000 -> #FFFFFF
          const tr = Math.round(255 * colorProgress)
          bgRef.current.style.color = `rgb(${tr}, ${tr}, ${tr})`
        }
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section ref={containerRef} className="relative z-20">
      <div 
        ref={bgRef}
        className="sticky top-0 h-screen w-full flex items-center justify-center px-6 md:px-24 py-12 will-change-[background-color,color]"
        style={{ backgroundColor: "#F1F0EC", color: "#000000" }}
      >
        <div className="text-base sm:text-lg md:text-2xl lg:text-[1.75rem] font-medium text-center leading-relaxed md:leading-[1.7] tracking-wide max-w-4xl mx-auto px-4 flex flex-col gap-6 md:gap-10">
          {WORDS.map((paraWords, pIdx) => {
            const startIdx = WORDS.slice(0, pIdx).reduce((sum, w) => sum + w.length, 0)
            return (
              <p key={pIdx} className="m-0">
                {paraWords.map((word, wIdx) => {
                  const idx = startIdx + wIdx
                  return (
                    <span 
                      key={wIdx} 
                      ref={el => { wordsRef.current[idx] = el }}
                      className="inline-block mx-[0.15em] opacity-10 will-change-[opacity,transform] my-[0.1em]"
                      style={{ transform: "translateY(20px)" }}
                    >
                      {word}
                    </span>
                  )
                })}
              </p>
            )
          })}
        </div>
      </div>

      {/* Invisible Snap Points */}
      <div className="relative z-0 -mt-[100vh] pointer-events-none">
        <div className="h-screen w-full snap-center" />
        <div className="h-screen w-full snap-center" />
        <div className="h-screen w-full snap-center" />
        <div className="h-screen w-full snap-center" />
        <div className="h-screen w-full snap-center" />
      </div>
    </section>
  )
}
