import { useEffect, useRef } from "react"
import "./TunnelIntro.css"
const STORY = ["Now, let me tell you a story.", "Once upon a time,", "a question took shape.", "Could a fighter jet move", "with the air,", "instead of against it?", "Less drag. More possibility."]
export default function TunnelIntro() {
  const section=useRef<HTMLElement>(null)
  useEffect(()=>{
    const el=section.current!, reduced=matchMedia("(prefers-reduced-motion: reduce)")
    const headings=Array.from(el.querySelectorAll<HTMLElement>(".story-heading"))
    let frame=0
    const update=()=>{
      frame=0
      if(reduced.matches)return
      const p=Math.max(0,Math.min(1,-el.getBoundingClientRect().top/Math.max(1,el.offsetHeight-innerHeight)))
      headings.forEach((heading,i)=>{
        const start=i===0?.015:.21+(i-1)*.108,duration=i===0?.18:.105
        const t=(p-start)/duration
        const approach=Math.max(0,Math.min(1,t/.44))
        const exit=Math.max(0,Math.min(1,(t-.68)/.32))
        const scale=.55+approach*.45+exit*exit*1.8
        // Move the complete heading past the top edge before hiding it. Never
        // magnify wrapped lines into isolated fragments in the viewport centre.
        const y=-exit*exit*(innerHeight*.65+heading.offsetHeight*scale*.5+48)
        const opacity=t>=0&&t<1?Math.min(1,t*7):0
        heading.style.opacity=String(opacity)
        heading.style.transform=`translate(-50%,-50%) translate3d(0,${y}px,0) scale(${scale})`
        heading.style.visibility=opacity>0?"visible":"hidden"
      })
    }
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)}
    update();window.addEventListener("scroll",schedule,{passive:true});window.addEventListener("resize",schedule);reduced.addEventListener("change",schedule)
    return()=>{cancelAnimationFrame(frame);window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);reduced.removeEventListener("change",schedule)}
  },[])
  return <section ref={section} data-particle-tunnel className="workflow-tunnel" aria-label="A story about the design process">
    <div className="workflow-tunnel__stage">{STORY.map(line=><h2 key={line} className="story-heading">{line}</h2>)}</div>
  </section>
}
