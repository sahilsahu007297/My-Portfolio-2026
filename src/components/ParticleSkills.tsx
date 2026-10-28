import { useEffect, useRef, useState } from "react"
import "./FlightExperience.css"

const skills=[
  ["Product design","Making useful feel effortless.","A figure sketches an interface on a luminous canvas."],
  ["Product strategy","Finding the opportunity worth pursuing.","A figure studies a constellation of opportunities."],
  ["Product management","Turning shared priorities into progress.","A figure arranges tasks into an ordered roadmap."],
  ["Interaction design","Giving every detail a purpose.","A figure operates a responsive control."],
  ["Problem solving","Untangling the complex. Finding the clear.","A figure connects scattered points into a clear path."],
]
export default function ParticleSkills(){
  const root=useRef<HTMLElement>(null),canvas=useRef<HTMLCanvasElement>(null),activeRef=useRef(0)
  const [active,setActive]=useState(0)
  useEffect(()=>{
    const el=root.current!,cv=canvas.current!,ctx=cv.getContext("2d");if(!ctx)return
    const reduced=matchMedia("(prefers-reduced-motion: reduce)");let frame=0,visible=false,time=0,last=0
    const render=(now:number)=>{
      frame=0;if(!visible||document.hidden)return
      if(!reduced.matches)time+=Math.min(.04,(now-(last||now))/1000);last=now
      const width=cv.clientWidth,height=cv.clientHeight,dpr=Math.min(devicePixelRatio,1.5)
      if(cv.width!==Math.round(width*dpr)||cv.height!==Math.round(height*dpr)){cv.width=Math.round(width*dpr);cv.height=Math.round(height*dpr)}
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height)
      const scale=Math.min(width/760,height/670),cx=width/2-55*scale,cy=height*.46
      ctx.translate(cx,cy);ctx.scale(scale,scale)
      const dot=(x:number,y:number,seed:number,bright=false)=>{ctx.fillStyle=bright?"#c7f4ff":seed%4?"#8bd6ed":"#f3ffff";ctx.shadowColor="#40baff";ctx.shadowBlur=bright?9:3;ctx.beginPath();ctx.arc(x,y,seed%3===0?1.7:1.1,0,Math.PI*2);ctx.fill()}
      const line=(x1:number,y1:number,x2:number,y2:number,thick=4)=>{
        const count=Math.ceil(Math.hypot(x2-x1,y2-y1)*1.1)
        for(let j=0;j<count;j++){const t=j/count;dot(x1+(x2-x1)*t+Math.sin(j*12.3)*thick,y1+(y2-y1)*t+Math.cos(j*7.7)*thick,j)}
      }
      const circle=(x:number,y:number,r:number,fill=false)=>{for(let j=0;j<(fill?650:180);j++){const a=j*2.39996,rr=fill?r*Math.sqrt((j+.5)/650):r;dot(x+Math.cos(a)*rr,y+Math.sin(a)*rr,j)}}
      const i=activeRef.current,wave=Math.sin(time*1.7)
      circle(-35,-105,26,true);line(-35,-75,-35,25,6);line(-35,25,-65,91);line(-65,91,-83,145);line(-35,25,-4,86);line(-4,86,8,145)
      line(-83,145,-58,145);line(8,145,32,145)
      line(-35,-50,-83,-12);line(-83,-12,-92,22)
      const handX=100+(i===2?Math.sin(time)*35:wave*12),handY=i===1?-100+wave*20:i===4?-20+wave*35:-38+wave*23
      line(-35,-50,30,-28);line(30,-28,handX,handY);circle(handX,handY,5,true)
      if(i===0){
        line(90,-120,235,-120,1);line(235,-120,235,70,1);line(235,70,90,70,1);line(90,70,90,-120,1)
        for(let r=0;r<3;r++){line(110,-91+r*48,212,-91+r*48,1);line(110,-76+r*48,165,-76+r*48,1)}
        line(handX,handY,handX+16,handY-18,1)
      }else if(i===1){
        for(let j=0;j<7;j++){const a=j/7*Math.PI*2;const x=158+Math.cos(a)*90,y=-52+Math.sin(a)*90;circle(x,y,7);line(158,-52,x,y,.5)}circle(158,-52,20)
      }else if(i===2){
        for(let j=0;j<9;j++){const x=95+(j%3)*57,y=-105+Math.floor(j/3)*65+(j===4?wave*9:0);line(x,y,x+36,y,1);line(x+36,y,x+36,y+28,1);line(x+36,y+28,x,y+28,1);line(x,y+28,x,y,1)}
      }else if(i===3){circle(163,-25,62);circle(163,-25,40+wave*7);line(163,-25,163+Math.cos(time)*40,-25+Math.sin(time)*40,2);circle(163,-25,8,true)}
      else{for(let j=0;j<6;j++){const x=90+j*28,y=-65+Math.sin(j*1.3+time*.3)*45;circle(x,y,7);if(j)line(x-28,-65+Math.sin((j-1)*1.3+time*.3)*45,x,y,.8)}}
      ctx.shadowBlur=0
      if(!reduced.matches)frame=requestAnimationFrame(render)
    }
    const wake=()=>{const p=Math.max(0,Math.min(.999,-el.getBoundingClientRect().top/Math.max(1,el.offsetHeight-innerHeight)));const next=reduced.matches?activeRef.current:Math.floor(p*skills.length);if(next!==activeRef.current){activeRef.current=next;setActive(next)}if(!frame&&visible)frame=requestAnimationFrame(render)}
    const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)wake();else{cancelAnimationFrame(frame);frame=0}});observer.observe(cv)
    window.addEventListener("scroll",wake,{passive:true});window.addEventListener("resize",wake);document.addEventListener("visibilitychange",wake);reduced.addEventListener("change",wake)
    return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener("scroll",wake);window.removeEventListener("resize",wake);document.removeEventListener("visibilitychange",wake);reduced.removeEventListener("change",wake)}
  },[])
  const choose=(i:number)=>{activeRef.current=i;setActive(i);const el=root.current!;if(!matchMedia("(prefers-reduced-motion: reduce)").matches)window.scrollTo({top:scrollY+el.getBoundingClientRect().top+(el.offsetHeight-innerHeight)*(i+.3)/skills.length,behavior:"smooth"});window.dispatchEvent(new Event("resize"))}
  return <section ref={root} className="particle-skills" id="skills" aria-label="What I do"><div className="particle-skills__stage">
    <span className="scene-overline">WHAT I DO / THOUGHT INTO ACTION</span><canvas ref={canvas} role="img" aria-label={skills[active][2]}/>
    <div className="skills-caption" key={active}><span>0{active+1} / 05</span><h2>{skills[active][0]}</h2><p>{skills[active][1]}</p></div>
    <nav aria-label="Explore skills">{skills.map((skill,i)=><button key={skill[0]} aria-current={active===i?"true":undefined} onClick={()=>choose(i)}>{skill[0]}</button>)}</nav>
  </div></section>
}
