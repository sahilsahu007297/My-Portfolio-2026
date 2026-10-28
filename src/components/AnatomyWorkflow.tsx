import { useEffect, useRef, useState } from "react"
import "./FlightExperience.css"
import AnatomyAssembly from "./AnatomyAssembly"
import JetFormation from "./JetFormation"
import { type WorkflowTimeline } from "./workflowArtwork"

const steps = [
  { name: "Understand", outcome: "User interviews & a clear problem.", model: "lens-bench" },
  { name: "Define", outcome: "One opportunity. Shared success criteria.", model: "binary-search" },
  { name: "Structure", outcome: "Journeys, priorities & information architecture.", model: "hash-map" },
  { name: "Design", outcome: "Useful flows. A coherent visual system.", model: "computer" },
  { name: "Prototype", outcome: "A working experience to put in people's hands.", model: "press-and-pull" },
  { name: "Validate", outcome: "Real tasks. Observed friction. Better decisions.", model: "profile" },
  { name: "Launch", outcome: "Build together. Ship. Learn from real use.", model: "afterburner" },
]
const clamp = (n: number) => Math.max(0, Math.min(1, n))
export default function AnatomyWorkflow() {
  const root = useRef<HTMLElement>(null), model = useRef<HTMLDivElement>(null), caption = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0), activeRef = useRef(0)
  const timeline=useRef<WorkflowTimeline>({index:0,local:0,finale:-1})
  const [near, setNear] = useState(false), [reduced, setReduced] = useState(false)
  useEffect(() => {
    const el=root.current!, media=matchMedia("(prefers-reduced-motion: reduce)")
    let frame=0, visible=false
    const update=()=>{
      frame=0;setReduced(media.matches)
      if(!visible)return
      const raw=clamp(-el.getBoundingClientRect().top/Math.max(1,el.offsetHeight-innerHeight))*12.6
      const index=Math.min(steps.length-1,Math.floor(raw)),local=raw>=steps.length?1:raw-index
      // Give the paragraph 50% more scroll distance, followed by a readable hold.
      const flightProgress=(raw-6.7)/4.7
      const finale=flightProgress<=.69?flightProgress:.69+(flightProgress-.69)/1.5
      timeline.current={index,local,finale:media.matches?.45:raw<6.7?-1:clamp(finale)}
      el.classList.toggle("is-finale",!media.matches&&raw>=6.7)
      if(index!==activeRef.current){activeRef.current=index;setActive(index)}
      const enter=media.matches?1:clamp((local+.12)/.3),ease=1-Math.pow(1-enter,3)
      if(model.current){model.current.style.opacity=timeline.current.finale>=0&&!media.matches?"0":"1";model.current.style.transform="none"}
      if(caption.current){caption.current.style.opacity=String(media.matches?1:clamp(local/.18));caption.current.style.transform=`translateY(${(1-ease)*20}px)`}
    }
    const wake=()=>{update()}
    const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible){setNear(true);wake()}},{rootMargin:"600px"});observer.observe(el)
    window.addEventListener("scroll",wake,{passive:true});window.addEventListener("resize",wake);media.addEventListener("change",wake);wake()
    return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener("scroll",wake);window.removeEventListener("resize",wake);media.removeEventListener("change",wake)}
  },[])
  const go=(index:number)=>{const el=root.current!;window.scrollTo({top:scrollY+el.getBoundingClientRect().top+(el.offsetHeight-innerHeight)*(index+.5)/12.6,behavior:reduced?"auto":"smooth"})}
  return <section ref={root} id="workflow" className="anatomy-workflow" aria-label="Seven steps from problem to product">
    <div className="anatomy-workflow__stage">
      {(reduced?steps:[steps[active]]).map((step,i)=><div className="workflow-scene" key={step.name}>
        <div ref={reduced?undefined:model} className="workflow-machine">
          {near&&<AnatomyAssembly name={step.model} index={reduced?i:active} timeline={timeline} alt={`${step.name}: a detailed isometric ${["optical bench","balance","sorting cabinet","design workstation","test rig","profile gauge","jet engine"][reduced?i:active]}`}/>}
        </div>
        <div ref={reduced?undefined:caption} className="workflow-caption"><span>{String((reduced?i:active)+1).padStart(2,"0")} / 07</span><h2>{step.name}.</h2><p>{step.outcome}</p></div>
      </div>)}
      {near&&active<steps.length-1&&<link rel="prefetch" as="image" href={`/workflow-models/${steps[active+1].model}.webp`}/>}
      {near&&<JetFormation timeline={timeline} anchor={model}/>}
      <nav className="workflow-progress" aria-label="Workflow steps">{steps.map((step,i)=><button key={step.name} aria-label={step.name} aria-current={i===active?"step":undefined} onClick={()=>go(i)}/>)}</nav>
    </div>
  </section>
}
