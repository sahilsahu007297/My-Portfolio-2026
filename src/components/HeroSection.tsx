import React, { useEffect, useRef } from "react"
import Waves from "./Waves"
import logo from "../Assets/Sahil-Sahu-Logo.png"

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

export default function HeroSection({ indiaTime, onResumeClick }: Props) {
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
          <header className="grid grid-cols-2 items-center px-6 py-4 text-[15px] font-semibold tracking-tight md:grid-cols-5 md:px-8">
            <div className="md:pr-6 flex items-center gap-3">
              <img src={logo} alt="Sahil Sahu Logo" className="h-12 md:h-14 w-auto object-contain" />
              <span>Sahil Sahu</span>
            </div>
            <a
              href="#about"
              data-cursor-hover
              className="hidden border-l border-[var(--ink)]/85 px-6 text-center transition-opacity hover:opacity-55 md:block"
            >
              About
            </a>
            <a
              href="#contact"
              data-cursor-hover
              onClick={(e) => {
                e.preventDefault()
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
              }}
              className="hidden border-l border-[var(--ink)]/85 px-6 text-center transition-opacity hover:opacity-55 md:block"
            >
              Contact&nbsp;&nbsp;&nbsp;
            </a>
            <button
              type="button"
              data-cursor-hover
              onClick={onResumeClick}
              className="hidden border-l border-[var(--ink)]/85 px-6 text-center transition-opacity hover:opacity-55 md:block"
            >
              Resume
            </button>
            <div
              className="flex items-center justify-end gap-2 border-l border-[var(--ink)]/85 pl-6 tabular-nums"
              aria-label={`Indian Standard Time: ${indiaTime}`}
            >
              <time dateTime={new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour12: false })}>
                {indiaTime} IST
              </time>
              <Asterisk className="h-4 w-4 shrink-0" />
            </div>
          </header>

          <div className="h-px w-full bg-[var(--ink)]/85" />

          {/* Interactive waves band */}
          <div className="relative w-full grow overflow-hidden border-b border-[var(--ink)]/85">
            <Waves strokeColor="#111111" spacing={9} />
          </div>

          {/* Oversized name lockup */}
          <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden px-6 py-8 md:flex-row md:items-center md:px-8">
            <div className="flex items-center gap-6">
              <Asterisk className="hero-asterisk h-16 w-16 shrink-0 md:h-24 md:w-24" />
              <h1 className="whitespace-nowrap text-[15vw] font-extrabold leading-[0.85] tracking-tighter md:text-[13vw]">
                I am Sahil
              </h1>
            </div>
            <p className="max-w-[520px] self-end text-right text-[17px] font-semibold leading-[1.6] text-[var(--ink)] opacity-80 md:text-[22px] md:leading-[1.45]">
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
