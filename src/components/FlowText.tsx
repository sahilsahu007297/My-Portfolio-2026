import { useEffect, useRef } from "react"

export default function FlowText({ children, progress }: { children: string; progress?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const host = ref.current!
    const reduced = matchMedia("(prefers-reduced-motion: reduce)")
    const paint = () => {
      const rect = host.getBoundingClientRect()
      const p = progress ?? Math.max(0, Math.min(1, (innerHeight * .92 - rect.top) / (innerHeight * .28)))
      host.querySelectorAll<HTMLElement>("[data-flow-char]").forEach((el, i) => {
        const t = reduced.matches ? 1 : Math.max(0, Math.min(1, p * 1.7 - i / children.length * .7))
        el.style.transform = `translate3d(0,${Math.pow(1-t, 3)*110}%,0) rotate(${(1-t)*8}deg)`
        el.style.opacity = String(t)
      })
    }
    let frame = 0
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(paint) }
    paint(); window.addEventListener("scroll", schedule, { passive: true }); reduced.addEventListener("change", schedule)
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); reduced.removeEventListener("change", schedule) }
  }, [children, progress])
  return <span ref={ref} aria-label={children} className="flow-text">{children.split(" ").map((word, wi) => <span className="flow-word" aria-hidden="true" key={wi}>{[...word].map((c, i) => <span data-flow-char key={i}>{c}</span>)}<span>&nbsp;</span></span>)}</span>
}

export function HoverLetters({ children }: { children: string }) {
  return <span className="hover-letters" aria-label={children}>{[...children].map((c, i) => <span aria-hidden="true" key={i}>{c}</span>)}</span>
}
