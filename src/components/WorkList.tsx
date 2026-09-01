import { useEffect, useRef } from "react"
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

const N = PROJECTS.length
const clamp = (v: number) => Math.min(1, Math.max(0, v))

export default function WorkList() {
  const navigate = useNavigate()
  const sectionRef = useRef<HTMLElement>(null)
  const numberReelRef = useRef<HTMLDivElement>(null)
  const panelReelRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const numberItems = useRef<(HTMLDivElement | null)[]>([])
  const panelItems = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    let raf = 0
    const update = () => {
      const section = sectionRef.current
      if (!section) return
      const vh = window.innerHeight || 1
      const total = Math.max(section.offsetHeight - vh, 1)
      const rect = section.getBoundingClientRect()
      const local = clamp(-rect.top / total)

      // Use strictly linear tracking (no easing) so the scroll list matches
      // the user's physical scroll exactly. This prevents "glitchy" acceleration.
      const pos = local * (N - 1) // continuous 0 -> N-1

      // Slide both reels by the same fraction so number and panel stay locked.
      const shift = (pos / N) * 100
      if (numberReelRef.current) {
        numberReelRef.current.style.transform = `translate3d(0, ${-shift}%, 0)`
      }
      if (panelReelRef.current) {
        panelReelRef.current.style.transform = `translate3d(0, ${-shift}%, 0)`
      }

      // Emphasise whichever item is closest to the read line; fade the rest.
      numberItems.current.forEach((el, i) => {
        if (!el) return
        const d = Math.abs(i - pos)
        el.style.opacity = `${Math.max(0.14, 1 - d * 0.7)}`
        el.style.filter = `blur(${d * 4}px)`
      })
      panelItems.current.forEach((el, i) => {
        if (!el) return
        const d = Math.abs(i - pos)
        el.style.opacity = `${1 - d * 0.5}`
        el.style.transform = `scale(${1 - d * 0.05})`
        el.style.filter = `blur(${d * 8}px)`
      })

      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${pos / (N - 1)})`
      }
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative z-10 bg-white"
      aria-label="Selected work"
    >
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden bg-white text-[var(--ink)]">
        <div className="flex items-center justify-between px-6 pt-8 md:px-12 md:pt-12">
          <span className="text-[13px] font-medium uppercase tracking-[0.22em] text-[var(--ink)]/45">
          </span>
          <span className="text-[13px] font-medium tabular-nums tracking-tight text-[var(--ink)]/45">
            {" "}
          </span>
        </div>

        <div className="grid flex-1 grid-cols-1 items-center gap-8 px-6 md:grid-cols-[0.72fr_1.28fr] md:gap-12 md:px-12 pointer-events-none">
          {/* Left — the counting index reel */}
          <div className="relative hidden h-[46vh] md:flex" style={{ perspective: "1000px" }}>
            <div
              ref={numberReelRef}
              className="work-reel flex flex-col"
              style={{ height: `${N * 46}vh` }}
            >
              {PROJECTS.map((p, i) => (
                <div
                  key={p.num}
                  ref={(el) => {
                    numberItems.current[i] = el
                  }}
                  className="flex h-[46vh] shrink-0 items-center"
                >
                  <span className="text-[clamp(9rem,20vw,17rem)] font-semibold leading-none tracking-[-0.05em] tabular-nums text-[var(--ink)]">
                    {p.num}
                  </span>
                </div>
              ))}
            </div>
            {/* faint read-line marker */}
            <div className="absolute right-0 top-1/2 h-px w-14 -translate-y-1/2 bg-[var(--ink)]/20" />
          </div>

          {/* Right — the switching project panels */}
          <div className="relative h-[64vh]" style={{ perspective: "1000px" }}>
            <div
              ref={panelReelRef}
              className="work-reel flex flex-col pointer-events-auto"
              style={{ height: `${N * 64}vh` }}
            >
              {PROJECTS.map((p, i) => (
                <div
                  key={p.num}
                  ref={(el) => {
                    panelItems.current[i] = el
                  }}
                  className="flex h-[64vh] shrink-0 items-center py-3"
                >
                  <article className="flex h-full w-full flex-col gap-2.5 md:gap-3">
                    {/* Top block — oversized display title */}
                    <div
                      className="relative flex flex-[1.75] flex-col justify-between overflow-hidden rounded-[1.6rem] px-6 py-5 md:px-10 md:py-7"
                      style={{ backgroundColor: p.top, color: p.fg }}
                    >
                      <div
                        className="flex items-center justify-between text-[12px] font-semibold uppercase tracking-[0.14em]"
                        style={{ color: p.fg, opacity: 0.68 }}
                      >
                        <span>{p.kind}</span>
                        <span className="tabular-nums">
                          {p.num} / {p.year}
                        </span>
                      </div>
                      <h3 className="text-[clamp(2.3rem,6.6vw,6rem)] font-black uppercase leading-[0.88] tracking-[-0.03em]">
                        {p.title}
                      </h3>
                    </div>

                    {/* Bottom row — blurb panel + arrow square */}
                    <div className="flex flex-1 gap-2.5 md:gap-3">
                      <div
                        className="flex flex-1 items-center overflow-hidden rounded-[1.6rem] px-6 md:px-10"
                        style={{ backgroundColor: p.bottom, color: p.mutedFg }}
                      >
                        <p className="max-w-2xl text-[14px] leading-snug md:text-lg md:leading-snug">
                          {p.blurb}
                        </p>
                      </div>
                      <button
                        type="button"
                        data-cursor-hover
                        aria-label={`View ${p.title}`}
                        onClick={() => navigate(`/projects/${p.num}`)}
                        className="flex aspect-square h-full shrink-0 items-center justify-center rounded-[1.6rem] transition-transform duration-300 hover:-rotate-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ink)] pointer-events-auto"
                        style={{ backgroundColor: p.action, color: p.actionFg }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-8 w-8 md:h-10 md:w-10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.4}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <path d="M5 12h14" />
                          <path d="M13 6l6 6-6 6" />
                        </svg>
                      </button>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
      
      {/* Invisible Snap Points */}
      <div className="relative z-0 -mt-[100vh] pointer-events-none">
        {PROJECTS.map((_, i) => (
          <div key={i} className="h-screen w-full snap-center" />
        ))}
      </div>
    </section>
  )
}
