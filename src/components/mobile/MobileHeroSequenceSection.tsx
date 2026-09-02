import React, { useEffect, useRef, useState } from "react"
import Waves from "../Waves"

/* ─── Philosophy pointer data ─── */
const POINTER_DATA = [
  { n: "01", t: "OBSERVE", q: "\"Everything starts with curiosity.\"" },
  { n: "02", t: "QUESTION", q: "\"Why does it work this way?\"" },
  { n: "03", t: "UNDERSTAND", q: "\"Look beneath the interface.\"" },
  { n: "04", t: "CONNECT", q: "\"Find the relationship between people, product, and business.\"" },
  { n: "05", t: "DEFINE", q: "\"Turn complexity into a problem worth solving.\"" },
  { n: "06", t: "EXPLORE", q: "\"Imagine more than one way forward.\"" },
  { n: "07", t: "BUILD", q: "\"Give ideas structure.\"" },
  { n: "08", t: "DESIGN", q: "\"Make the complex feel obvious.\"" },
  { n: "09", t: "LAUNCH", q: "\"Put the work into the real world.\"" },
  { n: "10", t: "LEARN", q: "\"Measure. Learn. Evolve.\"" },
]

const POINTER_POS: React.CSSProperties[] = [
  { left: 0, right: 0, margin: "0 auto", bottom: "8vh", textAlign: "center" },
  { left: 0, right: 0, margin: "0 auto", bottom: "8vh", textAlign: "center" },
  { left: 0, right: 0, margin: "0 auto", bottom: "8vh", textAlign: "center" },
  { left: 0, right: 0, margin: "0 auto", bottom: "8vh", textAlign: "center" },
  { left: 0, right: 0, margin: "0 auto", bottom: "8vh", textAlign: "center" },
  { left: 0, right: 0, margin: "0 auto", bottom: "8vh", textAlign: "center" },
  { left: 0, right: 0, margin: "0 auto", bottom: "8vh", textAlign: "center" },
  { left: 0, right: 0, margin: "0 auto", bottom: "8vh", textAlign: "center" },
  { left: 0, right: 0, margin: "0 auto", bottom: "8vh", textAlign: "center" },
  { left: 0, right: 0, margin: "0 auto", bottom: "8vh", textAlign: "center" },
]

const FRAME_COUNT = 300
const BASE_PATH = "/sequence/ezgif-frame-"

function padFrame(i: number): string {
  return String(i).padStart(3, "0")
}
function clamp(v: number) {
  return Math.min(1, Math.max(0, v))
}
function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 2)
}
function easeIn(t: number) {
  return t * t
}

