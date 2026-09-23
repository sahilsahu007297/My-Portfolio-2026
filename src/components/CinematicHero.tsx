import { useEffect, useRef, useState } from "react"
import { HoverLetters } from "./FlowText"
import MountainFlight from "./MountainFlight"
import { setPortfolioSound, playEntrySound } from "./portfolioAudio"
import "./CinematicHero.css"

const clamp=(n:number)=>Math.max(0,Math.min(1,n))
export default function CinematicHero({indiaTime,onResumeClick,onEntered}:{indiaTime:string;onResumeClick:()=>void;onEntered:()=>void}) {
  const enteredCallback=useRef(onEntered);enteredCallback.current=onEntered
  const section=useRef<HTMLElement>(null)
  const introduction=useRef<HTMLDivElement>(null)
  const progress=useRef(0)
  const enteredAt=useRef(window.portfolioEntered ? performance.now()-4000 : Infinity)
  const entry=useRef(window.portfolioEntered ? 1 : 0)
  const [phase,setPhase]=useState<"choice"|"opening"|"ready">(window.portfolioEntered ? "ready":"choice")
  const [fallback,setFallback]=useState(false)
  const soundButton=useRef<HTMLButtonElement>(null)
  useEffect(()=>{ if(phase==="choice")soundButton.current?.focus({preventScroll:true}) },[phase])
  useEffect(()=>{
    if(phase==="ready")return
    const old=document.documentElement.style.overflow
    document.documentElement.style.overflow="hidden"
    return()=>{document.documentElement.style.overflow=old}
  },[phase])
  useEffect(()=>{
    if(phase!=="opening")return
    let frame=0,start=0
    const duration=matchMedia("(prefers-reduced-motion: reduce)").matches?120:2100
    const animate=(now:number)=>{
      if(!start)start=now
      entry.current=clamp((now-start)/duration)
      if(entry.current<1)frame=requestAnimationFrame(animate)
      else {enteredAt.current=performance.now();window.portfolioEntered=true;setPhase("ready");enteredCallback.current();window.dispatchEvent(new Event("portfolio:entered"))}
    }
    frame=requestAnimationFrame(animate)
    return()=>cancelAnimationFrame(frame)
  },[phase])
  useEffect(()=>{
    let frame=0
    const update=()=>{
      frame=0
      if(!section.current)return
      const p=clamp(-section.current.getBoundingClientRect().top/Math.max(1,section.current.offsetHeight-innerHeight))
      progress.current=p
      const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches
      const out=clamp(p/.22)
      section.current.querySelectorAll<HTMLElement>(".flight-heading").forEach((heading,i)=>{
        const local=(p-(.30+i*.135))/.135
        const ready=reduced?1:clamp((performance.now()-enteredAt.current-3000)/700)
        const enter=clamp(local/.48),leave=clamp((local-.76)/.24),ease=1-Math.pow(1-enter,3)
        heading.style.opacity=String(ready*enter*enter*(1-leave))
        heading.style.transform=reduced?"none":`translate3d(0,${(1-ease)*18}px,${-1100*(1-ease)+leave*180}px)`
        heading.style.filter=reduced?"none":`blur(${(1-ease)*9+leave*3}px)`
        heading.style.visibility=local>0&&local<1?"visible":"hidden"
      })
      if(introduction.current){introduction.current.style.opacity=String(1-out);introduction.current.style.transform=`translateY(${reduced?0:-out*25}px)`;introduction.current.style.filter=`blur(${out*5}px)`}
    }
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)}
    const timer=window.setInterval(()=>{if(performance.now()-enteredAt.current<4200)schedule()},100)
    window.addEventListener("scroll",schedule,{passive:true});window.addEventListener("resize",schedule);schedule()
    return()=>{clearInterval(timer);cancelAnimationFrame(frame);window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule)}
  },[])
  const enter=(sound:boolean)=>{if(phase!=="choice")return;setPortfolioSound(sound);if(sound)void playEntrySound();setPhase("opening")}
  const goAbout=(e:React.MouseEvent)=>{e.preventDefault();const el=section.current;if(el)window.scrollTo({top:el.offsetTop+(el.offsetHeight-innerHeight)*.375,behavior:"smooth"})}
  return <section ref={section} className={`cinematic-hero ${phase==="ready"?"is-ready":""} ${phase==="choice"?"is-waiting":"is-entered"} ${fallback?"has-fallback":""}`}>
    <div className="cinematic-hero__stage">
      <header className="cinematic-nav" inert={phase!=="ready"}>
        <a href="#" aria-label="Sahil Sahu, home">Sahil Sahu</a>
        <nav aria-label="Main navigation"><a href="#about" onClick={goAbout}>About</a><a href="#contact">Contact</a><button onClick={onResumeClick}>Resume</button></nav>
        <time>{indiaTime} <span>IST</span></time>
      </header>
      <div className="cinematic-hero__surface">
        <MountainFlight progress={progress} entry={entry} onUnavailable={()=>setFallback(true)} />
        <div className="cinematic-hero__veil" />
        <div className="cinematic-hero__entrance">
          <div ref={introduction} className="cinematic-hero__intro">
            <p className="cinematic-eyebrow">UX designer & creative thinker</p>
            <h1>I'm Sahil Sahu.</h1>
            <p className="cinematic-hero__description"><HoverLetters>I design at the intersection of people, problems, and possibility. A UX designer who likes complex problems, breaks them apart and reaches to a conclusion no matter what.</HoverLetters></p>
            <span className="cinematic-hero__scroll">Scroll to explore <span aria-hidden="true">↓</span></span>
          </div>
        </div>
        <div className="flight-headings" aria-label="My approach to design">
          {[
            {title:"UX Designer & Strategist",copy:"I connect what people need with what a product can become. Turning complex questions into clear, purposeful experiences."},
            {title:"I find the way forward",copy:"From uncertainty to a direction worth pursuing."},
            {title:"Problem solver",copy:"Untangling the complex. Making room for the possible."},
            {title:"Critical thinker",copy:"Questioning assumptions to uncover what really matters."},
            {title:"Clarity through curiosity",copy:"Better questions. Thoughtful decisions. Meaningful design."},
          ].map((point,i)=><div id={i===0?"about":undefined} className="flight-heading" key={point.title}>
            <h2>{point.title}</h2><p>{point.copy}</p>
          </div>)}
        </div>
        {phase!=="ready" && <div className={`particle-entry ${phase==="opening"?"is-opening":""}`} role="dialog" aria-modal="true" aria-label="Choose your portfolio experience" data-lenis-prevent>
          <button ref={soundButton} className="particle-entry__sound" onClick={()=>enter(true)} disabled={phase!=="choice"} aria-label="Enter with sound">
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M6 13h5l6-5v16l-6-5H6z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M21 11c3 3 3 7 0 10m4-14c5 5 5 13 0 18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            <span>Enter with sound</span>
          </button>
          <button className="particle-entry__quiet" onClick={()=>enter(false)} disabled={phase!=="choice"}>Enter without sound</button>
        </div>}
      </div>
    </div>
  </section>
}

