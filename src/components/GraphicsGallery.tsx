import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { graphicWorks, type GraphicCategory, type GraphicWork } from "./graphicWorks"
import resume from "../Sahil-Sahu-Resume-2026.pdf"
import SkyHero from "./SkyHero"
import useBackNavigation from "./useBackNavigation"
import { graphicThumbnail, graphicSrcSet } from "./graphicImages"
import "./GraphicsGallery.css"

const categories: { id: GraphicCategory; name: string; description: string }[] = [
  { id: "cars", name: "Driven by design.", description: "Car posters / Speed, silhouette & a little obsession." },
  { id: "branding", name: "More than a mark.", description: "Branding / Identities with a world of their own." },
  { id: "restaurants", name: "Made to make you hungry.", description: "Restaurant posters / Big flavour. Even bigger personality." },
  { id: "cafe", name: "Good taste, on repeat.", description: "Café campaigns / Small rituals. Strong impressions." },
  { id: "editorial", name: "A little out of the ordinary.", description: "Editorial & campaigns / Fashion, objects, drinks & invitations." },
]

function ArtworkViewer({ initial, close }: { initial: GraphicWork; close: () => void }) {
  const [index, setIndex] = useState(graphicWorks.indexOf(initial))
  const dialog = useRef<HTMLDialogElement>(null)
  const work = graphicWorks[index]
  useEffect(() => {
    for (const offset of [-1, 1]) {
      const image = new Image()
      image.src = graphicWorks[(index + offset + graphicWorks.length) % graphicWorks.length].src
    }
  }, [index])
  useLayoutEffect(() => {
    const el = dialog.current!, opener = document.activeElement as HTMLElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"; el.showModal()
    return () => { el.close(); document.body.style.overflow = overflow; opener?.focus({ preventScroll: true }) }
  }, [])
  const next = (delta: number) => setIndex(i => (i + delta + graphicWorks.length) % graphicWorks.length)
  return createPortal(<dialog ref={dialog} className="art-viewer" aria-label="Artwork viewer" data-lenis-prevent onCancel={e => { e.preventDefault(); close() }} onKeyDown={e => {
    if (e.key === "ArrowRight") next(1)
    if (e.key === "ArrowLeft") next(-1)
  }}>
    <header><span>{work.title}</span><button autoFocus onClick={close} aria-label="Close artwork">Close ×</button></header>
    <div className="art-viewer__image"><img src={work.src} alt={work.title} /></div>
    <footer><button onClick={() => next(-1)} aria-label="Previous artwork">← Previous</button><span>{index + 1} / {graphicWorks.length}</span><button onClick={() => next(1)} aria-label="Next artwork">Next →</button></footer>
  </dialog>, document.body)
}

