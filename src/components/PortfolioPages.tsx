import { useLayoutEffect } from "react"
import { Link } from "react-router"
import { PROJECT_DETAILS } from "./ProjectDetail"
import { projectUpdates } from "./projectUpdates"
import resume from "../Sahil-Sahu-Resume-2026.pdf"
import useBackNavigation from "./useBackNavigation"
import "./PortfolioPages.css"

export default function PortfolioPages({ contact = false }: { contact?: boolean }) {
  const goBack = useBackNavigation()
  useLayoutEffect(() => {
    const old = document.title
    document.title = `${contact ? "Contact" : "Projects"} — Sahil Sahu`
    return () => { document.title = old }
  }, [contact])
  return <main className="portfolio-page">
    <header><Link to="/">Sahil Sahu.</Link><nav><Link to="/">Home</Link><Link to="/projects">Projects</Link><Link to="/contact">Contact</Link></nav></header>
    {contact ? <section className="portfolio-page__contact" data-image-trail><p>Good things start with a conversation.</p><h1>Have an idea?<br /><em>Let’s talk.</em></h1><a href="mailto:sahusahil500@gmail.com">sahusahil500@gmail.com ↗</a><div><Link to="/graphic-design">Graphic design portfolio ↗</Link><a href={resume} download="Sahil_Sahu_Resume_2026.pdf">Download résumé ↓</a></div></section> : <>
      <section className="portfolio-page__intro"><p>Selected work / Product & digital experiences</p><h1>Ideas,<br /><em>made tangible.</em></h1><Link to="/graphic-design">Looking for graphic design? Explore the collection ↗</Link></section>
      <div className="portfolio-page__grid">{PROJECT_DETAILS.map(project => <Link key={project.id} to={`/projects/${project.id}`}><div><img src={projectUpdates[project.id]?.poster ?? (project.id === "01" ? "/project-posters/canact-mockup.webp" : project.id === "02" ? "/project-posters/aarthik-mockup.webp" : project.localImage)} alt={`${project.title} project`} loading="lazy" /></div><span>{project.id} / {project.client}</span><h2>{project.title} ↗</h2><p>{projectUpdates[project.id]?.blurb ?? project.intro.split("\n")[0]}</p></Link>)}</div>
    </>}
    <footer><button type="button" onClick={goBack}>← Back</button><span>© 2026 Sahil Sahu</span></footer>
  </main>
}
