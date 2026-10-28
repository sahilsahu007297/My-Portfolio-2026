import { useEffect, useRef } from "react"

// Tunnel only. The old ten-shape workflow is deliberately not part of this renderer.
export default function ParticleJourney(){
  const canvas=useRef<HTMLCanvasElement>(null)
  useEffect(()=>{
    const cv=canvas.current!,ctx=cv.getContext("2d");if(!ctx)return
    const tunnel=document.querySelector<HTMLElement>("[data-particle-tunnel]");if(!tunnel)return
    const media=matchMedia("(prefers-reduced-motion: reduce)")
    let frame=0,visible=false,last=0,progress=0,target=0
    const points=Array.from({length:2600},(_,i)=>({angle:i*2.39996,z:(i*.61803398875)%1,r:1+((i*.137)%1)*.22}))
    const render=(now:number)=>{
      frame=0;if(!visible||document.hidden)return
      const dt=Math.min(.05,(now-(last||now))/1000);last=now;progress+=(target-progress)*(media.matches?1:1-Math.exp(-dt*9))
      const w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio,1.5)
      if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h)
      const fade=Math.min(1,progress*9)*Math.min(1,(1-progress)*8)
      ctx.fillStyle="#b9edff"
      for(let layer=0;layer<2;layer++)for(const p of points){const z=((p.z-progress*(layer?2.05:2.8)+(layer?.13:0))%1+1)%1,depth=(layer?.32:.15)+z*(layer?5.2:4),radius=Math.min(w,h)*(layer?.62:.40)*p.r/depth,a=p.angle+z*.8+(layer?.09:0)
        const x=w/2+Math.cos(a)*radius+Math.sin(z*2+progress)*w*.06,y=h/2+Math.sin(a)*radius
        const size=Math.min(layer?2.4:3,(layer?1.2:1.5)/depth);ctx.fillStyle=layer?"#6097c6":"#c5f2ff";ctx.globalAlpha=fade*(layer?.5:1)*(.25+.65*(1-z));ctx.beginPath();ctx.arc(x,y,size,0,Math.PI*2);ctx.fill()
      }
      if(Math.abs(target-progress)>.0002)frame=requestAnimationFrame(render)
    }
    const wake=()=>{target=Math.max(0,Math.min(1,-tunnel.getBoundingClientRect().top/Math.max(1,tunnel.offsetHeight-innerHeight)));if(visible&&!frame){last=0;frame=requestAnimationFrame(render)}}
    const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;cv.style.opacity=visible?"1":"0";if(visible)wake();else{cancelAnimationFrame(frame);frame=0}});observer.observe(tunnel)
    window.addEventListener("scroll",wake,{passive:true});window.addEventListener("resize",wake);document.addEventListener("visibilitychange",wake);media.addEventListener("change",wake)
    return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener("scroll",wake);window.removeEventListener("resize",wake);document.removeEventListener("visibilitychange",wake);media.removeEventListener("change",wake)}
  },[])
  return <canvas ref={canvas} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 h-screen w-full bg-black"/>
}
