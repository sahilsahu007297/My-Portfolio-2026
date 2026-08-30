import { useEffect, useRef } from "react"

// Projects section à la tricks.de: a dark canvas wrapped by a single, heavily
// italic "PROJECTS" marquee that flows continuously around all four sides like a
// rotating square, above clean hairline rules. In the centre a "View My Projects"
// bar crowns a horizontal row of five ghost cells. On scroll the cells fill left
// to right in a premium graded-grey palette, then perform a smooth framer-motion
// style layout morph — travelling and reshaping from small cells into the full
// project cards — while the canvas eases from near-black to white.

const ACCENT = "#C6F24E"

type Project = {
  n: string
  title: string
  tag: string
  desc: string
  img: string
  color: string
}

const PROJECTS: Project[] = [
  {
    n: "01",
    title: "Nimbus",
    tag: "Analytics SaaS",
    desc: "A real-time analytics workspace — dense data made calm through hierarchy, motion and restraint.",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=900&h=900",
    color: "#8A8D93",
  },
  {
    n: "02",
    title: "Atlas Commerce",
    tag: "Headless Storefront",
    desc: "A composable storefront built for speed and scale — a design system that turned browsing into buying.",
    img: "https://images.unsplash.com/photo-1686061592689-312bbfb5c055?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=900&h=900",
    color: "#9A9DA3",
  },
  {
    n: "03",
    title: "Verve Banking",
    tag: "Fintech App",
    desc: "Money, made legible. Onboarding, cards and insights reimagined for control from the first session.",
    img: "https://images.unsplash.com/photo-1561070791-36c11767b26a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=900&h=900",
    color: "#AAADB3",
  },
  {
    n: "04",
    title: "Loom Studio",
    tag: "Creative Portfolio",
    desc: "A portfolio engine for studios — scroll-driven storytelling and a CMS that never breaks the craft.",
    img: "https://images.unsplash.com/photo-1558655146-d09347e92766?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=900&h=900",
    color: "#BABDC3",
  },
  {
    n: "05",
    title: "Pulse Health",
    tag: "Telehealth Platform",
    desc: "Care that meets people where they are — appointments, records and messaging in one calm flow.",
    img: "https://images.unsplash.com/photo-1560461396-ec0ef7bb29dd?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=900&h=900",
    color: "#CACDD3",
  },
]

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

function Marquee({ anim }: { anim: string }) {
  const vertical = anim.startsWith("mq-y")
  const items = Array.from({ length: 16 }).map((_, i) => (
    <span key={i} className="inline-flex items-center">
      <span className="px-5 italic" style={{ transform: "skewX(-16deg)", display: "inline-block" }}>
        PROJECTS
      </span>
      <svg viewBox="0 0 100 100" className="mx-1 h-[0.42em] w-[0.42em]" aria-hidden>
        {Array.from({ length: 8 }).map((_, k) => (
          <rect key={k} x="46" y="5" width="8" height="90" rx="4" fill="currentColor" transform={`rotate(${k * 22.5} 50 50)`} />
        ))}
      </svg>
    </span>
  ))
  const groupStyle = vertical ? ({ writingMode: "vertical-rl" } as const) : undefined
  return (
    <div className={`marquee-track ${anim}`} style={{ flexDirection: vertical ? "column" : "row" }}>
      <span className={vertical ? "flex flex-col" : "inline-flex"} style={groupStyle}>
        {items}
      </span>
      <span className={vertical ? "flex flex-col" : "inline-flex"} style={groupStyle} aria-hidden>
        {items}
      </span>
    </div>
  )
}