export default function GraphicsGallery() {
  const goBack = useBackNavigation("/#graphic-design")
  const root = useRef<HTMLElement>(null)
  const [selected, setSelected] = useState<GraphicWork | null>(null)
  const [filter, setFilter] = useState<GraphicCategory | "all">("all")
  const glass = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const title = document.title
    document.title = "Sahil Sahu — Graphic Design Portfolio"
    return () => { document.title = title }
  }, [])
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)")
    const cards = root.current!.querySelectorAll<HTMLElement>(".graphic-card")
    const visible = new Set<HTMLElement>()
    let frame = 0
    const update = () => {
      frame = 0
      if (glass.current) glass.current.style.opacity = !reduced.matches && scrollY > 200 ? "1" : "0"
      visible.forEach(card => {
        const rect = card.getBoundingClientRect()
        const progress = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - innerHeight / 2) / innerHeight))
        card.style.setProperty("--card-tilt", `${reduced.matches ? 0 : progress * -3}deg`)
        card.style.setProperty("--glass-position", `${50 + progress * 55}%`)
      })
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target as HTMLElement) : visible.delete(entry.target as HTMLElement)); schedule() }, { rootMargin: "100px" })
    cards.forEach(card => observer.observe(card))
    window.addEventListener("scroll", schedule, { passive: true })
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule) }
  }, [filter])
  return <main ref={root} className="graphic-portfolio">
    <button type="button" className="graphic-return" onClick={goBack}>← Return to main portfolio</button>
    <SkyHero />
    <header className="graphic-masthead"><button type="button" onClick={goBack}>← Back</button><span>Independent designer / 2026</span><a href="#graphic-contact">Let’s talk ↗</a></header>
    <nav className="graphic-filters" aria-label="Artwork categories">
      <button onClick={() => setFilter("all")} aria-pressed={filter === "all"}>All work <sup>{graphicWorks.length}</sup></button>
      {categories.map(c => <button key={c.id} onClick={() => setFilter(c.id)} aria-pressed={filter === c.id}>{c.id === "cars" ? "Car posters" : c.id === "cafe" ? "Café" : c.id === "editorial" ? "Editorial" : c.id === "branding" ? "Branding" : "Restaurants"} <sup>{graphicWorks.filter(w => w.category === c.id).length}</sup></button>)}
    </nav>
    <div id="graphic-work" className="graphic-collections">
      {categories.filter(c => filter === "all" || c.id === filter).map((category, ci) => <section key={category.id} id={`graphic-${category.id}`} className="graphic-collection">
        <header><p>{String(categories.indexOf(category) + 1).padStart(2, "0")} / {category.description}</p><h2>{category.name}</h2></header>
        <div className="graphic-grid">{graphicWorks.filter(work => work.category === category.id).map((work, i) => <figure key={work.id} className={`graphic-card ${work.width > work.height ? "graphic-card--wide" : ""}`}>
          <button className="graphic-card__frame" onClick={() => setSelected(work)} aria-label={`View ${work.title}`}>
            <img src={graphicThumbnail(work, 800)} srcSet={graphicSrcSet(work)} sizes={work.width > work.height ? "93vw" : "(max-width: 700px) 90vw, 45vw"} alt={work.title} width={work.width} height={work.height} loading={ci === 0 && i < 2 ? "eager" : "lazy"} decoding="async" />
            <span className="graphic-card__glass" aria-hidden="true" />
            <span className="graphic-card__open">View artwork ↗</span>
          </button>
          <figcaption><span>{work.title}</span><span>{work.id} ↗</span></figcaption>
        </figure>)}</div>
        {category.id === "branding" && filter === "all" && <aside className="graphic-about"><p>I’m Sahil. I turn a feeling into a visual language — through expressive typography, considered colour, and images that stay with you.</p><div><span>The practice ↴</span><span>Brand identity<br />Campaign design<br />Poster design<br />Art direction</span></div></aside>}
      </section>)}
    </div>
    <footer id="graphic-contact" className="graphic-contact"><p>Have something in mind?</p><h2>Let’s make<br /><em>an impression.</em></h2><a className="graphic-contact__email" href="mailto:sahusahil500@gmail.com">sahusahil500@gmail.com ↗</a><div><button type="button" onClick={goBack}>← Back</button><a href={resume} download="Sahil_Sahu_Resume_2026.pdf">Résumé 2026 ↓</a><a href="#top" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }) }}>Back to top ↑</a><span>© 2026 Sahil Sahu</span></div></footer>
    {selected && <ArtworkViewer initial={selected} close={() => setSelected(null)} />}
    <svg width="0" height="0" aria-hidden="true" className="graphic-glass-filter"><defs><filter id="graphic-scroll-refraction" x="-10%" y="-30%" width="120%" height="160%" colorInterpolationFilters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".005 .012" numOctaves="1" seed="4" result="glassMap" /><feDisplacementMap in="SourceGraphic" in2="glassMap" scale="24" xChannelSelector="R" yChannelSelector="G" /></filter></defs></svg>
    <div ref={glass} className="graphic-scroll-glass" aria-hidden="true" />
  </main>
}
