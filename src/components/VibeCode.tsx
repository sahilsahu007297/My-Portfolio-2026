import { useEffect, useRef, useState, useId } from "react"
import "./VibeCode.css"

const modes = ["Interface", "Motion", "System"] as const
export default function VibeCode() {
  const section = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [mode, setMode] = useState(0)
  const [paused, setPaused] = useState(false)
  const [revision, setRevision] = useState(0)
  const state = useRef({mode, paused, revision})
  state.current = {mode, paused, revision}
  const label = useId()
  useEffect(() => {
    const el=section.current!, surface=canvas.current!, ctx=surface.getContext("2d")
    if(!ctx)return
    const reduced=matchMedia("(prefers-reduced-motion: reduce)")
    let w=0,h=0,frame=0,visible=false,last=0,time=0,currentMode=-1,currentRevision=-1,burst=0
    let pointer={x:-9999,y:-9999}, points:{x:number;y:number;tx:number;ty:number;seed:number}[]=[]
    const count=1300
    const targets=(kind:number)=>{
      const paths:number[][]=[]
      const line=(x1:number,y1:number,x2:number,y2:number,n=55)=>{for(let i=0;i<n;i++){const t=i/(n-1);paths.push([x1+(x2-x1)*t,y1+(y2-y1)*t])}}
      const rect=(x:number,y:number,rw:number,rh:number)=>{line(x,y,x+rw,y);line(x+rw,y,x+rw,y+rh);line(x+rw,y+rh,x,y+rh);line(x,y+rh,x,y)}
      if(kind===0){
        rect(-.37,-.28,.74,.56);line(-.37,-.20,.37,-.20);rect(-.31,-.13,.19,.33);rect(-.06,-.13,.36,.13)
        for(let i=0;i<3;i++)line(-.06,.07+i*.055,.25-i*.04,.07+i*.055)
        for(let i=0;i<3;i++){for(let j=0;j<30;j++){const a=j/30*Math.PI*2;paths.push([-.32+i*.035+Math.cos(a)*.007,-.24+Math.sin(a)*.007])}}
      }else if(kind===1){
        for(let row=0;row<17;row++)for(let j=0;j<85;j++){const x=j/84*.8-.4;paths.push([x,Math.sin(x*10+row*.19)*.13+(row-8)*.018])}
      }else{
        const nodes=[[-.28,-.18],[.28,-.18],[0,.06],[-.28,.27],[.28,.27]]
        for(const [x,y] of nodes){rect(x-.055,y-.045,.11,.09);line(x,y,0,.06)}
        for(let j=0;j<260;j++){const a=j/260*Math.PI*2;paths.push([Math.cos(a)*.39,Math.sin(a)*.34])}
      }
      return paths
    }
    const draw=(now:number)=>{
      frame=0;if(!visible||document.hidden||!w||!h)return
      const dt=Math.min(.05,(now-(last||now))/1000);last=now
      const still=reduced.matches||state.current.paused
      if(!still)time+=dt
      if(currentMode!==state.current.mode||currentRevision!==state.current.revision){
        currentMode=state.current.mode;currentRevision=state.current.revision
        const shape=targets(currentMode),size=Math.min(w*.98,h*1.18)
        points=Array.from({length:count},(_,i)=>{
          const target=shape[Math.floor(i/count*shape.length)],old=points[i]
          return {x:old?.x??w/2+Math.cos(i*2.399)*size*.65,y:old?.y??h/2+Math.sin(i*2.399)*size*.65,tx:w/2+target[0]*size,ty:h/2+target[1]*size,seed:(i*.6180339)%1}
        })
        burst=still?0:1
      }
      ctx.clearRect(0,0,w,h)
      const bounds=el.getBoundingClientRect(),arrival=Math.max(0,Math.min(1,(innerHeight-bounds.top)/(innerHeight*.65)))
      const spread=still?0:(1-arrival)*.7+burst*.18
      burst*=Math.exp(-dt*4)
      // Perspective lattice: a restrained stage for the freely moving particles.
      ctx.strokeStyle="#9ccfc914";ctx.lineWidth=.7
      for(let j=0;j<8;j++){ctx.beginPath();ctx.moveTo(w/2+(j-3.5)*w*.045,h*.65);ctx.lineTo(w/2+(j-3.5)*w*.18,h);ctx.stroke()}
      for(let j=0;j<5;j++){const y=h*.66+j*j*h*.018;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
      for(const p of points){
        const angle=p.seed*Math.PI*18
        let tx=p.tx+Math.cos(angle)*w*spread,ty=p.ty+Math.sin(angle)*h*spread
        if(!still){
          if(currentMode===1)ty+=Math.sin(p.tx/w*12-time*1.4+p.seed*.3)*h*.035
          else {tx+=Math.sin(time*.6+angle)*1.6;ty+=Math.cos(time*.7+angle)*1.6}
          const dx=tx-pointer.x,dy=ty-pointer.y,d=Math.hypot(dx,dy),force=Math.exp(-d*d/5500)*23
          if(d>0){tx+=dx/d*force;ty+=dy/d*force}
        }
        const follow=still?1:1-Math.exp(-dt*7)
        p.x+=(tx-p.x)*follow;p.y+=(ty-p.y)*follow
        ctx.fillStyle=p.seed>.92?"#f1e4c6":`rgba(160,216,208,${.35+p.seed*.55})`
        ctx.beginPath();ctx.arc(p.x,p.y,p.seed>.94?1.7:.8,0,Math.PI*2);ctx.fill()
      }
      if(!still)frame=requestAnimationFrame(draw)
    }
    const wake=()=>{if(!frame&&visible&&!document.hidden){last=0;frame=requestAnimationFrame(draw)}}
    const resize=new ResizeObserver(()=>{const r=surface.getBoundingClientRect();w=r.width;h=r.height;const dpr=Math.min(devicePixelRatio,1.5);surface.width=w*dpr;surface.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);currentMode=-1;wake()});resize.observe(surface)
    const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;el.dataset.visible=String(visible);if(visible)wake();else{cancelAnimationFrame(frame);frame=0}},{threshold:.05});observer.observe(el)
    const move=(e:PointerEvent)=>{const r=surface.getBoundingClientRect();pointer={x:e.clientX-r.left,y:e.clientY-r.top};wake()}
    const leave=()=>{pointer={x:-9999,y:-9999}}
    surface.addEventListener("pointermove",move);surface.addEventListener("pointerleave",leave)
    el.addEventListener("vibe:update",wake);document.addEventListener("visibilitychange",wake);reduced.addEventListener("change",wake)
    return()=>{cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();surface.removeEventListener("pointermove",move);surface.removeEventListener("pointerleave",leave);el.removeEventListener("vibe:update",wake);document.removeEventListener("visibilitychange",wake);reduced.removeEventListener("change",wake)}
  },[])
  useEffect(()=>{section.current?.dispatchEvent(new Event("vibe:update"))},[mode,paused,revision])
  return <section ref={section} className="vibe-code" aria-labelledby={label}>
    <div className="vibe-code__masthead"><span><i /> A little less predictable</span><span>Design intuition / working code</span></div>
    <div className="vibe-code__layout">
      <div className="vibe-code__intro">
        <span className="vibe-code__overline">Some ideas need to be built.</span>
        <h2 id={label}>I also<br/><span>vibe code<span className="vibe-code__dot">.</span></span></h2>
        <p>I follow a curious idea past the mockup. Into a prototype you can touch, a small tool you can use, or an interaction that makes you look twice.</p>
        <div className="vibe-code__signature"><span aria-hidden="true">&#123; &#125;</span><span>Think it. Build it.<br/>See what happens.</span></div>
      </div>
      <div className="vibe-code__experiment">
        <div className="vibe-code__screen-top"><span>LIVE EXPERIMENT / {String(mode+1).padStart(2,"0")}</span><button onClick={()=>setPaused(!paused)} aria-pressed={paused}>{paused?"Resume motion":"Pause motion"}</button></div>
        <canvas ref={canvas} aria-hidden="true" />
        <div className="vibe-code__floating-label" aria-hidden="true"><span>idea</span><i/><span>{modes[mode].toLowerCase()}</span></div>
        <div className="vibe-code__controls" role="group" aria-label="Choose a particle experiment">{modes.map((name,i)=><button key={name} aria-pressed={mode===i} onClick={()=>setMode(i)}>{name}</button>)}<button className="vibe-code__rebuild" onClick={()=>setRevision(v=>v+1)} aria-label="Rebuild the particle experiment">&#8635;</button></div>
        <p className="vibe-code__hint" aria-live="polite">{modes[mode]} study. Switch modes, explore the particles, or rebuild.</p>
      </div>
    </div>
    <div className="vibe-code__footer"><span>Curiosity is the starting point. Craft is the follow-through.</span><span>Always a work in progress <span aria-hidden="true">&#8599;</span></span></div>
  </section>
}
