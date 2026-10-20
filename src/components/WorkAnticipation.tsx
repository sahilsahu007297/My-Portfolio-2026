import { useEffect, useRef, type CSSProperties } from "react"
import "./WorkAnticipation.css"

const lines=["Selected", "projects."]
export default function WorkAnticipation(){
  const section=useRef<HTMLElement>(null)
  useEffect(()=>{
    const el=section.current!,media=matchMedia("(prefers-reduced-motion: reduce)")
    const letters=Array.from(el.querySelectorAll<HTMLElement>(".work-anticipation__letter"))
    let frame=0
    const clamp=(n:number)=>Math.max(0,Math.min(1,n))
    const update=()=>{
      frame=0
      if(!el.getClientRects().length)return
      const p=media.matches ? .55 : clamp(-el.getBoundingClientRect().top/Math.max(1,el.offsetHeight-innerHeight))
      const converge=clamp((p-.06)/.42),ease=1-Math.pow(1-converge,4),open=media.matches?0:clamp((p-.73)/.27)
      el.style.setProperty("--aperture",String(ease))
      el.style.setProperty("--departure",String(open))
      el.style.setProperty("--orbit-angle",`${p*100}deg`)
      letters.forEach((letter,i)=>{
        const angle=i*2.39996,spread=1-ease
        const x=media.matches?0:Math.cos(angle)*spread*innerWidth*.5
        const y=media.matches?0:Math.sin(angle)*spread*innerHeight*.65+(i<8?-1:1)*open*open*innerHeight*.45
        const spin=media.matches?0:spread*(i%2?110:-110)
        letter.style.transform=`translate3d(${x}px,${y}px,${-spread*450}px) rotateY(${spin}deg) rotateZ(${spread*(i%2?12:-12)}deg)`
        letter.style.opacity=String(clamp(converge*5)*(1-open))
        letter.style.filter=`blur(${spread*7+open*5}px)`
      })
    }
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)}
    window.addEventListener("scroll",schedule,{passive:true});window.addEventListener("resize",schedule);media.addEventListener("change",schedule);schedule()
    return()=>{cancelAnimationFrame(frame);window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);media.removeEventListener("change",schedule)}
  },[])
  return <section ref={section} className="work-anticipation" aria-label="An introduction to selected work">
    <div className="work-anticipation__stage">
      <span className="work-anticipation__label">A few things I have designed.</span>
      <div className="work-anticipation__particles" aria-hidden="true">{Array.from({length:260},(_,i)=>{
        const angle=i*2.39996,radius=24+Math.sin(i*12.7)*9;
        return <i key={i} style={{"--x":`${50+Math.cos(angle)*radius}%`,"--y":`${50+Math.sin(angle)*radius*.7}%`,"--dx":`${Math.cos(angle)*(180+i%170)}px`,"--dy":`${Math.sin(angle)*(180+i%210)}px`,"--delay":`${-(i%37)*.17}s`} as CSSProperties}/>;
      })}</div>
      <h2 aria-label="Selected projects">{lines.map((line,l)=><span className="work-anticipation__line" key={line} aria-hidden="true">{line.split("").map((letter,i)=><span className="work-anticipation__letter" key={i} style={{"--letter":l*8+i} as CSSProperties}>{letter===" "?"\u00a0":letter}</span>)}</span>)}</h2>
      <span className="work-anticipation__caption">The work starts below.<span aria-hidden="true">&#8595;</span></span>
    </div>
  </section>
}
