import { useEffect, useRef, useState } from "react"
import "./Storytelling.css"
const SKILLS=[
  {title:"How I work.",label:"HOW I WORK",copy:"A curious mind. A hands-on approach."},
  {title:"Find the right question.",label:"PRODUCT STRATEGY",copy:"Connect people's needs to an opportunity worth pursuing."},
  {title:"Make it feel obvious.",label:"PRODUCT DESIGN",copy:"Turn complexity into a clear, useful experience."},
  {title:"Move the team forward.",label:"PRODUCT MANAGEMENT",copy:"Align priorities, make the trade-offs, and keep the outcome in view."},
  {title:"Give details a purpose.",label:"INTERACTION DESIGN",copy:"Prototype the moments that make a product feel intuitive."},
  {title:"Untangle. Test. Improve.",label:"PROBLEM SOLVING",copy:"Challenge assumptions until the next step becomes clear."},
]
const clamp=(n:number)=>Math.max(0,Math.min(1,n))
export default function Storytelling(){
  const root=useRef<HTMLElement>(null),host=useRef<HTMLDivElement>(null),activeRef=useRef(0)
  const [active,setActive]=useState(0),[fallback,setFallback]=useState(false)
  useEffect(()=>{
    const el=root.current!,container=host.current!;let disposed=false,visible=false,cleanup=()=>{},wake=()=>{},started=false
    const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible&&!started){started=true;void init()}wake()},{rootMargin:"150px"});observer.observe(container)
    async function init(){
      try{
        const [T,{storyParticles}]=await Promise.all([import("three"),import("./storyParticles")]);if(disposed)return
        let renderer:InstanceType<typeof T.WebGLRenderer>
        try{renderer=new T.WebGLRenderer({alpha:true,antialias:false,powerPreference:"low-power"})}catch{setFallback(true);return}
        renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));container.appendChild(renderer.domElement)
        const scene=new T.Scene(),camera=new T.PerspectiveCamera(38,1,.1,30);camera.position.z=7
        const shapes=storyParticles(),attributes=shapes.map(s=>new T.BufferAttribute(s.positions,3)),normals=shapes.map(s=>new T.BufferAttribute(s.normals,3)),kinds=shapes.map(s=>new T.BufferAttribute(s.kinds,1)),count=shapes[0].positions.length/3
        const geometry=new T.BufferGeometry();geometry.setAttribute("position",attributes[0]);geometry.setAttribute("target",attributes[1]);geometry.setAttribute("normal",normals[0]);geometry.setAttribute("targetNormal",normals[1]);geometry.setAttribute("kind",kinds[0]);geometry.setAttribute("targetKind",kinds[1]);geometry.setAttribute("seed",new T.BufferAttribute(Float32Array.from({length:count},(_,i)=>(i*.61803398875)%1),1))
        // Independent seeded coordinates avoid the visible bands of a single sine curve.
        let randomState=91837
        const random=()=>{randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;return randomState/4294967296}
        const cloud=new Float32Array(count*3)
        for(let i=0;i<count;i++){cloud[i*3]=(random()-.5)*12;cloud[i*3+1]=(random()-.5)*8;cloud[i*3+2]=(random()-.5)*5}
        geometry.setAttribute("cloud",new T.BufferAttribute(cloud,3))
        const material=new T.ShaderMaterial({transparent:true,depthWrite:true,uniforms:{blend:{value:0},entrance:{value:0},arrival:{value:0},pixel:{value:renderer.getPixelRatio()}},vertexShader:`attribute vec3 target,targetNormal,cloud;attribute float seed,kind,targetKind;uniform float blend,entrance,pixel,arrival;varying float shade,surface,opacity;void main(){vec3 p=mix(position,target,blend);float swirl=sin(blend*3.14159265);p+=vec3(cos(seed*60.+blend*5.),sin(seed*43.+blend*5.),sin(seed*35.))*swirl*.28;p=mix(cloud,p,entrance);opacity=arrival*mix(.06+.12*seed,1.,entrance);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp((13.+seed*5.)*pixel/-mv.z,1.2,4.);vec3 n=normalize(normalMatrix*mix(normal,targetNormal,blend));shade=.35+.65*max(0.,dot(n,normalize(vec3(-.5,.8,1.))));surface=mix(kind,targetKind,blend);}`,fragmentShader:`varying float shade,surface,opacity;void main(){float d=length(gl_PointCoord-.5);if(d>.48)discard;vec3 base=surface>1.5?vec3(.38,.82,1.):surface>.5?vec3(.68,.78,.84):vec3(.92,.96,1.);gl_FragColor=vec4(base*shade,opacity*(1.-smoothstep(.28,.48,d)));}`})
        const points=new T.Points(geometry,material);points.frustumCulled=false;scene.add(points)
        const media=matchMedia("(prefers-reduced-motion: reduce)");let frame=0,last=0,p=0,target=0
        const render=(now:number)=>{frame=0;if(disposed||!visible||document.hidden)return
          const dt=Math.min(.05,(now-(last||now))/1000);last=now;p+=(target-p)*(media.matches?1:1-Math.exp(-dt*9))
          const journey=clamp((p-.1)/.9)*5,index=Math.min(4,Math.floor(journey)),local=journey-index,blend=clamp((local-.66)/.34),ease=blend*blend*(3-2*blend)
          geometry.setAttribute("position",attributes[index]);geometry.setAttribute("target",attributes[index+1]);material.uniforms.blend.value=ease
          const assembly=clamp(p/.12);material.uniforms.entrance.value=media.matches?1:assembly*assembly*(3-2*assembly);const arrival=clamp(1-el.getBoundingClientRect().top/Math.max(1,innerHeight*.8));material.uniforms.arrival.value=media.matches?1:arrival*arrival*(3-2*arrival);geometry.setAttribute("normal",normals[index]);geometry.setAttribute("targetNormal",normals[index+1]);geometry.setAttribute("kind",kinds[index]);geometry.setAttribute("targetKind",kinds[index+1])
          points.rotation.y=Math.sin(ease*Math.PI)*.22*(index%2?-1:1);points.rotation.z=Math.sin(ease*Math.PI)*.025
          points.position.y=.15;points.scale.setScalar(1)
          const current=Math.min(5,index+(blend>.5?1:0));if(current!==activeRef.current){activeRef.current=current;setActive(current)}
          el.style.setProperty("--story-intro",String(1-clamp((p-.12)/.09)))
          el.style.setProperty("--story-caption",String(clamp((p-.18)/.06)*(1-Math.sin(ease*Math.PI)*.65)))
          renderer.render(scene,camera);if(Math.abs(target-p)>.00015)frame=requestAnimationFrame(render)
        }
        wake=()=>{target=clamp(-el.getBoundingClientRect().top/Math.max(1,el.offsetHeight-innerHeight));if(!visible){cancelAnimationFrame(frame);frame=0;return}if(!frame){last=0;frame=requestAnimationFrame(render)}}
        const resize=new ResizeObserver(()=>{renderer.setSize(container.clientWidth,container.clientHeight);camera.aspect=container.clientWidth/container.clientHeight;camera.position.z=Math.max(7,5.4/(2*Math.tan(19*Math.PI/180)*camera.aspect));camera.updateProjectionMatrix();wake()});resize.observe(container)
        window.addEventListener("scroll",wake,{passive:true});media.addEventListener("change",wake);document.addEventListener("visibilitychange",wake);wake()
        cleanup=()=>{cancelAnimationFrame(frame);resize.disconnect();window.removeEventListener("scroll",wake);media.removeEventListener("change",wake);document.removeEventListener("visibilitychange",wake);geometry.dispose();material.dispose();renderer.dispose();renderer.domElement.remove()}
      }catch{if(!disposed)setFallback(true)}
    }
    return()=>{disposed=true;observer.disconnect();cleanup()}
  },[])
  return <section ref={root} id="how-i-work" className={`storytelling ${fallback?"storytelling--fallback":""}`} aria-label="How I work">
    <div className="storytelling__stage"><div className="storytelling__intro"><h2>How I<br/>work.</h2></div><div ref={host} className="storytelling__canvas" aria-hidden="true"/>
      <div className="storytelling__caption"><span>{SKILLS[active].label}</span><h3>{SKILLS[active].title}</h3><p>{SKILLS[active].copy}</p></div>
      <span className="storytelling__count">{String(Math.max(1,active)).padStart(2,"0")} / 05</span>
    </div>
    <div className="storytelling__accessible">{SKILLS.slice(1).map(s=><div key={s.label}><h3>{s.label}</h3><p>{s.copy}</p></div>)}</div>
  </section>
}
