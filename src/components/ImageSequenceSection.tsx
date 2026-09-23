import { useEffect, useRef } from "react"
import { POINTER_DATA } from "./journeyData"
import "./ParticleJourney.css"

export default function HeroSequenceSection(_props: { indiaTime: string; onResumeClick: () => void }) {
  const sectionRef = useRef<HTMLElement>(null)
  const cards = useRef<(HTMLDivElement | null)[]>([])
  useEffect(() => {
    let frame = 0
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => {
      frame = 0
      const section = sectionRef.current
      if (!section || !section.getClientRects().length || reduced.matches) return
      const progress = Math.max(0, -section.getBoundingClientRect().top / window.innerHeight)
      cards.current.forEach((card, i) => {
        if (!card) return
        const local = progress - (i * 1.4 + 0.8)
        const enter = Math.min(1, Math.max(0, local / 0.45))
        const leave = Math.min(1, Math.max(0, (local - 1) / 0.35))
        card.style.opacity = String(enter * (1 - leave))
        card.style.transform = `translateX(${(i % 2 ? 1 : -1) * (1 - enter) * 50}px) translateY(${(1 - enter) * 25 - leave * 25}px) scale(${0.7 + enter * 0.3 + leave * 0.12})`
        card.style.filter = `blur(${(1 - enter) * 10 + leave * 6}px)`
      })
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    reduced.addEventListener("change", schedule)
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      reduced.removeEventListener("change", schedule)
    }
  }, [])
  return (
    <section ref={sectionRef} data-particle-sequence className="particle-sequence" aria-label="My creative process">
      <div className="particle-sequence__stage">
        {POINTER_DATA.map((point, i) => (
          <div className="particle-sequence__copy" key={point.n} ref={el => { cards.current[i] = el }}>
            <span>{point.n} / {String(POINTER_DATA.length).padStart(2, "0")}</span>
            <h2>{point.t}</h2>
            <p>{point.q}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