// Taupe asterisk / flower mark.
function Asterisk({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <rect
          key={i}
          x="42"
          y="6"
          width="16"
          height="88"
          rx="8"
          fill="var(--taupe)"
          transform={`rotate(${i * 30} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="10" fill="var(--page-bg)" />
    </svg>
  )
}

interface Props {
  indiaTime: string
  onResumeClick: () => void
}

export default function HeroSequenceSection({ indiaTime, onResumeClick }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const philoRef = useRef<HTMLDivElement>(null)
  const h1Ref = useRef<HTMLHeadingElement>(null)
  const curtainRef = useRef<HTMLDivElement>(null)
  const pointerRefs = useRef<(HTMLDivElement | null)[]>([])
  const imagesRef = useRef<HTMLImageElement[]>([])
  const initDoneRef = useRef(false)
  const lastFrameRef = useRef(-1)

  // Preload all frames
  useEffect(() => {
    const imgs: HTMLImageElement[] = []
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image()
      img.src = `${BASE_PATH}${padFrame(i)}.jpg`
      imgs.push(img)
    }
    imagesRef.current = imgs
  }, [])

  // Single rAF scroll loop for everything
  useEffect(() => {
    let raf = 0

    const update = () => {
      const section = sectionRef.current
      const canvas = canvasRef.current
      const hero = heroRef.current
      const overlay = overlayRef.current
      const philoWrap = philoRef.current
      const philoH1 = h1Ref.current
      const curtain = curtainRef.current
      if (!section || !canvas) return

      const ctx = canvas.getContext("2d", { alpha: false })
      if (!ctx) return

      const vh = window.innerHeight || 1
      const total = Math.max(section.offsetHeight - vh, 1)
      const rect = section.getBoundingClientRect()
      const localScroll = Math.max(0, -rect.top)
      
      // Total snaps = 24. Max scroll = 24 * 100vh.
      const pos = (localScroll / total) * 24

      let targetFrame = 0

      /* ── Dark overlay: starts light, fades out ── */
      if (overlay) {
        if (pos <= 0) {
          overlay.style.opacity = "0.7"
        } else if (pos <= 2) {
          // Fade overlay back out as philosophy text zooms
          const zp = clamp(pos - 1)
          overlay.style.opacity = `${(0.7 * (1 - easeIn(zp))).toFixed(3)}`
        } else {
          overlay.style.opacity = "0"
        }
      }

      /* ── Philosophy text (pos 0 to 2) ── */
      if (pos < 0) {
        if (philoWrap) philoWrap.style.display = "none"
        targetFrame = 0
        hidePointers()
      } else if (pos <= 1) {
        // Text rises from below (pos 0 to 1)
        const p = clamp(pos)
        const e = easeOut(p)
        if (philoH1) {
          philoH1.style.transform = `translateY(${(1 - e) * 100}vh)`
          philoH1.style.opacity = `${e}`
        }
        if (philoWrap) philoWrap.style.display = "flex"
        targetFrame = 0
        hidePointers()
      } else if (pos <= 2) {
        // Text zooms (pos 1 to 2)
        const p = clamp(pos - 1)
        const e = easeIn(p)
        if (philoH1) {
          philoH1.style.transform = `scale(${1 + e * 60})`
          const fadeP = clamp((p - 0.75) / 0.25)
          philoH1.style.opacity = `${1 - fadeP}`
        }
        if (philoWrap) philoWrap.style.display = "flex"
        targetFrame = 0
        hidePointers()
      } else if (pos <= 24) {
        /* ── Image sequence plays (pos 2 to 24) ── */
        if (philoWrap) philoWrap.style.display = "none"
        const sp = clamp((pos - 2) / 22)
        targetFrame = Math.min(FRAME_COUNT - 1, Math.floor(sp * FRAME_COUNT))
        updatePointers(pos)
      } else {
        /* ── Past sequence — hold last frame ── */
        if (philoWrap) philoWrap.style.display = "none"
        targetFrame = FRAME_COUNT - 1
        hidePointers()
      }



      /* ── Draw frame ── */
      const img = imagesRef.current[targetFrame]
      if (img && img.complete && img.naturalWidth) {
        if (!initDoneRef.current) {
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          initDoneRef.current = true
        }
        if (lastFrameRef.current !== targetFrame) {
          ctx.drawImage(img, 0, 0)
          lastFrameRef.current = targetFrame
        }
      }
    }

    function hidePointers() {
      pointerRefs.current.forEach((el) => {
        if (el) el.style.opacity = "0"
      })
    }

    function updatePointers(pos: number) {
      for (let i = 0; i < POINTER_DATA.length; i++) {
        // Pointer i is active when pos is around (i * 2 + 4).
        const pTarget = i * 2 + 4
        let opacity = 0
        let ty = 30

        if (pos > pTarget - 1.5 && pos < pTarget + 1.5) {
          if (pos < pTarget) {
            // entering (pTarget - 1.5 to pTarget)
            const t = (pos - (pTarget - 1.5)) / 1.5
            opacity = easeIn(t)
            ty = (1 - easeOut(t)) * 40
          } else {
            // exiting (pTarget to pTarget + 1.5)
            const t = (pos - pTarget) / 1.5
            opacity = 1 - easeOut(t)
            ty = easeIn(t) * -20
          }
        } else if (pos === pTarget) {
          opacity = 1
          ty = 0
        }

        const el = pointerRefs.current[i]
        if (el) {
          el.style.opacity = opacity.toFixed(3)
          el.style.transform = `translateY(${ty}px)`
        }
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
    <section ref={sectionRef} className="relative bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* z-0: Canvas — the ONLY image source for the entire app sequence */}
        <canvas
          ref={canvasRef}
          className="fixed inset-0 h-full w-full object-cover pointer-events-none"
          style={{ zIndex: 0 }}
        />

        {/* z-1: Dark overlay */}
        <div
          ref={overlayRef}
          className="pointer-events-none fixed inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10"
          style={{ zIndex: 1, opacity: 0.7 }}
        />

        {/* z-3: THE PHILOSOPHY heading */}
        <div
          ref={philoRef}
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{ zIndex: 3, display: "none" }}
        >
          <h1
            ref={h1Ref}
            className="whitespace-nowrap font-['Space_Grotesk',sans-serif] font-black uppercase tracking-[0.05em] text-white text-center will-change-[transform,opacity]"
            style={{
              fontSize: "clamp(1.2rem, 4.5vw, 5.5rem)",
              lineHeight: 1.1,
            }}
          >
            THE OPERATING SYSTEM
          </h1>
        </div>



        {/* z-4: Philosophy pointer cards */}
        {POINTER_DATA.map((d, i) => (
          <div
            key={d.n}
            ref={(el) => {
              pointerRefs.current[i] = el
            }}
            className="pointer-events-none fixed w-full max-w-[800px] px-6 will-change-[transform,opacity]"
            style={{ ...POINTER_POS[i], opacity: 0, zIndex: 4 }}
          >
            <div className="mb-2 text-[1.1rem] font-bold tracking-[0.25em] text-white/95 md:text-[1.4rem]" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
              {d.n} — {d.t}
            </div>
            <div
              className="mb-3 font-['Space_Grotesk',sans-serif] font-black uppercase tracking-[0.06em] text-white"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", lineHeight: 1.1, textShadow: "0 4px 20px rgba(0,0,0,0.9)" }}
            >
              {d.t}
            </div>
            <div
              className="font-bold italic leading-relaxed text-white/95"
              style={{ fontSize: "clamp(1.2rem, 2vw, 1.8rem)", textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}
            >
              {d.q}
            </div>
          </div>
        ))}
      </div>
      
      {/* Invisible Snap Points */}
      <div className="relative z-0 -mt-[100vh] pointer-events-none">
        {/* 25 total snap points representing the 25 distinct states (0 to 24) */}
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className="h-screen w-full" />
        ))}
      </div>
    </section>
  )
}
