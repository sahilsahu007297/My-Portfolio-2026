import { useEffect, useRef } from "react"
import "./RippleCursor.css"

// React adaptation of the supplied MorphCursor.vue and LiquidWave.vue.
// The simulated surface normals displace the live browser backdrop: text,
// images, video and WebGL all refract without replacing them with screenshots.
export default function RippleCursor() {
  const mark=useRef<HTMLCanvasElement>(null),waves=useRef<HTMLCanvasElement>(null)
  const lens=useRef<HTMLDivElement>(null),mapImage=useRef<SVGFEImageElement>(null)
  useEffect(()=>{
    const cursor=mark.current!,canvas=waves.current!
    const ctx=cursor.getContext("2d"),water=canvas.getContext("2d")
    if(!ctx||!water)return
    const mapCanvas=document.createElement("canvas"),mapContext=mapCanvas.getContext("2d")!
    let displacement:ImageData
    const reduced=matchMedia("(prefers-reduced-motion: reduce)"),fine=matchMedia("(hover: hover) and (pointer: fine)")
    let w=0,h=0,pressure=new Float32Array(),next=new Float32Array(),velocity=new Float32Array(),pixels:ImageData
    let frame=0,last=0,accumulator=0,activeUntil=0,injectUntil=0,rotation=0,seen=false
    let mx=0,my=0,sx=0,sy=0,speed=0,lastMove=0,hover=false
    const enabled=()=>fine.matches&&!reduced.matches
    const resize=()=>{
      w=Math.ceil(innerWidth/4);h=Math.ceil(innerHeight/4);canvas.width=w;canvas.height=h
      pressure=new Float32Array(w*h);next=new Float32Array(w*h);velocity=new Float32Array(w*h);pixels=water.createImageData(w,h)
      mapCanvas.width=w;mapCanvas.height=h;displacement=mapContext.createImageData(w,h)
      for(let i=0;i<w*h;i++){displacement.data[i*4]=128;displacement.data[i*4+1]=128;displacement.data[i*4+3]=255}
      mapContext.putImageData(displacement,0,0);mapImage.current?.setAttribute("href",mapCanvas.toDataURL())
      mapImage.current?.setAttribute("width",String(innerWidth));mapImage.current?.setAttribute("height",String(innerHeight))
      const filter=mapImage.current?.parentElement;filter?.setAttribute("width",String(innerWidth));filter?.setAttribute("height",String(innerHeight))
      if(lens.current)lens.current.style.display="none"
      const dpr=Math.min(devicePixelRatio,1.5);cursor.width=Math.round(64*dpr);cursor.height=Math.round(64*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)
    }
    const render=(now:number)=>{
      frame=0;if(!enabled()||document.hidden)return
      const dt=Math.min((now-(last||now-16.67))/1000,.05);last=now;accumulator+=dt
      const follow=1-Math.exp(-dt*24);sx+=(mx-sx)*follow;sy+=(my-sy)*follow;speed*=Math.exp(-dt*8)
      rotation+=dt*(.55+speed*.018)
      ctx.clearRect(0,0,64,64);ctx.save();ctx.translate(32,32);ctx.rotate(rotation*.6)
      ctx.strokeStyle="rgba(102,128,134,.94)";ctx.lineWidth=1.65;ctx.beginPath()
      const lobes=4+Math.sin(rotation*.5)*2.4,radius=7+(hover?1.4:0)+Math.min(1.5,speed*.045)
      for(let i=0;i<=64;i++){const a=i/64*Math.PI*2,r=radius*(.65+.35*Math.abs(Math.sin(lobes*a/2)));if(i===0)ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);else ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}
      ctx.closePath();ctx.stroke();ctx.restore()
      cursor.style.transform=`translate3d(${sx-32}px,${sy-32}px,0)`
      let steps=0
      while(accumulator>=1/60&&steps<3){
        for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
          const i=y*w+x,p=pressure[i]
          let v=velocity[i]+(pressure[i-1]+pressure[i+1]+pressure[i-w]+pressure[i+w]-4*p)*.25
          const value=(p+v)*.985;v=(v-.012*value)*.965
          next[i]=value;velocity[i]=v
        }
        if(now<injectUntil){const px=mx/4,py=my/4
          for(let y=Math.max(1,Math.floor(py-4));y<Math.min(h-1,py+4);y++)for(let x=Math.max(1,Math.floor(px-4));x<Math.min(w-1,px+4);x++){
            const d=Math.hypot(x-px,y-py);if(d<3.3)next[y*w+x]+=(1-d/3.3)*.78
          }
        }
        ;[pressure,next]=[next,pressure];accumulator-=1/60;steps++
      }
      if(steps){
        for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
          const i=y*w+x,gx=(pressure[i+1]-pressure[i-1])*.5,gy=(pressure[i+w]-pressure[i-w])*.5
          // Encode the water normal in RG for true live-content refraction.
          displacement.data[i*4]=Math.max(0,Math.min(255,128+gx*180))
          displacement.data[i*4+1]=Math.max(0,Math.min(255,128+gy*180))
          const crest=Math.min(.20,Math.max(0,gx*.3-gy*.6)*.4)
          pixels.data[i*4]=190;pixels.data[i*4+1]=207;pixels.data[i*4+2]=210;pixels.data[i*4+3]=crest*255
        }
        water.putImageData(pixels,0,0)
        mapContext.putImageData(displacement,0,0)
        mapImage.current?.setAttribute("href",mapCanvas.toDataURL("image/png"))
        if(lens.current)lens.current.style.display="block"
      }
      if(now<activeUntil||Math.hypot(mx-sx,my-sy)>.1)frame=requestAnimationFrame(render)
      else {if(lens.current)lens.current.style.display="none";water.clearRect(0,0,w,h);pressure.fill(0);velocity.fill(0);next.fill(0);accumulator=0}
    }
    const wake=()=>{if(!frame){last=0;frame=requestAnimationFrame(render)}}
    const move=(e:PointerEvent)=>{
      if(e.pointerType!=="mouse"||!enabled())return
      const now=performance.now();speed=Math.min(28,Math.hypot(e.clientX-mx,e.clientY-my)*16/Math.max(8,now-lastMove));lastMove=now
      mx=e.clientX;my=e.clientY;if(!seen){sx=mx;sy=my;seen=true}
      hover=!!(e.target instanceof Element&&e.target.closest("a,button,input,textarea,select,[data-cursor-hover]"))
      document.documentElement.classList.add("has-ripple-cursor");cursor.style.opacity="1"
      activeUntil=now+2200;injectUntil=now+24;wake()
    }
    const reset=()=>{if(lens.current)lens.current.style.display="none";cancelAnimationFrame(frame);frame=0;seen=false;cursor.style.opacity="0";document.documentElement.classList.remove("has-ripple-cursor");water.clearRect(0,0,w,h);pressure.fill(0);velocity.fill(0);next.fill(0);accumulator=0}
    const click=()=>{if(enabled()&&seen){injectUntil=performance.now()+38;activeUntil=performance.now()+2200;wake()}}
    resize();window.addEventListener("resize",resize);window.addEventListener("pointermove",move,{passive:true});window.addEventListener("pointerdown",click,{passive:true});window.addEventListener("blur",reset)
    document.documentElement.addEventListener("pointerleave",reset);document.addEventListener("visibilitychange",reset);reduced.addEventListener("change",reset);fine.addEventListener("change",reset)
    return()=>{reset();window.removeEventListener("resize",resize);window.removeEventListener("pointermove",move);window.removeEventListener("pointerdown",click);window.removeEventListener("blur",reset);document.documentElement.removeEventListener("pointerleave",reset);document.removeEventListener("visibilitychange",reset);reduced.removeEventListener("change",reset);fine.removeEventListener("change",reset)}
  },[])
  return <div className="ripple-cursor-layer" aria-hidden="true">
    <svg className="ripple-cursor-filter" width="0" height="0"><defs>
      <filter id="portfolio-water-refraction" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feImage ref={mapImage} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="waterNormal"/>
        <feDisplacementMap in="SourceGraphic" in2="waterNormal" scale="48" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </defs></svg>
    <div ref={lens} className="ripple-cursor-refraction" style={{backdropFilter:"url(#portfolio-water-refraction)",WebkitBackdropFilter:"url(#portfolio-water-refraction)"}}/>
    <canvas ref={waves} className="ripple-cursor-waves"/><canvas ref={mark} className="ripple-cursor-mark"/>
  </div>
}
