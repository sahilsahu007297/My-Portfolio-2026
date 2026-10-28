import { useEffect, useRef, type RefObject } from "react"
import { smooth,clamp,type WorkflowTimeline } from "./workflowArtwork"
import "./TextRevealSection.css"
const COPY="Nothing takes flight by accident. I turn real problems into clear direction, thoughtful products, and experiences that move people forward. Every question, every prototype, every small decision brings a better outcome closer."
const WORDS=COPY.split(" ")
export default function TextRevealSection({timeline}:{timeline:RefObject<WorkflowTimeline>}){
  const root=useRef<HTMLDivElement>(null),words=useRef<(HTMLSpanElement|null)[]>([])
  useEffect(()=>{
    const el=root.current!,media=matchMedia("(prefers-reduced-motion: reduce)");let frame=0
    const update=()=>{frame=0
      const p=media.matches?1:timeline.current.finale,entrance=media.matches?1:smooth(.69,.86,p),reading=media.matches?1:clamp((p-.81)/.19)
      el.style.opacity=String(entrance);el.style.transform=`translateY(${(1-entrance)*85}vh)`;el.style.visibility=entrance>0?"visible":"hidden"
      words.current.forEach((word,i)=>{if(!word)return
        const t=reading*(WORDS.length+5)-i,settle=clamp((t-1.2)/2.1),hot=Math.max(0,1-Math.abs(t-.7)/1.5)
        const muted=[72,87,94],accent=i%3?[255,166,99]:[111,221,255],white=[237,242,239]
        const color=muted.map((c,k)=>(c+(accent[k]-c)*hot)*(1-settle)+white[k]*settle)
        word.style.color=`rgb(${color.map(Math.round).join(",")})`
        word.style.textShadow=hot>.05?`0 0 ${hot*12}px ${i%3?"#ffa66322":"#6fddff22"}`:"none"
      })
    }
    const wake=()=>{if(!frame)frame=requestAnimationFrame(update)}
    window.addEventListener("scroll",wake,{passive:true});window.addEventListener("resize",wake);media.addEventListener("change",wake);wake()
    return()=>{cancelAnimationFrame(frame);window.removeEventListener("scroll",wake);window.removeEventListener("resize",wake);media.removeEventListener("change",wake)}
  },[timeline])
  return <div ref={root} className="flight-manifesto" aria-label="Nothing takes flight by accident"><h2>{WORDS.map((word,i)=><span key={i} ref={el=>{words.current[i]=el}}>{word}{" "}</span>)}</h2></div>
}
