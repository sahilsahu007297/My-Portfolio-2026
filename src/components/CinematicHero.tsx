import { useEffect, useRef, useState } from "react"
import MountainFlight from "./MountainFlight"
import { setPortfolioSound, playEntrySound } from "./portfolioAudio"
import "./CinematicHero.css"

const clamp=(n:number)=>Math.max(0,Math.min(1,n))
export default function CinematicHero({indiaTime,onResumeClick,onEntered,onEntryProgress}:{indiaTime:string;onResumeClick:()=>void;onEntered:()=>void;onEntryProgress:(opacity:number)=>void}) {
  const enteredCallback=useRef(onEntered);enteredCallback.current=onEntered
  const progressCallback=useRef(onEntryProgress);progressCallback.current=onEntryProgress
  const section=useRef<HTMLElement>(null)
  const stage=useRef<HTMLDivElement>(null)
  const introduction=useRef<HTMLDivElement>(null)
  const progress=useRef(0)
  const enteredAt=useRef(window.portfolioEntered ? performance.now()-4000 : Infinity)
  const entry=useRef(window.portfolioEntered ? 1 : 0)
  const [phase,setPhase]=useState<"choice"|"opening"|"ready">(window.portfolioEntered ? "ready":"choice")
  const [fallback,setFallback]=useState(false)
  const [sceneReady,setSceneReady]=useState(false)
  const soundButton=useRef<HTMLButtonElement>(null)
  useEffect(()=>{ if(phase==="choice")soundButton.current?.focus({preventScroll:true}) },[phase])
  useEffect(()=>{
    if(phase==="ready")return
    const old=document.documentElement.style.overflow
    document.documentElement.style.overflow="hidden"
    return()=>{document.documentElement.style.overflow=old}
  },[phase])
  useEffect(()=>{
    if(phase!=="opening"||!sceneReady)return
    let frame=0,start=0
    const duration=matchMedia("(prefers-reduced-motion: reduce)").matches?120:3400
    const animate=(now:number)=>{
      if(!start)start=now
      entry.current=clamp((now-start)/duration)
      // The terrain, navigation, typography and sound control share this exact timeline.
      const reveal=matchMedia("(prefers-reduced-motion: reduce)").matches?entry.current:clamp((entry.current-.15)/.85)
      progressCallback.current(reveal)
      if(entry.current<1)frame=requestAnimationFrame(animate)
      else {enteredAt.current=performance.now();window.portfolioEntered=true;setPhase("ready");enteredCallback.current();window.dispatchEvent(new Event("portfolio:entered"))}
    }
    frame=requestAnimationFrame(animate)
    return()=>cancelAnimationFrame(frame)
  },[phase,sceneReady])
  useEffect(()=>{
    let frame=0
    const update=()=>{
      frame=0
      if(!section.current)return
      const p=clamp(-section.current.getBoundingClientRect().top/Math.max(1,section.current.offsetHeight-innerHeight))
      progress.current=p
      const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches
      if(reduced||section.current.classList.contains("has-fallback")){
        if(stage.current){stage.current.style.opacity="1";stage.current.style.visibility="visible"}
        if(introduction.current){introduction.current.style.opacity="1";introduction.current.style.transform="none";introduction.current.style.filter="none"}
        section.current.style.setProperty("--summit-scroll","0px")
        section.current.style.setProperty("--name-bury","0")
        section.current.style.setProperty("--name-opacity","1")
        section.current.style.setProperty("--sahu-drop","0px")
        return
      }
      const out=clamp(p/.12)
      section.current.style.setProperty("--hero-intro-opacity",String(1-out))
      section.current.style.setProperty("--name-bury",String(clamp((p-.008)/.05)))
      section.current.style.setProperty("--name-opacity","1")
      section.current.style.setProperty("--summit-scroll",`${p*1200}px`)
      section.current.style.setProperty("--sahu-drop",`${clamp(p/.15)*innerHeight*.48}px`)
      // Dissolve the pinned viewport before its containing section can slide away.
      const handoff=clamp((p-.925)/.07)
      if(stage.current){stage.current.style.opacity=String(1-handoff*handoff*(3-2*handoff));stage.current.style.visibility=handoff>=1?"hidden":"visible"}
      if(introduction.current){introduction.current.style.opacity=String(1-clamp((p-.045)/.115));introduction.current.style.transform="none";introduction.current.style.filter="none"}
    }
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)}
    const timer=window.setInterval(()=>{if(performance.now()-enteredAt.current<4200)schedule()},100)
    window.addEventListener("scroll",schedule,{passive:true});window.addEventListener("resize",schedule);schedule()
    return()=>{clearInterval(timer);cancelAnimationFrame(frame);window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule)}
  },[])
  const enter=(sound:boolean)=>{if(phase!=="choice")return;setPortfolioSound(sound);if(sound)void playEntrySound();setPhase("opening")}
  const goAbout=(e:React.MouseEvent)=>{e.preventDefault();const el=section.current;if(el)window.scrollTo({top:el.offsetTop+(el.offsetHeight-innerHeight)*.375,behavior:"smooth"})}
  return <section ref={section} className={`cinematic-hero ${phase==="ready"?"is-ready":""} ${phase==="choice"?"is-waiting":"is-entered"} ${fallback?"has-fallback":""} ${sceneReady&&!fallback?"has-three-summit":""}`}>
    <div ref={stage} className="cinematic-hero__stage">
      <header className="cinematic-nav" inert={phase!=="ready"}>
        <a href="#" aria-label="Sahil Sahu, home">Sahil Sahu</a>
        <nav aria-label="Main navigation"><a href="#about" onClick={goAbout}>About</a><a href="#contact">Contact</a><button onClick={onResumeClick}>Resume</button></nav>
        <time>{indiaTime} <span>IST</span></time>
      </header>
      <div className="cinematic-hero__surface">
        <div className="hero-name-back hero-name-back--front" aria-hidden="true">{"Sahil".split("").map((letter,i)=><span key={i}>{letter}</span>)}</div>
        <div className="hero-name-back hero-name-back--occluded" aria-hidden="true">{"Sahil".split("").map((letter,i)=><span key={i}>{letter}</span>)}</div>
        <MountainFlight progress={progress} entry={entry} onReady={()=>setSceneReady(true)} onUnavailable={()=>{setFallback(true);setSceneReady(true)}} />
        <div className="cinematic-hero__veil" />
        <div className="cinematic-hero__entrance">
          <div ref={introduction} className="cinematic-hero__intro">
            <div className="cinematic-hero__caption-row">
              <span className="cinematic-hero__role">Product designer &amp; strategist</span>
              <p className="cinematic-eyebrow">Clarity for people. Momentum for businesses.</p>
            </div>
            <h1 aria-label="Sahil Sahu"><span className="summit-name summit-name--back">Sahil</span><span className="summit-name summit-name--front">{"Sahu".split("").map((letter,i)=><span key={i}>{letter}</span>)}</span></h1>
            <span className="summit-coordinate">A DIFFERENT PERSPECTIVE / 2026</span>
            <span className="cinematic-hero__scroll">Scroll to explore <span>&darr;</span></span>
          </div>
        </div>
        <div className="flight-headings" aria-label="My approach to design">
          {[
            {title:"Hi, I'm Sahil. I design products.",copy:"I turn a better-way hunch into something people can actually use."},
            {title:"Professional overthinker. Useful outcome.",copy:"I ask one more why so your users don't have to ask how."},
            {title:"Pretty is the opening line.",copy:"The real conversation is about what people need, where they get stuck, and what helps them move forward."},
            {title:"People first. Business in the picture.",copy:"I connect user needs with business goals, then make the trade-offs count."},
            {title:"Curiosity in. Clarity out.",copy:"From research and product strategy to the smallest interaction, I make complex products feel considered and simple."},
          ].map((point,i)=><div id={i===0?"about":undefined} className="flight-heading" key={point.title}>
            <h2>{point.title}</h2><p>{point.copy}</p>
          </div>)}
        </div>
        {phase!=="ready" && <div className={`particle-entry ${phase==="opening"?"is-opening":""}`} role="dialog" aria-modal="true" aria-label="Choose your portfolio experience" data-lenis-prevent>
          <p className="particle-entry__identity">SAHIL SAHU / SELECTED WORK</p>
          <p className="particle-entry__overline">A little curiosity. A whole new perspective.</p>
          <div className="particle-entry__choices">
            <button ref={soundButton} onClick={()=>enter(true)} disabled={phase!=="choice"}>Enter with sound <span aria-hidden="true">&#8599;</span></button>
            <button onClick={()=>enter(false)} disabled={phase!=="choice"}>Enter without sound <span aria-hidden="true">&#8599;</span></button>
          </div>
        </div>}
      </div>
    </div>
  </section>
}

