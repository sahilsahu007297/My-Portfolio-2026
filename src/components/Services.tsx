import { useEffect, useRef } from "react"
import "./Services.css"

type Service = {
  num: string
  color: string
  fg: string
  title: string
  intro: string
}

const SERVICES: Service[] = [
  {
    num: "01",
    color: "#524646",
    fg: "#FCF2E5",
    title: "I Design",
    intro:
      "Turning problems into purposeful products — from research, flows and UI to design systems and high-fidelity, accessible interfaces people understand, enjoy and return to.",
  },
  {
    num: "02",
    color: "#A8A492",
    fg: "#111111",
    title: "I Build",
    intro:
      "Taking ideas beyond the canvas — front-end implementation, interactive prototypes, motion and component thinking that turn design decisions into functional experiences.",
  },
  {
    num: "03",
    color: "#FCF2E5",
    fg: "#111111",
    title: "I Improve",
    intro:
      "Designing for what happens after users arrive — activation, conversion and retention, experimentation and journey optimization. Experiences that don't just work, they grow.",
  },
  {
    num: "04",
    color: "#524646",
    fg: "#FCF2E5",
    title: "I Strategize",
    intro:
      "Connecting user needs, business goals and product direction — problem framing, positioning, journey mapping and roadmaps. Deciding why it deserves to exist before building it.",
  },
  {
    num: "05",
    color: "#A8A492",
    fg: "#111111",
    title: "I Design Systems",
    intro:
      "Designing the structure behind the experience — design systems, information architecture, tokens and scalable patterns. Consistency across products without killing flexibility.",
  },
]

const clamp = (value: number) => Math.min(1, Math.max(0, value))

export default function Services() {
  const wrapperRef = useRef<HTMLElement>(null)
  const periodRef = useRef<HTMLSpanElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const introRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let frame = 0

    const render = () => {
      frame = 0
      if (!wrapper.getClientRects().length || reducedMotion.matches) return
      const viewport = window.innerHeight
      const top = wrapper.getBoundingClientRect().top
      const progress = clamp(-top / Math.max(1, wrapper.offsetHeight - viewport))
      // The reference holds its intro for the first fifth of the pinned scroll.
      const travel = clamp((progress - 0.16) / 0.62)
      const introProgress = clamp((viewport - top) / (viewport * 2))
      const introOpacity = clamp(introProgress / 0.5) * (1 - clamp((introProgress - 0.85) / 0.15))
      if (introRef.current) {
        introRef.current.style.opacity = String(introOpacity)
        introRef.current.style.transform = `scale(${0.95 + introProgress * 0.1})`
      }
      const width = wrapper.clientWidth
      const slideWidth = slideRefs.current[0]?.offsetWidth || width * 0.7
      const end = (width - slideWidth) / 2 - slideWidth * (SERVICES.length - 1)
      const x = width + (end - width) * travel
      if (trackRef.current) trackRef.current.style.transform = `translate3d(${x}px, 0, 0)`
      const drop = clamp((progress - .82) / .18)
      if (periodRef.current && dropRef.current) {
        const rect = periodRef.current.getBoundingClientRect()
        const size = Math.max(6, rect.height * .14)
        const falling = clamp(drop / .55)
        const expand = clamp((drop - .48) / .48)
        const startX = rect.left + rect.width / 2
        const startY = rect.bottom - rect.height * .17
        const cx = startX + (width * .5 - startX) * falling
        const cy = startY + (viewport * .72 - startY) * falling * falling
        const diameter = size + Math.hypot(width, viewport) * 2.3 * expand * expand
        dropRef.current.style.cssText = `opacity:${drop>0?1:0};width:${diameter}px;height:${diameter}px;left:${cx}px;top:${cy}px`
        periodRef.current.style.visibility = drop>0 ? "hidden" : "visible"
      }
      slideRefs.current.forEach((slide, index) => {
        if (!slide) return
        const visible = x + index * slideWidth < width * 0.85
        slide.dataset.visible = String(visible)
      })

    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render)
    }
    const observer = new ResizeObserver(schedule)
    observer.observe(wrapper)
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    reducedMotion.addEventListener("change", schedule)
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      reducedMotion.removeEventListener("change", schedule)
    }
  }, [])

  return (
    <section ref={wrapperRef} className="services-method" aria-label="My services">
      <div className="services-method__stage">
        <div ref={introRef} className="services-method__intro">
          <span className="services-method__eyebrow">[ My services ]</span>
          <h2>What I do.</h2>
          <p className="services-method__summary">Design. Build. Improve. Strategize. Design systems.</p>
          <span className="services-method__hint">Scroll to explore</span>
        </div>
        <div ref={trackRef} className="services-method__track">
          {SERVICES.map((service, index) => (
            <article
              key={service.num}
              ref={(node) => { slideRefs.current[index] = node }}
              className="services-method__slide"
              data-visible={index === 0 ? "true" : "false"}
              aria-label={`${service.num}. ${service.title}`}
            >
              <span className="services-method__number" aria-hidden="true" style={{ color: index === 0 ? "#FCF2E5" : service.color }}>{service.num}</span>
              <div className="services-method__content">
                <h3 aria-label={service.title}>
                  {Array.from(service.title).map((letter, letterIndex) => (
                    <span key={letterIndex} aria-hidden="true" style={{ transitionDelay: `${letterIndex * 60}ms` }}>{letter === " " ? "\u00a0" : letter}</span>
                  ))}
                  <span ref={index===4?periodRef:undefined} aria-hidden="true">.</span>
                </h3>
                <div className="services-method__rule" />
                <p>{service.intro}</p>
              </div>
            </article>
          ))}
        </div>
        <div ref={dropRef} className="services-method__drop" aria-hidden="true" />
      </div>
    </section>
  )
}
