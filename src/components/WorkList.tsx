import { projectUpdates } from "./projectUpdates"
import logiflow from "../Assets/logiflow.jpg"
import teamio from "../Assets/teamio.png"
import { useEffect, useRef, useState, type CSSProperties } from "react"
import ProjectModal from "./ProjectModal"
import { useLocation, useNavigationType } from "react-router"
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

const EXISTING_PROJECTS: Project[] = [
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
    title: "Aarthik",
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
    title: "Looma",
    kind: "Operations & Business Dashboard",
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
{"num": "06", "title": "Algae Tree", "kind": "Website Redesign", "year": "", "blurb": "A clearer digital story, shaped around discovery, understanding, and a more confident next step.", "image": "", "top": "#183f36", "bottom": "#dce5cf", "action": "#dce5cf", "fg": "#dce5cf", "mutedFg": "#183f36", "actionFg": "#183f36"},{"num": "07", "title": "Talio", "kind": "Website Design", "year": "", "blurb": "A focused website experience that makes a productivity platform easier to understand and explore.", "image": "", "top": "#30353d", "bottom": "#e2e5ec", "action": "#e2e5ec", "fg": "#e2e5ec", "mutedFg": "#30353d", "actionFg": "#30353d"},
]

export const PROJECTS: Project[] = [...EXISTING_PROJECTS, ...["08", "09", "10"].map(num => ({ ...EXISTING_PROJECTS[5], num }))].map(project => {
  const update = projectUpdates[project.num]
  return update ? { ...project, title: update.title, kind: update.kind, blurb: update.blurb } : project
})
const originalPosters = ["/project-posters/canact-mockup.webp", "/project-posters/aarthik-mockup.webp", logiflow, teamio, "/project-posters/looma-mockup.webp"]
export const POSTERS = PROJECTS.map((project, index) => projectUpdates[project.num]?.poster ?? originalPosters[index])

