import { useEffect, useRef } from "react"
import "./TunnelIntro.css"

export default function TunnelIntro() {
  const section=useRef<HTMLElement>(null)
  const title=useRef<HTMLDivElement>(null)
  useEffect(()=>{
    let frame=0
    const reduced=matchMedia("(prefers-reduced-motion: reduce)")
    const update=()=>{
      frame=0
      const el=section.current!,rect=el.getBoundingClientRect()
      const p=Math.max(0,Math.min(1,-rect.top/Math.max(1,el.offsetHeight-innerHeight)))
      const appear=Math.max(0,Math.min(1,(innerHeight-rect.top)/(innerHeight*.65)))
      const fade=Math.max(0,Math.min(1,(p-.43)/.23))
      if(title.current){
        title.current.style.opacity=String(reduced.matches?1:appear*(1-fade))
        title.current.style.transform=reduced.matches?"none":`translate3d(0,${fade*-24}px,${-130*(1-appear)+p*130}px)`
        title.current.style.filter=reduced.matches?"none":`blur(${fade*8}px)`
      }
    }
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)}
    window.addEventListener("scroll",schedule,{passive:true});window.addEventListener("resize",schedule);reduced.addEventListener("change",schedule);update()
    return()=>{cancelAnimationFrame(frame);window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);reduced.removeEventListener("change",schedule)}
  },[])
  return <section ref={section} data-particle-tunnel className="workflow-tunnel" aria-label="Explore my workflow">
    <div className="workflow-tunnel__stage">
      <div ref={title} className="workflow-tunnel__title">
        <span className="workflow-tunnel__eyebrow">A little deeper into the process</span>
        <h2>Keep exploring<br/><em>my workflow.</em></h2>
        <p>Follow the curiosity.</p>
        <span className="workflow-tunnel__cue" aria-hidden="true">↓</span>
      </div>
    </div>
  </section>
}
