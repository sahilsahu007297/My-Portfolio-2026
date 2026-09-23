import { useEffect, useRef, useState } from "react"
import ProcessGlyph from "./ProcessGlyph"
import "./ForwardSection.css"

const STEPS = [
  {title:"THINK", copy:"I start with questions. I untangle the noise, challenge assumptions, and find the problem worth solving. Clarity comes before creation."},
  {title:"SHAPE", copy:"I turn insight into direction. Ideas become flows, systems, and experiences shaped around what people need and what the product must become."},
  {title:"BUILD", copy:"I don't stop at the blueprint. I bring ideas into the real world, where design meets technology and the business of making things work."},
  {title:"GROW", copy:"Nothing is ever truly finished. I watch, learn, question, and refine, turning what works into what works better, and products into systems that can grow."},
]
export default function ForwardSection() {
  const [active,setActive]=useState(0)
  const section=useRef<HTMLElement>(null)
  useEffect(()=>{
    const el=section.current!, reduced=matchMedia("(prefers-reduced-motion: reduce)")
    let frame=0
    const update=()=>{frame=0;const p=Math.max(0,Math.min(.9999,-el.getBoundingClientRect().top/Math.max(1,el.offsetHeight-innerHeight)));const step=p*4;setActive(Math.floor(step));el.style.setProperty("--line-progress",String(p));el.style.setProperty("--icon-reveal",String(reduced.matches?1:Math.min(1,(step%1)*3+.1)))}
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)}
    window.addEventListener("scroll",schedule,{passive:true});window.addEventListener("resize",schedule);reduced.addEventListener("change",schedule);update()
    return()=>{cancelAnimationFrame(frame);window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);reduced.removeEventListener("change",schedule)}
  },[])
  return <section ref={section} className="forward-process" aria-label="How I work">
    <div className="forward-process__stage"><div className="forward-process__steps">{STEPS.map((step,i)=><article key={step.title} className={`process-step ${active===i?"is-active":""}`}>
      <h3><span className="process-step__index">0{i+1}</span><span className="process-step__dot" aria-hidden="true"/>{step.title}</h3>
      <div className="process-step__panel"><div><p>{step.copy}</p><ProcessGlyph index={i}/></div></div>
    </article>)}</div></div>
  </section>
}
