import canact from "../Assets/Canact.mp4"
import meridian from "../Assets/Meridian.mp4"
import logiflow from "../Assets/logiflow.jpg"
import teamio from "../Assets/teamio.png"
import northstar from "../Assets/northstar.png"
import "./ProjectRows.css"
import { useState, useRef } from "react"
import { useNavigate } from "react-router"

// The list picks up the warm off-white that the showcase above melted into.
// A big index reel on the left counts through 01–05 while, on the right, tall
// project panels slide vertically so exactly one sits in frame at a time. Both
// reels are driven by one scroll value so the number and the panel always agree,
// and the motion is kept slow and understated.

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
  const navigate=useNavigate()
  const [active,setActive]=useState<number|null>(null)
  const preview=useRef<HTMLDivElement>(null)
  return <section id="projects" className="project-rows" aria-label="Selected work">
    <div className="project-rows__intro"><span>[ Selected work ]</span><p>Good questions.<br/>Meaningful outcomes.</p><span>2024 &mdash; 2026</span></div>
    <div onMouseLeave={()=>setActive(null)}>
      {PROJECTS.map((p,i)=><button key={p.num} className="project-row" onClick={()=>navigate(`/projects/${p.num}`)} onFocus={()=>setActive(i)} onBlur={()=>setActive(null)} onMouseEnter={()=>setActive(i)} onMouseMove={e=>{if(preview.current){preview.current.style.left=`${Math.min(innerWidth-380,Math.max(20,e.clientX+24))}px`;preview.current.style.top=`${Math.min(innerHeight-260,Math.max(20,e.clientY-130))}px`}}}>
        <span className="project-row__number">{p.num}</span><h3>{p.title}</h3><span className="project-row__kind">{p.kind}</span><span className="project-row__year">{p.year}</span><span aria-hidden="true">&#8599;</span>
        <div className="project-row__mobile-media">{i<2?<video src={MEDIA[i]} muted playsInline preload="metadata"/>:<img src={MEDIA[i]} alt="" loading="lazy"/>}</div>
      </button>)}
    </div>
    <div ref={preview} className={`project-preview ${active!==null?"is-active":""}`} aria-hidden="true">
      {active!==null && <>{active<2?<video key={active} src={MEDIA[active]} autoPlay={!matchMedia("(prefers-reduced-motion: reduce)").matches} loop muted playsInline/>:<img src={MEDIA[active]} alt=""/>}<span>{PROJECTS[active].title} &mdash; Explore project &#8599;</span></>}
    </div>
  </section>
}
