import { useEffect, useRef } from "react"
import "./TextRevealSection.css"

const PARAGRAPHS = [
  "I’m a UX Designer who likes to look one layer deeper—beyond screens, flows, and pixels, into the business problems that make those experiences necessary in the first place.",
  "For me, good design isn’t just about making something easy to use. It’s about understanding why it should exist, who it should serve, how it should create value, and what makes it sustainable as a business."
]
const WORDS = PARAGRAPHS.map(p => p.split(" "))

export default function TextRevealSection() {
  const containerRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([])
  useEffect(() => {
    let frame = 0
    const reduced = matchMedia("(prefers-reduced-motion: reduce)")
    const clamp = (n: number) => Math.max(0, Math.min(1, n))
    const update = () => {
      frame = 0
      const section = containerRef.current
      if (!section || !section.getClientRects().length) return
      const progress = -section.getBoundingClientRect().top / innerHeight
      const entrance = reduced.matches ? 1 : clamp((progress + .3) / 1.1)
      if (textRef.current) {
        textRef.current.style.transform = `translateY(${(1-entrance)*65}vh)`
        textRef.current.style.opacity = String(entrance)
      }
      wordsRef.current.forEach((word,i) => {
        if (!word) return
        const first = i < WORDS[0].length
        const index = first ? i : i-WORDS[0].length
        const count = first ? WORDS[0].length : WORDS[1].length
        const phase = progress - .85 - (first ? 0 : 1.15)
        const amount = reduced.matches ? 1 : clamp((phase-index/count*.85)/.3)
        word.style.opacity = String(.13+.87*(1-Math.pow(1-amount,3)))
        word.style.transform = `translateY(${(1-amount)*10}px)`
      })
    }
    const schedule = () => { if (!frame) frame=requestAnimationFrame(update) }
    window.addEventListener("scroll",schedule,{passive:true})
    window.addEventListener("resize",schedule)
    reduced.addEventListener("change",schedule)
    schedule()
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);reduced.removeEventListener("change",schedule) }
  },[])
  return <section ref={containerRef} data-particle-outro className="particle-outro">
    <div className="particle-outro__stage">
      <div ref={textRef} className="particle-outro__text">
        {WORDS.map((words,p) => <p key={p}>{words.map((word,i) => <span key={i} ref={el => { wordsRef.current[(p ? WORDS[0].length : 0)+i]=el }}>{word}</span>)}</p>)}
      </div>
    </div>
  </section>
}
