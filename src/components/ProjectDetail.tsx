import { useLayoutEffect, ReactNode } from "react"
import { useNavigate, useParams } from "react-router"
import CustomCursor from "./CustomCursor"
import canactVideo from "../Assets/Canact.mp4"
import meridianVideo from "../Assets/Meridian.mp4"
import northstarImage from "../Assets/northstar.png"
import logiflowImage from "../Assets/logiflow.jpg"
import teamioImage from "../Assets/teamio.png"

const url = (id: string, w = 1800) =>
  `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=82&w=${w}`

const formatText = (text: string): ReactNode => {
  return text.split('\n').map((line, i) => (
    <span key={i} className="block mb-4 last:mb-0">
      {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="font-semibold text-black">{part.slice(2, -2)}</strong>
        }
        return <span key={j}>{part}</span>
      })}
    </span>
  ))
}

const PROJECTS = [
  {
    id: "01",
    title: "CANACT",
    fullTitle: "CANACT — Social Connection Platform",
    client: "Consumer Social",
    timeline: "2024",
    role: "Product Designer",
    skills: "UX/UI Design\nUser Flows\nGTM Strategy",
    intro: "Designed a modern social platform enabling people in close proximity to discover and connect.\n\nDefined the product’s GTM strategy and created the complete product experience in Figma, focusing on intuitive interactions.",
    image: "photo-1738676524296-364cf18900a8",
    video: canactVideo,
    color: "#36353B",
    link: "https://www.figma.com/board/MXzFBQ9dILqx815mcCE9rq/CANACT?node-id=0-1&t=p0BIFi235vNMA5wu-1",
  },
  {
    id: "02",
    title: "Meridian",
    fullTitle: "Meridian — Fintech Platform",
    client: "Fintech Startup",
    timeline: "2024",
    role: "Product Designer",
    skills: "Fintech UX\nProduct Strategy\nInterface Design",
    intro: "Designed a next-generation fintech experience to help users **understand, manage, and use their money better**.\n\nCreated an intelligent, action-oriented approach to personal finance supported by deep product research and strategic planning.",
    image: "photo-1765371513276-a74f1ecbcf7d",
    video: meridianVideo,
    color: "#5C6667",
    link: "https://www.figma.com/board/nN47af9lhOLQYIGnaZNt63/MERIDIAN?node-id=0-1&t=ToJA74xF9Qe4hG4J-1",
  },
  {
    id: "03",
    title: "LogiFlow",
    fullTitle: "LogiFlow — AI Logistics System",
    client: "Enterprise Logistics",
    timeline: "2024",
    role: "Lead Designer & Developer",
    skills: "Enterprise SaaS\nNext.js & React\nSystem Architecture",
    intro: "Designed and developed an enterprise logistics platform spanning **20+ operational modules** for fleet and compliance management.\n\nBuilt the scalable SaaS interface using Next.js and React, featuring real-time GPS tracking and shipment intelligence.",
    image: "photo-1690321607902-2799a1e8eaaa",
    localImage: logiflowImage,
    color: "#8E9C8F",
    link: "https://maker-access-07940964.figma.site",
    noImageEffects: true,
  },
  {
    id: "04",
    title: "Teamio",
    fullTitle: "Teamio — HRMS Platform",
    client: "B2B Enterprise",
    timeline: "2024",
    role: "Designer & Developer",
    skills: "HRMS Workflows\nDesign Systems\nAuthentication",
    intro: "Developed a cohesive HRMS platform centralizing employee management, payroll, and attendance into a streamlined system.\n\nEstablished a consistent design system and secure workflows to deliver an enterprise-ready experience.",
    image: "photo-1653511442060-00c7b10827c4",
    localImage: teamioImage,
    color: "#DFDFD9",
    noImageEffects: true,
  },
  {
    id: "05",
    title: "NorthStar",
    fullTitle: "NorthStar — BI & Finance",
    client: "Enterprise Financial",
    timeline: "2024",
    role: "Product Designer",
    skills: "Data Visualisation\nBusiness Intelligence\nDashboard Design",
    intro: "Designed an enterprise-grade financial command centre featuring real-time business intelligence dashboards.\n\nIntegrated live financial calculators for **CAC/LTV, break-even, and runway forecasting** to drive executive decision-making.",
    image: "photo-1784986717568-a19e6575ad91",
    localImage: northstarImage,
    color: "#5C6667",
    link: "https://operations-dashboard-silk.vercel.app/",
  },
]

