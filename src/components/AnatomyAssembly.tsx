import { useEffect,useRef,type RefObject } from "react"
import { contain,lightSprite,loadModelArtwork,smooth,type ModelArtwork,type WorkflowTimeline } from "./workflowArtwork"

export default function AnatomyAssembly({name,index,timeline,alt}:{name:string;index:number;timeline:RefObject<WorkflowTimeline>;alt:string}){
  const root=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null)
  useEffect(()=>{
    const el=root.current!,cv=canvas.current!,ctx=cv.getContext("2d");if(!ctx)return
    const media=matchMedia("(prefers-reduced-motion: reduce)"),sprite=lightSprite();let disposed=false,visible=false,frame=0,art:ModelArtwork|undefined
    const draw=()=>{frame=0;if(!visible||!art||document.hidden)return
      const w=el.clientWidth,h=el.clientHeight,dpr=Math.min(devicePixelRatio,1.5)
      if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h)
      const form=media.matches?1:smooth(-.06,.30,timeline.current.local),fit=contain(art.image,w,h)
      // Reveal the real model under expanding arrival points; geometry never changes.
      ctx.save();ctx.globalAlpha=smooth(.12,.72,form)
      if(form<.96){ctx.beginPath();for(const [x,y] of art.points){const px=fit.x+x*fit.width,py=fit.y+y*fit.height,r=Math.max(1,form*form*Math.max(w,h)*.14);ctx.moveTo(px+r,py);ctx.arc(px,py,r,0,Math.PI*2)}ctx.clip()}
      ctx.drawImage(art.image,fit.x,fit.y,fit.width,fit.height);ctx.restore()
      if(form<1){for(let i=0;i<art.points.length;i++){const [x,y,brightness]=art.points[i],angle=i*2.39996+(1-form)*(index%2?2:-2),radius=(1-form)*(w*.28+(i%17)*9)
        const px=fit.x+x*fit.width+Math.cos(angle)*radius,py=fit.y+y*fit.height+Math.sin(angle)*radius,size=9+brightness*5
        ctx.globalAlpha=(1-smooth(.68,1,form))*(.65+brightness*.35);ctx.drawImage(sprite,px-size/2,py-size/2,size,size)
      }}ctx.globalAlpha=1;el.dataset.ready="true"
    }
    const wake=()=>{if(visible&&!frame)frame=requestAnimationFrame(draw)}
    void loadModelArtwork(name).then(result=>{if(!disposed){art=result;wake()}}).catch(()=>{/* The real image remains the accessible fallback. */})
    const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)wake();else{cancelAnimationFrame(frame);frame=0}});observer.observe(el)
    const resize=new ResizeObserver(wake);resize.observe(el)
    window.addEventListener("scroll",wake,{passive:true});media.addEventListener("change",wake);document.addEventListener("visibilitychange",wake)
    return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();resize.disconnect();window.removeEventListener("scroll",wake);media.removeEventListener("change",wake);document.removeEventListener("visibilitychange",wake)}
  },[name,index,timeline])
  return <div ref={root} className="anatomy-assembly"><img src={`/workflow-models/${name}.webp`} alt={alt} width="760" height="460" decoding="async"/><canvas ref={canvas} aria-hidden="true"/></div>
}
