import React, { useEffect, useRef, useState } from "react"
import MountainTerrain from "../MountainTerrain"

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
          className="absolute inset-0 flex origin-center flex-col overflow-hidden bg-black text-white will-change-transform"
          style={{ zIndex: 2 }}
        >
          {/* Top navigation */}
          <header className="relative z-10 shrink-0 min-h-[72px] flex items-center justify-between px-6 py-4 text-[15px] font-semibold tracking-tight">
            <div className="flex items-center gap-3">
              <span>Sahil Sahu</span>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex flex-col gap-[5px] p-2"
                aria-label="Toggle menu"
              >
                <div className={`h-[2px] w-6 bg-white transition-transform ${isMenuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
                <div className={`h-[2px] w-6 bg-white transition-opacity ${isMenuOpen ? "opacity-0" : ""}`} />
                <div className={`h-[2px] w-6 bg-white transition-transform ${isMenuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 flex min-w-[160px] flex-col rounded-2xl border border-white/20 bg-black text-white p-3 shadow-xl z-50">
                  <a href="#about" onClick={() => setIsMenuOpen(false)} className="py-2.5 text-base font-medium border-b border-white/10 text-center">About</a>
                  <a href="#contact" onClick={(e) => {
                    e.preventDefault();
                    setIsMenuOpen(false);
                    setTimeout(() => {
                      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
                    }, 50)
                  }} className="py-2.5 text-base font-medium border-b border-white/10 text-center">Contact</a>
                  <button type="button" onClick={() => { onResumeClick(); setIsMenuOpen(false); }} className="py-2.5 text-base font-medium text-center">Resume</button>
                </div>
              )}
            </div>
          </header>

          <div className="h-px w-full bg-white/20" />

          <div className="relative min-h-0 flex-1 overflow-hidden">
            <MountainTerrain />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.3),transparent_70%)]" />

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center pointer-events-none">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-white/55">UX designer & creative thinker</p>
            <h1 className="text-[clamp(3rem,8vw,9rem)] font-extrabold leading-[0.95] tracking-[-0.06em] text-white">I'm Sahil Sahu.</h1>
            <p className="max-w-[660px] text-sm md:text-lg leading-relaxed text-white/85 [text-shadow:0_2px_14px_#000,0_0_6px_#000]">
              I design at the intersection of people, problems, and possibility. A UX designer who likes complex problems, breaks them apart and reaches to a conclusion no matter what.
            </p>
          </div>
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