const clamp = (v:number)=>Math.max(0,Math.min(1,v))
const openProjectByLocation = new Map<string, string>()
export default function WorkList() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const section=useRef<HTMLElement>(null)
  const stage=useRef<HTMLDivElement>(null)
  const backgrounds=useRef<(HTMLDivElement|null)[]>([])
  const slots=useRef<(HTMLElement|null)[]>([])
  const [active,setActive]=useState(0)
  const [selected,setSelected]=useState<number | null>(null)
  const [reduced,setReduced]=useState(()=>matchMedia("(prefers-reduced-motion: reduce)").matches)
  useEffect(() => {
    if (navigationType !== "POP" || !section.current?.getClientRects().length) return
    const id = openProjectByLocation.get(location.key)
    const index = PROJECTS.findIndex(project => project.num === id)
    if (index >= 0) setSelected(index)
  }, [location.key, navigationType])
  const openProject = (index: number) => {
    openProjectByLocation.set(location.key, PROJECTS[index].num)
    setSelected(index)
  }
  const closeProject = () => {
    openProjectByLocation.delete(location.key)
    setSelected(null)
  }
  useEffect(()=>{
    const el=section.current!,surface=stage.current!,media=matchMedia("(prefers-reduced-motion: reduce)")
    let frame=0,lastActive=0
    const update=()=>{
      frame=0
      if(!el.getClientRects().length)return
      if(media.matches){slots.current.forEach(slot=>{if(slot){slot.inert=false;slot.style.transform="none";slot.style.opacity="1";slot.style.visibility="visible";slot.style.filter="none"}});return}
      const arrival=clamp(1-el.getBoundingClientRect().top/innerHeight)
      // Keep the heading scene visible until the first card reaches its resting position.
      surface.style.setProperty("--reel-arrival",String(clamp((arrival-.90)/.10)))
      const step=(el.offsetHeight-surface.clientHeight)/PROJECTS.length
      const raw=clamp(-el.getBoundingClientRect().top/Math.max(1,step)/PROJECTS.length)*PROJECTS.length
      const index=Math.min(PROJECTS.length-1,Math.floor(raw)),fraction=clamp((raw-index-.58)/.42)
      const blend=fraction*fraction*(3-2*fraction)
      const position=Math.min(PROJECTS.length-1,index+blend)
      backgrounds.current.forEach((bg,i)=>{if(bg)bg.style.opacity=String(i===index?1:i===index+1?blend:0)})
      const current=Math.min(PROJECTS.length-1,index+(blend>.5?1:0))
      slots.current.forEach((slot,i)=>{
        if(!slot)return
        const distance=i-position,depth=Math.abs(distance)
        const scale=1-.58*Math.min(1,depth)-.10*Math.max(0,depth-1)
        slot.inert=i!==current
        slot.style.transform=`translate(-50%,-50%) translateY(${distance*surface.clientHeight*.62}px) scale(${Math.max(.2,scale)})`
        slot.style.opacity=String(Math.max(0,1-Math.min(1,depth)*.6))
        slot.style.visibility=depth<1.8?"visible":"hidden"
        slot.style.zIndex=String(Math.round(100-depth*10))
        slot.style.filter=`brightness(${1-Math.min(1,depth)*.18})`
        slot.style.setProperty("--glass-sweep", `${50 + distance * 45}%`)
      })
      if(current!==lastActive){lastActive=current;setActive(current)}
    }
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)}
    const change=()=>{setReduced(media.matches);schedule()}
    const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting)schedule()})
    observer.observe(el)
    const resize=new ResizeObserver(schedule);resize.observe(surface)
    window.addEventListener("scroll",schedule,{passive:true});window.addEventListener("resize",schedule);media.addEventListener("change",change);schedule()
    return()=>{cancelAnimationFrame(frame);observer.disconnect();resize.disconnect();window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);media.removeEventListener("change",change)}
  },[])
  const goTo=(index:number)=>{
    const el=section.current!,surface=stage.current!
    const top=scrollY+el.getBoundingClientRect().top
    window.scrollTo({top:top+(el.offsetHeight-surface.clientHeight)/PROJECTS.length*(index+.18),behavior:reduced?"auto":"smooth"})
  }
  return <><section ref={section} id="projects" className="project-reel" aria-label="Selected projects" style={{"--project-count":PROJECTS.length} as CSSProperties}>
    <div ref={stage} className="project-reel__stage">
      <div className="project-reel__backgrounds" aria-hidden="true">{PROJECTS.map((project,i)=><div key={project.num} ref={el=>{backgrounds.current[i]=el}} className="project-reel__background" style={{backgroundImage:`url("${POSTERS[i]}")`,opacity:i===0?1:0}} />)}</div>
      <div className="project-reel__shade" aria-hidden="true" />
      <header className="project-reel__header"><span>Selected work</span><span>Ideas, made tangible.</span></header>
      <div className="project-reel__track">{PROJECTS.map((project,i)=><article key={project.num} ref={el=>{slots.current[i]=el}} className="project-reel__slot" style={{"--project-image":`url("${POSTERS[i]}")`} as CSSProperties}>
        <button type="button" onClick={() => openProject(i)} aria-haspopup="dialog" className="project-reel__project" data-cursor-hover aria-label={`Explore ${project.title}, ${project.kind}`}>
          <span className="project-reel__category">{project.num} / {project.kind}</span>
          <div className="project-reel__banner" style={{backgroundColor:project.top}}>
            <img src={POSTERS[i]} alt={`${project.title} project preview`} loading={Math.abs(i-active) <= 1 ? "eager" : "lazy"} decoding="async" width="1672" height="941"/>
            <span className="project-reel__open" aria-hidden="true">Explore project &#8599;</span>
          </div>
          <h2>{project.title}<span aria-hidden="true">&#8599;</span></h2>
          <p className="project-reel__status">{projectUpdates[project.num]?.status ?? project.kind}</p>
        </button>
      </article>)}</div>
      <footer className="project-reel__footer">
        <span className="project-reel__count" aria-live="polite">{String(active+1).padStart(2,"0")} <span>/ {String(PROJECTS.length).padStart(2,"0")}</span></span>
        <nav aria-label="Choose a project">{PROJECTS.map((project,i)=><button key={project.num} onClick={()=>goTo(i)} aria-label={`Show ${project.title}`} aria-current={active===i?"true":undefined} title={project.title}><span /></button>)}</nav>
        <span className="project-reel__scroll">Scroll for the next perspective <span aria-hidden="true">&#8595;</span></span>
      </footer>
    </div>
  </section>{selected !== null && <ProjectModal projectId={PROJECTS[selected].num} summary={PROJECTS[selected].blurb} poster={POSTERS[selected]} onClose={closeProject} />}</>
}
