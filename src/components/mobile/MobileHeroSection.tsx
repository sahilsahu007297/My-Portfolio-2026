import React, { useEffect, useRef, useState } from "react"
import Waves from "../Waves"

// Taupe asterisk / flower mark.
function Asterisk({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <rect
          key={i}
          x="42"
          y="6"
          width="16"
          height="88"
          rx="8"
          fill="var(--taupe)"
          transform={`rotate(${i * 30} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="10" fill="var(--page-bg)" />
    </svg>
  )
}

interface Props {
  indiaTime: string
  onResumeClick: () => void
}

export default function MobileHeroSection({ indiaTime, onResumeClick }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const update = () => {
      const section = sectionRef.current
      const hero = heroRef.current
      if (!section || !hero) return

      const vh = window.innerHeight || 1
      const rect = section.getBoundingClientRect()
      const localScroll = Math.max(0, -rect.top)
      const pos = Math.min(1, Math.max(0, localScroll / vh))

      if (pos === 0) {
        hero.style.transform = "none"
        hero.style.borderRadius = "0px"
      } else {
        const p1 = Math.min(1, pos / 0.55)
        const p2 = Math.max(0, (pos - 0.55) / 0.45)
        const scale = 1 - p1 * 0.62
        const radius = p1 * 28
        const translateY = -p2 * 120
        hero.style.transform = `translateY(${translateY}vh) scale(${scale})`
        hero.style.borderRadius = `${radius}px`
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
    <section ref={sectionRef} className="relative bg-transparent" style={{ height: "200vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden flex justify-center items-center">
        <div
          ref={heroRef}
          className="absolute inset-0 flex origin-center flex-col overflow-hidden bg-[var(--page-bg)] will-change-transform"
          style={{ zIndex: 2 }}
        >
          {/* Top navigation */}
          <header className="flex items-center justify-between px-6 py-4 text-[15px] font-semibold tracking-tight">
            <div>Sahil Sahu</div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex flex-col gap-[5px] p-2"
                aria-label="Toggle menu"
              >
                <div className={`h-[2px] w-6 bg-[var(--ink)] transition-transform ${isMenuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
                <div className={`h-[2px] w-6 bg-[var(--ink)] transition-opacity ${isMenuOpen ? "opacity-0" : ""}`} />
                <div className={`h-[2px] w-6 bg-[var(--ink)] transition-transform ${isMenuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 flex min-w-[160px] flex-col rounded-2xl border border-[var(--ink)]/20 bg-[var(--page-bg)] p-3 shadow-xl z-50">
                  <a href="#about" onClick={() => setIsMenuOpen(false)} className="py-2.5 text-base font-medium border-b border-[var(--ink)]/10 text-center">About</a>
                  <a href="#contact" onClick={(e) => {
                    e.preventDefault();
                    setIsMenuOpen(false);
                    setTimeout(() => {
                      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
                    }, 50)
                  }} className="py-2.5 text-base font-medium border-b border-[var(--ink)]/10 text-center">Contact</a>
                  <button type="button" onClick={() => { onResumeClick(); setIsMenuOpen(false); }} className="py-2.5 text-base font-medium text-center">Resume</button>
                </div>
              )}
            </div>
          </header>

          <div className="h-px w-full bg-[var(--ink)]/85" />

          {/* Interactive waves band */}
          <div className="relative w-full grow overflow-hidden border-b border-[var(--ink)]/85">
            <Waves strokeColor="#111111" spacing={9} />
          </div>

          {/* Oversized name lockup */}
          <div className="relative flex w-full flex-col gap-8 overflow-hidden px-4 py-10 md:px-6">
            <div className="flex items-center gap-4">
              <Asterisk className="hero-asterisk h-[12vw] w-[12vw] shrink-0 max-h-16 max-w-16" />
              <h1 className="whitespace-nowrap text-[13vw] font-extrabold leading-[0.85] tracking-tighter">
                I am Sahil
              </h1>
            </div>
            <p className="max-w-[460px] self-end text-right text-[17px] font-semibold leading-[1.6] text-[var(--ink)] opacity-80 md:text-[20px] md:leading-[1.5]">
              I design at the intersection of people, problems, and possibility. A UX designer who likes complex problems, breaks them apart and reaches to a conclusion no matter what.
            </p>
          </div>
        </div>
      </div>
      
      {/* Invisible Snap Points */}
      <div className="absolute inset-0 z-0 pointer-events-none flex flex-col">
        <div className="h-screen w-full snap-start" />
        <div className="h-screen w-full snap-start" />
      </div>
    </section>
  )
}
