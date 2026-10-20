import { useLayoutEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Link } from "react-router"
import { PROJECT_DETAILS } from "./ProjectDetail"
import "./ProjectModal.css"

type Props = { projectId: string; summary: string; poster: string; onClose: () => void }

export default function ProjectModal({ projectId, summary, poster, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const project = PROJECT_DETAILS.find(item => item.id === projectId)!

  useLayoutEffect(() => {
    const element = dialog.current!
    const overflow = document.body.style.overflow
    const opener = document.activeElement as HTMLElement | null
    document.body.style.overflow = "hidden"
    element.showModal()
    return () => {
      element.close()
      document.body.style.overflow = overflow
      opener?.focus({ preventScroll: true })
    }
  }, [])

  return createPortal(
    <dialog ref={dialog} className="project-window" aria-labelledby="project-window-title" data-native-cursor data-lenis-prevent onCancel={event => { event.preventDefault(); onClose() }} onClick={event => {
      if (event.target !== event.currentTarget) return
      const bounds = event.currentTarget.getBoundingClientRect()
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose()
    }}>
      <header className="project-window__bar">
        <span><i aria-hidden="true" /> Selected work / {project.id}</span>
        <button type="button" autoFocus onClick={onClose} aria-label="Close project" data-cursor-hover>Close <span aria-hidden="true">×</span></button>
      </header>
      <div className="project-window__scroll" data-lenis-prevent>
        <div className="project-window__intro">
          <p className="project-window__eyebrow">{project.client}</p>
          <h2 id="project-window-title">{project.title}</h2>
          <section className="project-window__summary" aria-label="Project summary">
            <span className="project-window__eyebrow">TL;DR <span>— Too long; didn’t read</span></span>
            <p>{summary}</p>
          </section>
          <dl className="project-window__facts">
            <div><dt>My role</dt><dd>{project.role}</dd></div>
            <div><dt>The craft</dt><dd>{project.skills.split("\n").join(" · ")}</dd></div>
          </dl>
        </div>
        <figure className="project-window__visual">
          <img src={poster} alt={`${project.title} project mockup`} />
          {project.video && <video src={project.video} poster={poster} controls muted loop playsInline preload="none" />}
        </figure>
        <footer className="project-window__footer">
          <span>A closer look, without losing your place.</span>
          {["02", "04", "08"].includes(project.id) && <Link to={`/case-studies/${project.id === "04" ? "teamio" : project.id === "08" ? "aangan" : "aarthik"}`} data-cursor-hover>Read case study ↗</Link>}
          {project.link && <a href={project.link} target="_blank" rel="noopener noreferrer" data-cursor-hover>{project.link.includes("figma.com/board") ? "Explore design" : project.id === "06" ? "Preview website" : "Visit project"} <span aria-hidden="true">↗</span></a>}
        </footer>
      </div>
    </dialog>, document.body,
  )
}