export default function Projects() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<HTMLDivElement>(null)
  const centerFillRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLParagraphElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const fillRefs = useRef<(HTMLDivElement | null)[]>([])
  const contentRefs = useRef<(HTMLDivElement | null)[]>([])
  const numRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    let raf = 0
    const render = () => {
      const wrapper = wrapperRef.current
      if (!wrapper) return
      const vw = window.innerWidth || 1
      const vh = window.innerHeight || 1
      const total = wrapper.offsetHeight - vh
      const local = clamp(window.scrollY - wrapper.offsetTop, 0, total)
      const p = total > 0 ? local / total : 0

      const fillP = clamp(p / 0.34)
      const travel = clamp((p - 0.4) / 0.42) // morph completes ~0.82, then dwells
      const bgP = easeInOut(clamp((p - 0.44) / 0.4))

      // --- Cell row (start) geometry ---
      const cellW = Math.min(120, Math.max(64, vw * 0.11))
      const cellH = cellW * 1.28
      const cellGap = Math.min(28, vw * 0.02)
      const rowW = 5 * cellW + 4 * cellGap
      const rowX = (vw - rowW) / 2
      const rowY = vh * 0.55

      // --- Card stack (end) geometry ---
      const cardW = Math.min(880, vw * 0.86)
      const cardGap = Math.max(10, vh * 0.016)
      const cardH = Math.min(150, (vh * 0.8 - 4 * cardGap) / 5)
      const cardX = (vw - cardW) / 2
      const stackY = (vh - (5 * cardH + 4 * cardGap)) / 2

      PROJECTS.forEach((_, i) => {
        const card = cardRefs.current[i]
        if (!card) return
        const m = easeInOut(clamp((travel - i * 0.07) / 0.62))

        const x = lerp(rowX + i * (cellW + cellGap), cardX, m)
        const y = lerp(rowY, stackY + i * (cardH + cardGap), m)
        const w = lerp(cellW, cardW, m)
        const h = lerp(cellH, cardH, m)
        const rad = lerp(16, 22, m)

        card.style.left = `${x.toFixed(1)}px`
        card.style.top = `${y.toFixed(1)}px`
        card.style.width = `${w.toFixed(1)}px`
        card.style.height = `${h.toFixed(1)}px`
        card.style.borderRadius = `${rad.toFixed(1)}px`
        card.style.borderColor = `rgba(198, 242, 78, ${(0.4 * (1 - m)).toFixed(3)})`

        const fill = fillRefs.current[i]
        if (fill) {
          const fp = clamp((fillP - i * 0.05) / 0.78)
          fill.style.transform = `scaleX(${(travel > 0 ? 1 : fp).toFixed(3)})`
        }
        const content = contentRefs.current[i]
        if (content) content.style.opacity = clamp((m - 0.6) / 0.4).toFixed(3)
        const num = numRefs.current[i]
        if (num) num.style.opacity = clamp(1 - m / 0.4).toFixed(3)
      })

      const center = centerRef.current
      if (center) {
        center.style.opacity = clamp(1 - travel / 0.3).toFixed(3)
        center.style.transform = `translateY(${(-travel * 48).toFixed(1)}px)`
      }
      if (centerFillRef.current) centerFillRef.current.style.width = `${(clamp(fillP / 0.85) * 100).toFixed(2)}%`
      if (labelRef.current) labelRef.current.style.opacity = clamp(1 - travel / 0.3).toFixed(3)

      const bg = stickyRef.current
      if (bg) {
        const c = Math.round(10 + bgP * 245)
        bg.style.backgroundColor = `rgb(${c}, ${c}, ${c})`
      }
      if (frameRef.current) frameRef.current.style.opacity = clamp(1 - bgP * 1.5).toFixed(3)
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(render)
    }
    render()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={wrapperRef} className="relative z-10 h-[420vh]">
      <div ref={stickyRef} className="sticky top-0 h-screen overflow-hidden" style={{ backgroundColor: "#0a0a0a" }}>
        {/* Continuous four-sided italic PROJECTS marquee (rotating square) */}
        <div ref={frameRef} className="pointer-events-none absolute inset-0 z-30 font-black uppercase tracking-tight" style={{ color: ACCENT }}>
          <div className="absolute inset-x-0 top-0">
            <div className="overflow-hidden py-3 text-[2.4vw]">
              <Marquee anim="mq-x-rev" />
            </div>
            <div className="h-px w-full" style={{ backgroundColor: ACCENT, opacity: 0.45 }} />
          </div>
          <div className="absolute inset-x-0 bottom-0">
            <div className="h-px w-full" style={{ backgroundColor: ACCENT, opacity: 0.45 }} />
            <div className="overflow-hidden py-3 text-[2.4vw]">
              <Marquee anim="mq-x" />
            </div>
          </div>
          <div className="absolute inset-y-0 left-0 flex text-[2.4vw]">
            <div className="overflow-hidden px-3">
              <Marquee anim="mq-y" />
            </div>
            <div className="h-full w-px self-stretch" style={{ backgroundColor: ACCENT, opacity: 0.45 }} />
          </div>
          <div className="absolute inset-y-0 right-0 flex text-[2.4vw]">
            <div className="h-full w-px self-stretch" style={{ backgroundColor: ACCENT, opacity: 0.45 }} />
            <div className="overflow-hidden px-3">
              <Marquee anim="mq-y-rev" />
            </div>
          </div>
        </div>

        {/* Center label + CTA bar */}
        <p ref={labelRef} className="absolute left-1/2 top-[26%] z-20 -translate-x-1/2 text-[11px] font-semibold uppercase tracking-[0.4em]" style={{ color: ACCENT, opacity: 0.7 }}>
          Selected Work — 2024/25
        </p>
        <div
          ref={centerRef}
          className="absolute left-1/2 top-[36%] z-20 flex h-16 w-[min(560px,78vw)] -translate-x-1/2 items-center justify-center overflow-hidden rounded-full will-change-transform md:h-[4.5rem]"
          style={{ border: `1.5px solid ${ACCENT}` }}
        >
          <div ref={centerFillRef} className="absolute inset-y-0 left-0 w-0" style={{ backgroundColor: ACCENT }} />
          <span className="relative z-10 text-[clamp(1.1rem,2.4vw,1.7rem)] font-black uppercase tracking-tight mix-blend-difference" style={{ color: "#fff" }}>
            View My Projects
          </span>
        </div>

        {/* Morphing elements: ghost cells → project cards */}
        {PROJECTS.map((pr, i) => (
          <div
            key={pr.n}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            className="absolute z-10 overflow-hidden will-change-transform"
            style={{ border: `1.5px solid rgba(198,242,78,0.4)` }}
          >
            {/* grey base — fills left-to-right during loading */}
            <div
              ref={(el) => {
                fillRefs.current[i] = el
              }}
              className="absolute inset-0 origin-left"
              style={{ backgroundColor: pr.color, transform: "scaleX(0)" }}
            />
            {/* cell number */}
            <span
              ref={(el) => {
                numRefs.current[i] = el
              }}
              className="absolute left-2 top-2 z-10 text-[10px] font-bold"
              style={{ color: ACCENT }}
            >
              {pr.n}
            </span>
            {/* project card content (revealed as the morph completes) */}
            <div
              ref={(el) => {
                contentRefs.current[i] = el
              }}
              className="absolute inset-0 flex items-stretch"
              style={{ opacity: 0 }}
            >
              <div className="h-full shrink-0 bg-neutral-300" style={{ aspectRatio: "1 / 1" }}>
                <img src={pr.img} alt={`${pr.title} — ${pr.tag}`} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="flex min-w-0 flex-1 items-center justify-between gap-4 px-5 md:px-7">
                <div className="min-w-0">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-black/45">{pr.tag}</p>
                  <h3 className="truncate text-2xl font-black uppercase leading-none tracking-tight text-[#16181c] md:text-4xl">
                    {pr.title}
                  </h3>
                  <p className="mt-1 hidden truncate text-xs text-black/60 md:block">{pr.desc}</p>
                </div>
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#16181c] text-white">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2}>
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