export default function ProjectDetail() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const project = PROJECTS.find((item) => item.id === projectId) ?? PROJECTS[0]
  const goBack = () => {
    navigate("/#projects", { replace: true })
  }

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [project.id])

  return (
    <main className="min-h-screen bg-white text-[#111111]">
      <CustomCursor />
      <header className="flex items-center justify-between border-b border-black/15 px-5 py-5 text-sm font-medium tracking-tight md:px-10">
        <button type="button" data-cursor-hover onClick={goBack} className="transition-opacity hover:opacity-55 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111]">
          ← Back
        </button>
        <span>Sahil Sahu</span>
        <span className="hidden text-black/45 sm:block">Selected work / {project.id}</span>
      </header>

      <section className="mx-auto grid max-w-[110rem] gap-12 px-5 pb-16 pt-16 md:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.72fr)] md:px-10 md:pb-24 md:pt-24">
        <div>
          <p className="mb-7 text-xs font-semibold uppercase tracking-[0.22em] text-[#5C6667]">Case study / {project.id}</p>
          <h1 className="max-w-5xl text-[clamp(5rem,15vw,15rem)] font-black uppercase leading-[0.74] tracking-[-0.085em]">
            {project.title}
          </h1>
          <div className="mt-10 max-w-3xl text-xl leading-snug tracking-tight text-black/75 md:text-2xl">
            {formatText(project.intro)}
          </div>
          
          {project.link && (
            <div className="mt-10">
              <a href={project.link} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#111111] px-7 py-4 text-[13px] font-semibold tracking-widest text-white uppercase transition-all hover:scale-[1.02] active:scale-[0.98]" data-cursor-hover>
                <span>Click to view design</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 transition-transform group-hover:translate-x-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </a>
            </div>
          )}
        </div>

        <dl className="grid content-end grid-cols-2 gap-x-8 gap-y-9 border-t border-black/15 pt-7 text-base md:border-t-0 md:pt-0">
          <div><dt className="mb-2 text-xs uppercase tracking-[0.16em] text-black/45">Client</dt><dd>{project.client}</dd></div>
          <div><dt className="mb-2 text-xs uppercase tracking-[0.16em] text-black/45">Role</dt><dd>{project.role}</dd></div>
          <div><dt className="mb-2 text-xs uppercase tracking-[0.16em] text-black/45">Skills</dt><dd className="whitespace-pre-line">{project.skills}</dd></div>
        </dl>
      </section>

      <section className="px-5 pb-5 md:px-10 md:pb-10">
        <figure className="relative mx-auto max-w-[75rem] overflow-hidden rounded-[2rem]" style={{ backgroundColor: project.color }}>
          {project.video ? (
            <video
              src={project.video}
              autoPlay
              loop
              muted
              playsInline
              onCanPlay={(e) => { e.currentTarget.playbackRate = 1.5; }}
              className={`aspect-[16/9] w-full object-cover ${project.noImageEffects ? '' : 'mix-blend-luminosity opacity-90'}`}
            />
          ) : (
            <img src={project.localImage ?? url(project.image)} alt={`${project.fullTitle} project visual`} className={`aspect-[16/9] w-full object-cover ${project.noImageEffects ? '' : 'mix-blend-luminosity opacity-90'}`} />
          )}
          <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/65 to-transparent px-6 pb-6 pt-20 text-sm font-medium md:px-10 md:pb-9">
            <span>{project.fullTitle}</span><span>{project.id} / 0{PROJECTS.length}</span>
          </figcaption>
        </figure>
      </section>

      <section className="mx-auto grid max-w-[110rem] gap-6 px-5 py-20 md:grid-cols-[0.75fr_1.25fr] md:px-10 md:py-32">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5C6667]">The outcome</p>
        <p className="max-w-4xl text-[clamp(2rem,4vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.055em]">A deliberately focused experience, designed to make the complex feel immediate.</p>
      </section>

      <footer className="flex items-center justify-between border-t border-black/15 px-5 py-6 text-sm md:px-10">
        <button type="button" data-cursor-hover onClick={goBack} className="hover:text-[#5C6667]">Back to all work</button>
        <span>© Sahil Sahu</span>
      </footer>
    </main>
  )
}
