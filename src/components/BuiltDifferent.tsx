import { useEffect, useRef } from "react"
import BuiltDifferentCanvas from "./BuiltDifferentCanvas"
import "./BuiltDifferent.css"

const PHRASES = ["Built different", "Design with purpose", "Solve with curiosity", "Create with vision", "Innovate always"]
const clamp = (n: number) => Math.max(0, Math.min(1, n))

export default function BuiltDifferent() {
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const titles = useRef<(HTMLHeadingElement | null)[]>([])
  const progress = useRef(0)
  useEffect(() => {
    let frame = 0
    const reduced = matchMedia("(prefers-reduced-motion: reduce)")
    const render = () => {
      frame = 0
      const el = section.current
      if (!el || !el.getClientRects().length) return
      const p = clamp(-el.getBoundingClientRect().top / Math.max(1, el.offsetHeight - innerHeight))
      progress.current = p
      stage.current?.classList.toggle("is-covered", p > .84)
      stage.current?.classList.toggle("is-outlined", p > .94)
      titles.current.forEach((title, i) => {
        if (!title || reduced.matches) return
        const center = .065 + i * .145
        const enter = clamp((p - center + .065) / .065)
        const exit = i === PHRASES.length-1 ? 0 : clamp((p - center - .035) / .07)
        const easeIn = 1-Math.pow(1-enter,3)
        title.style.transform = `translateY(${(1-easeIn)*90-exit*exit*95}vh)`
        title.style.opacity = String(clamp(enter*3)*(1-exit))
        title.style.visibility = enter > 0 && exit < 1 ? "visible" : "hidden"
      })
    }
    const schedule = () => { if (!frame) frame=requestAnimationFrame(render) }
    window.addEventListener("scroll",schedule,{passive:true})
    window.addEventListener("resize",schedule)
    reduced.addEventListener("change",schedule)
    schedule()
    return () => { cancelAnimationFrame(frame);window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);reduced.removeEventListener("change",schedule) }
  }, [])
  return <section ref={section} className="built-story" aria-label="Built different">
    <div ref={stage} className="built-story__stage">
      <BuiltDifferentCanvas progress={progress} />
      <span className="built-story__label">[ A way of thinking ]</span>
      <div className="built-story__words">
        {PHRASES.map((phrase,i) => <h2 ref={el=>{titles.current[i]=el}} key={phrase}>
          {i===0 ? <>Built<br/>different.</> : i===4 ? <>Innovate<br/>always.</> : <>{phrase.split(" with ")[0]} with<br/><em>{phrase.split(" with ")[1]}.</em></>}
        </h2>)}
      </div>
      <p className="built-story__closing">Purpose in design. Curiosity in every challenge. Vision in everything.</p>
    </div>
  </section>
}
