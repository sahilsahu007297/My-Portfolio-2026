import { useEffect, useRef, useState, type CSSProperties } from "react"
import { PROJECTS, POSTERS } from "./WorkList"
import { getFighterParticles } from "./fighterParticles"
import { flightRoute, waypoint, MAP_TILE, makeMapTile } from "./flightMapModel"
import ProjectModal from "./ProjectModal"
import "./FlightExperience.css"
const clamp=(x:number)=>Math.max(0,Math.min(1,x))
const ease=(x:number)=>{const p=clamp(x);return p*p*(3-2*p)}

export default function ProjectFlightMap(){
  const root=useRef<HTMLElement>(null),canvas=useRef<HTMLCanvasElement>(null),panel=useRef<HTMLElement>(null),markers=useRef<(HTMLButtonElement|null)[]>([])
  const [active,setActive]=useState(0),[selected,setSelected]=useState<number|null>(null),activeRef=useRef(0)
  useEffect(()=>{
    const el=root.current!,cv=canvas.current!,ctx=cv.getContext("2d");if(!ctx)return
    const media=matchMedia("(prefers-reduced-motion: reduce)"),tiles=new Map<string,HTMLCanvasElement>()
    let frame=0,visible=false,disposed=false,last=0,smooth=-1,target=-1,jet:Float32Array|undefined,cameraX=0,cameraY=-100
    const render=(now:number)=>{
      frame=0;if(!visible||document.hidden)return
      const dt=Math.min(.05,(now-(last||now))/1000);last=now
      smooth+=(target-smooth)*(media.matches?1:1-Math.exp(-dt*8))
      const w=cv.clientWidth,h=cv.clientHeight,dpr=Math.min(devicePixelRatio,1.5),scale=Math.min(1.25,Math.max(.7,w/1350)),mobile=w<768
      if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}
      const ship=flightRoute(smooth),ahead=flightRoute(smooth+.008),behind=flightRoute(smooth-.008),bearing=Math.atan2(ahead.y-behind.y,ahead.x-behind.x)
      const desiredX=ship.x*.62,desiredY=Math.max(-100,ship.y),follow=media.matches?1:1-Math.exp(-dt*5)
      cameraX+=(desiredX-cameraX)*follow;cameraY+=(desiredY-cameraY)*follow
      const rotation=media.matches?0:Math.sin(smooth*.55)*.055,cos=Math.cos(rotation),sin=Math.sin(rotation),originX=w*(mobile?.5:.43),originY=h*(mobile?.34:.53)
      const screen=(x:number,y:number)=>({x:originX+((x-cameraX)*cos-(y-cameraY)*sin)*scale,y:originY+((x-cameraX)*sin+(y-cameraY)*cos)*scale*.94})
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle="#131719";ctx.fillRect(0,0,w,h)
      ctx.save();ctx.translate(originX,originY);ctx.scale(scale,scale*.94);ctx.rotate(rotation);ctx.translate(-cameraX,-cameraY)
      const minX=Math.floor((cameraX-originX/scale-100)/MAP_TILE),maxX=Math.ceil((cameraX+(w-originX)/scale+100)/MAP_TILE),minY=Math.floor((cameraY-originY/scale/.94-100)/MAP_TILE),maxY=Math.ceil((cameraY+(h-originY)/scale/.94+100)/MAP_TILE),needed=new Set<string>()
      for(let y=minY;y<maxY;y++)for(let x=minX;x<maxX;x++){const key=`${x},${y}`;needed.add(key);if(!tiles.has(key))tiles.set(key,makeMapTile(x,y));ctx.drawImage(tiles.get(key)!,x*MAP_TILE,y*MAP_TILE)}
      for(const key of tiles.keys())if(!needed.has(key))tiles.delete(key)
      ctx.strokeStyle="#82a7c523";ctx.lineWidth=1.2;ctx.setLineDash([3,10]);ctx.beginPath()
      for(let t=Math.max(-1,smooth-2);t<=Math.min(PROJECTS.length,smooth+3);t+=.025){const p=flightRoute(t);t===Math.max(-1,smooth-2)?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)}ctx.stroke();ctx.setLineDash([])
      const start=Math.max(-1,smooth-1.5)
      for(let layer=0;layer<3;layer++){ctx.beginPath();for(let t=start;t<smooth;t+=.012){const p=flightRoute(t);t===start?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)}ctx.lineTo(ship.x,ship.y);ctx.strokeStyle=["#168cff28","#338fff","#b9e7ff"][layer];ctx.lineWidth=[17,4,1.1][layer];ctx.shadowColor="#148fff";ctx.shadowBlur=layer===0?14:0;ctx.stroke()}
      ctx.shadowBlur=0;ctx.restore()
      markers.current.forEach((marker,i)=>{if(!marker)return;const pos=waypoint(i),p=screen(pos.x,pos.y);marker.style.transform=`translate(${p.x}px,${p.y}px) translate(-50%,-50%)`;marker.style.visibility=p.y>60&&p.y<h-45?"visible":"hidden"})
      const sp=screen(ship.x,ship.y)
      ctx.save();ctx.translate(sp.x,sp.y);ctx.rotate(bearing+rotation+Math.PI/2)
      const halo=ctx.createRadialGradient(0,0,0,0,0,32);halo.addColorStop(0,"#2787ff42");halo.addColorStop(1,"#2787ff00");ctx.fillStyle=halo;ctx.fillRect(-32,-32,64,64)
      if(jet){ctx.fillStyle="#edf9ff";ctx.beginPath();for(let i=0;i<jet.length;i+=12){const x=jet[i]*6.6,y=-jet[i+1]*6.6;ctx.moveTo(x+.6,y);ctx.arc(x,y,.6,0,Math.PI*2)}ctx.fill()}
      else{ctx.fillStyle="#eefaff";ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(13,13);ctx.lineTo(0,7);ctx.lineTo(-13,13);ctx.closePath();ctx.fill()}
      ctx.restore()
      const arrived=Math.abs(smooth-activeRef.current)<.045,arrival=media.matches?1:arrived?1:0
      if(panel.current){panel.current.style.opacity=String(arrival);panel.current.style.transform=`translateY(${arrival?0:35}px)`;panel.current.inert=!arrival}
      if(Math.abs(target-smooth)>.0002||Math.abs(cameraX-desiredX)+Math.abs(cameraY-desiredY)>.08)frame=requestAnimationFrame(render)
    }
    const wake=()=>{
      const p=clamp(-el.getBoundingClientRect().top/Math.max(1,el.offsetHeight-innerHeight))*PROJECTS.length,index=Math.min(PROJECTS.length-1,Math.floor(p)),local=p>=PROJECTS.length?1:p-index
      target=index-1+ease(local/.62)
      if(index!==activeRef.current){activeRef.current=index;setActive(index)}
      if(visible&&!frame){last=0;frame=requestAnimationFrame(render)}
    }
    const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible){if(!jet)void getFighterParticles().then(result=>{if(!disposed){jet=result;wake()}});wake()}else{cancelAnimationFrame(frame);frame=0}},{rootMargin:"150px"});observer.observe(cv)
    window.addEventListener("scroll",wake,{passive:true});window.addEventListener("resize",wake);media.addEventListener("change",wake);document.addEventListener("visibilitychange",wake)
    return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();tiles.clear();window.removeEventListener("scroll",wake);window.removeEventListener("resize",wake);media.removeEventListener("change",wake);document.removeEventListener("visibilitychange",wake)}
  },[])
  const go=(i:number)=>{const el=root.current!;window.scrollTo({top:scrollY+el.getBoundingClientRect().top+(el.offsetHeight-innerHeight)*(i+.78)/PROJECTS.length,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"})}
  const project=PROJECTS[active]
  return <><section ref={root} id="projects" className="project-flight" style={{"--destinations":PROJECTS.length} as CSSProperties} aria-label="Selected projects flight map"><div className="project-flight__stage">
    <canvas ref={canvas} aria-hidden="true"/><div className="map-vignette"/>
    <header className="map-heading"><span>SELECTED WORK</span><h2>Ideas. Out in the world.</h2><p>Follow the journey. Explore the work.</p></header>
    <div className="map-waypoints">{PROJECTS.map((p,i)=><button key={p.num} ref={el=>{markers.current[i]=el}} className={`map-waypoint ${active===i?"is-active":""}`} onClick={()=>go(i)} aria-label={`Fly to ${p.title}`} aria-current={active===i?"true":undefined}><i/>{active===i&&<img src={POSTERS[i]} alt=""/>}<span>{p.title}</span></button>)}</div>
    <article ref={panel} className="flight-project" aria-label={project.title}><span className="flight-project__number">{project.num} / {project.kind}</span><img src={POSTERS[active]} alt={`${project.title} mockup`} decoding="async"/><h3>{project.title}</h3><p>{project.blurb}</p><button onClick={()=>setSelected(active)}>Explore project <span aria-hidden="true">&#8599;</span></button></article>
    <footer className="flight-map-footer"><span>{String(active+1).padStart(2,"0")} / {String(PROJECTS.length).padStart(2,"0")}</span><nav aria-label="Project destinations">{PROJECTS.map((p,i)=><button key={p.num} onClick={()=>go(i)} aria-label={`Fly to ${p.title}`} aria-current={active===i?"true":undefined}/>)}</nav><span>SCROLL TO FLY &#8595;</span></footer>
  </div></section>{selected!==null&&<ProjectModal projectId={PROJECTS[selected].num} summary={PROJECTS[selected].blurb} poster={POSTERS[selected]} onClose={()=>setSelected(null)}/>}</>
}
