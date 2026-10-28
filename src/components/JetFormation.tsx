import { useEffect, useRef, type RefObject } from "react"
import { getFighterParticles } from "./fighterParticles"
import { clamp,contain,lightSprite,loadModelArtwork,smooth,type ModelArtwork,type WorkflowTimeline } from "./workflowArtwork"
import TextRevealSection from "./TextRevealSection"

export default function JetFormation({timeline,anchor}:{timeline:RefObject<WorkflowTimeline>;anchor:RefObject<HTMLDivElement|null>}){
  const root=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null)
  useEffect(()=>{
    const el=root.current!,cv=canvas.current!,ctx=cv.getContext("2d");if(!ctx)return
    const media=matchMedia("(prefers-reduced-motion: reduce)"),sprite=lightSprite()
    let frame=0,visible=false,disposed=false,loading=false,data:Float32Array|undefined,art:ModelArtwork|undefined,p=0,target=0,last=0
    const draw=(now:number)=>{
      frame=0;if(!visible||document.hidden)return
      target=media.matches?.37:Math.max(0,timeline.current.finale)
      if(timeline.current.finale<0&&!media.matches){p=0;return}
      if(!loading){loading=true;void Promise.all([getFighterParticles(),loadModelArtwork("afterburner")]).then(([jet,engine])=>{if(!disposed){data=jet;art=engine;wake()}}).catch(()=>{loading=false})}
      if(!data||!art)return
      const dt=Math.min(.05,(now-(last||now))/1000);last=now;p+=(target-p)*(media.matches?1:1-Math.exp(-dt*10))
      const w=el.clientWidth,h=el.clientHeight,dpr=Math.min(devicePixelRatio,1.4)
      if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h)
      const box=anchor.current?.getBoundingClientRect(),stage=el.getBoundingClientRect(),fit=contain(art.image,box?.width??w*.7,box?.height??h*.58)
      const engineX=(box?.left??w*.15)-stage.left+fit.x,engineY=(box?.top??h*.15)-stage.top+fit.y
      const dissolve=smooth(.015,.13,p),assembly=smooth(.10,.35,p),ignite=smooth(.39,.46,p),flight=smooth(.45,.63,p),burst=smooth(.61,.76,p)
      const scale=Math.min(w*.14,h*.19)*(1-flight*.88),tilt=.26+flight*1.2,yaw=(1-assembly)*.6,centerX=w*.5+flight*w*.05,centerY=h*.43-flight*h*.25
      if(!media.matches&&dissolve<1){ctx.globalAlpha=1-dissolve;ctx.drawImage(art.image,engineX,engineY,fit.width,fit.height)}
      const pointsCount=2000,scatter=Math.sin(assembly*Math.PI)
      for(let i=0;i<pointsCount;i++){
        const point=i*9,a=i*2.39996,source=art.points[i%art.points.length]
        const x=data[point],y=data[point+1],z=data[point+2],rx=x*Math.cos(yaw)+z*Math.sin(yaw),rz=z*Math.cos(yaw)-x*Math.sin(yaw),ry=y*Math.cos(tilt)+rz*Math.sin(tilt)
        const jetX=centerX+rx*scale,jetY=centerY-ry*scale
        const fromX=engineX+source[0]*fit.width,fromY=engineY+source[1]*fit.height
        const extra=scatter*(25+(i%29)*3),px=fromX+(jetX-fromX)*assembly+Math.cos(a+assembly*3)*extra,py=fromY+(jetY-fromY)*assembly+Math.sin(a+assembly*3)*extra
        const fieldX=w/2+Math.cos(a)*w*(.18+((i*.137)%1)*.6),fieldY=h/2+Math.sin(a)*h*(.2+((i*.231)%1)*.6)
        const size=(i<180?9:4)*(1-burst*.35),alpha=(i<180?dissolve:smooth(.17,.34,p))*(.55+(i%5)*.09)*(1-burst*.83)*(1-smooth(.83,1,p))
        ctx.globalAlpha=alpha;ctx.drawImage(sprite,px+(fieldX-px)*burst-size/2,py+(fieldY-py)*burst-size/2,size,size)
      }
      if(ignite>0&&burst<1){
        // A tapered exhaust made of light, anchored to the aircraft's nozzle.
        const nozzleY=centerY+2.25*Math.cos(tilt)*scale
        for(let i=0;i<130;i++){const age=((i*.618+p*1.7)%1),length=age*(80+flight*h*.7),spread=(3+age*age*22)*(1-flight*.3),angle=i*2.39996,size=(10+age*18)*(1-age*.45)
          ctx.globalAlpha=ignite*(1-burst)*(1-age)*.68;ctx.drawImage(sprite,centerX+Math.cos(angle)*spread-size/2,nozzleY+length-size/2,size,size)
        }
        ctx.globalAlpha=ignite*(1-burst)*.7;const glow=ctx.createRadialGradient(centerX,nozzleY,0,centerX,nozzleY,22);glow.addColorStop(0,"#e9fbff");glow.addColorStop(.25,"#6dd8ff99");glow.addColorStop(1,"#1c7dff00");ctx.fillStyle=glow;ctx.fillRect(centerX-22,nozzleY-22,44,44)
      }
      ctx.globalAlpha=1;el.style.setProperty("--jet-copy",String(smooth(.3,.37,p)*(1-smooth(.43,.5,p))))
      if(Math.abs(target-p)>.00015)frame=requestAnimationFrame(draw)
    }
    const wake=()=>{
      if(visible&&!frame){last=0;frame=requestAnimationFrame(draw)}
    }
    const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)wake();else{cancelAnimationFrame(frame);frame=0}});observer.observe(el)
    window.addEventListener("scroll",wake,{passive:true});window.addEventListener("resize",wake);media.addEventListener("change",wake);document.addEventListener("visibilitychange",wake)
    return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener("scroll",wake);window.removeEventListener("resize",wake);media.removeEventListener("change",wake);document.removeEventListener("visibilitychange",wake)}
  },[timeline,anchor])
  return <div ref={root} className="workflow-finale"><canvas ref={canvas} className="workflow-finale__canvas" aria-hidden="true"/><h2 className="workflow-finale__title">Ready for takeoff.</h2><TextRevealSection timeline={timeline}/></div>
}
