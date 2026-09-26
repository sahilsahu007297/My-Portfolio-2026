import canact from "../Assets/Canact.mp4"
import meridian from "../Assets/Meridian.mp4"
import logiflow from "../Assets/logiflow.jpg"
import teamio from "../Assets/teamio.png"
import northstar from "../Assets/northstar.png"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Link } from "react-router"
import "./ProjectRows.css"

type Project = {
  num: string
  title: string
  kind: string
  year: string
  blurb: string
  image: string
  top: string
  bottom: string
  action: string
  fg: string
  mutedFg: string
  actionFg: string
}

const PROJECTS: Project[] = [
  {
    num: "01",
    title: "CANACT",
    kind: "Social Connection",
    year: "2024",
    blurb:
      "A modern social platform enabling people in close proximity to discover, connect, and interact with intuitive interactions and community-driven engagement.",
    image: "photo-1738676524296-364cf18900a8",
    top: "#36353B",
    bottom: "#5C6667",
    action: "#8E9C8F",
    fg: "#DFDFD9",
    mutedFg: "#DFDFD9",
    actionFg: "#36353B",
  },
  {
    num: "02",
    title: "Meridian",
    kind: "Fintech Platform",
    year: "2024",
    blurb:
      "A next-generation fintech experience focused on helping users understand, manage, and use their money better through intelligent, action-oriented design.",
    image: "photo-1765371513276-a74f1ecbcf7d",
    top: "#5C6667",
    bottom: "#8E9C8F",
    action: "#DFDFD9",
    fg: "#DFDFD9",
    mutedFg: "#36353B",
    actionFg: "#36353B",
  },
  {
    num: "03",
    title: "LogiFlow",
    kind: "Logistics SaaS",
    year: "2024",
    blurb:
      "An India-focused enterprise logistics platform spanning 20+ operational modules across fleet, shipments, warehouses, billing, and compliance.",
    image: "photo-1690321607902-2799a1e8eaaa",
    top: "#8E9C8F",
    bottom: "#DFDFD9",
    action: "#36353B",
    fg: "#36353B",
    mutedFg: "#36353B",
    actionFg: "#DFDFD9",
  },
  {
    num: "04",
    title: "Teamio",
    kind: "HRMS Platform",
    year: "2024",
    blurb:
      "A cohesive HRMS platform that brings essential employee and workforce operations into one streamlined, scalable, and enterprise-ready system.",
    image: "photo-1653511442060-00c7b10827c4",
    top: "#DFDFD9",
    bottom: "#36353B",
    action: "#5C6667",
    fg: "#36353B",
    mutedFg: "#DFDFD9",
    actionFg: "#DFDFD9",
  },
  {
    num: "05",
    title: "NorthStar",
    kind: "BI & Finance",
    year: "2024",
    blurb:
      "An enterprise-grade financial command centre for real-time business intelligence, interactive dashboards, and executive decision-making.",
    image: "photo-1784986717568-a19e6575ad91",
    top: "#5C6667",
    bottom: "#8E9C8F",
    action: "#DFDFD9",
    fg: "#DFDFD9",
    mutedFg: "#36353B",
    actionFg: "#36353B",
  },
]

const MEDIA = [canact, meridian, logiflow, teamio, northstar]
export default function WorkList() {
  const [active,setActive]=useState<number|null>(null)
  const preview=useRef<HTMLDivElement>(null)
  const videos=useRef<(HTMLVideoElement|null)[]>([])
  const target=useRef({x:0,y:0}),position=useRef({x:0,y:0})
  const frame=useRef(0),last=useRef(0),initialized=useRef(false)
  const move=(x:number,y:number)=>{
    target.current={x:Math.max(216,Math.min(innerWidth-216,x)),y:Math.max(141,Math.min(innerHeight-141,y))}
    const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches
    if(!initialized.current||reduced){position.current={...target.current};initialized.current=true}
    const animate=(now:number)=>{
      const dt=Math.min((now-(last.current||now-16))/1000,.05);last.current=now
      const amount=reduced?1:1-Math.exp(-dt*12)
      position.current.x+=(target.current.x-position.current.x)*amount
      position.current.y+=(target.current.y-position.current.y)*amount
      if(preview.current)preview.current.style.transform=`translate3d(${position.current.x}px,${position.current.y}px,0)`
      frame.current=Math.hypot(target.current.x-position.current.x,target.current.y-position.current.y)>.1?requestAnimationFrame(animate):0
    }
    if(!frame.current){last.current=0;frame.current=requestAnimationFrame(animate)}
  }
  useEffect(()=>()=>cancelAnimationFrame(frame.current),[])
  useEffect(()=>{
    const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches
    videos.current.forEach((video,i)=>{if(!video)return;if(active===i&&!reduced)void video.play().catch(()=>{});else video.pause()})
  },[active])
  return <section id="projects" className="hover-img-container" aria-label="Selected projects">
    <div className="hover-img-projects" onMouseLeave={()=>setActive(null)}>
      {PROJECTS.map((project,i)=><Link key={project.num} to={`/projects/${project.num}`} className="hover-img-project"
        onMouseEnter={e=>{setActive(i);move(e.clientX,e.clientY)}} onMouseMove={e=>move(e.clientX,e.clientY)}
        onFocus={e=>{setActive(i);const rect=e.currentTarget.getBoundingClientRect();move(rect.left+rect.width*.62,rect.top+rect.height/2)}} onBlur={()=>setActive(null)}>
        <h2>{project.title}</h2><p>{project.kind}</p>
      </Link>)}
    </div>
    {createPortal(<div ref={preview} className="hover-img-preview-position" aria-hidden="true">
      <div className={`hover-img-thumbnail-wrapper ${active!==null?"is-active":""}`}>
        <div className="hover-img-thumbnail-reel" style={{transform:`translateY(-${(active??0)*100}%)`}}>
          {PROJECTS.map((project,i)=><div className="hover-img-thumbnail" key={project.num}>
            {i<2?<video ref={el=>{videos.current[i]=el}} src={MEDIA[i]} muted loop playsInline preload="none"/>:<img src={MEDIA[i]} alt="" loading="lazy"/>}
          </div>)}
        </div>
      </div>
    </div>,document.body)}
  </section>
}
