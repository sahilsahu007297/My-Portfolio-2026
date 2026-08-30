import { useEffect, useRef } from "react"
import projectShowcaseVideo from "../assets/projectshowcase.mp4"

// The showcase continues the charcoal ground of the section above it, scales a
// framed video up from the centre while two halves of the title glide in from
// the left and right to meet over it, then lets a looping video play. On the final stretch the ground melts to a warm
// off-white so the light "selected work" list can take over seamlessly.

const DARK = [15, 15, 18]
// The work list below sits on white, so the charcoal ground melts up to white on
// the final stretch — a smooth light switch that hands straight into it.
const LIGHT = [255, 255, 255]

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const easeOutQuad = (v: number) => 1 - Math.pow(1 - v, 2)
const easeInOutQuad = (v: number) =>
  v < 0.5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2

export default function WorkShowcase() {
  const sectionRef = useRef<HTMLElement>(null)
  const groundRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const figureRef = useRef<HTMLDivElement>(null)
  const captionRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.5
    }
  }, [])

  useEffect(() => {
    let raf = 0
    const update = () => {
      const section = sectionRef.current
      if (!section) return
      const vh = window.innerHeight || 1
      const total = Math.max(section.offsetHeight - vh, 1)
      const local = clamp((window.scrollY - section.offsetTop) / total)

      // Total snaps = 3. Max scroll = 2. pos goes from 0 to 2.
      const pos = local * 2

      // 1. Converge the two title halves + scale the figure up from centre.
      // pos 0 to 1
      const intro = easeOutQuad(clamp(pos))
      const off = (1 - intro) * 115
      if (leftRef.current) {
        leftRef.current.style.transform = `translate3d(${-off}%, 0, 0)`
        leftRef.current.style.opacity = `${intro}`
      }
      if (rightRef.current) {
        rightRef.current.style.transform = `translate3d(${off}%, 0, 0)`
        rightRef.current.style.opacity = `${intro}`
      }

      // 2. Ground melts to warm off-white across the final stretch
      // pos 1 to 2
      const exit = easeInOutQuad(clamp(pos - 1))
      const chan = (i: number) =>
        Math.round(DARK[i] + (LIGHT[i] - DARK[i]) * exit)
      const r = chan(0)
      const g = chan(1)
      const b = chan(2)
      if (groundRef.current) {
        groundRef.current.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
      }

      const figScale = 0.24 + intro * 0.76 - exit * 0.06
      if (figureRef.current) {
        figureRef.current.style.transform = `translate3d(0, ${-exit * 8}vh, 0) scale(${figScale})`
        figureRef.current.style.opacity = `${intro * (1 - exit)}`
      }
      if (captionRef.current) {
        captionRef.current.style.opacity = `${clamp((intro - 0.6) / 0.4) * (1 - exit)}`
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
      ref={sectionRef}
      className="relative z-10 bg-white"
      aria-label="Selected work showcase"
    >
      <div
        ref={groundRef}
        className="sticky top-0 flex h-screen items-center justify-center overflow-hidden pointer-events-none"
        style={{ backgroundColor: "rgb(15, 15, 18)" }}
      >
        {/* Centre figure — scales up, then loops through the video */}
        <div
          ref={figureRef}
          className="work-figure relative aspect-[16/10] w-[min(78vw,68rem)] overflow-hidden rounded-[1.5rem] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.7)] pointer-events-auto"
        >
          <div className="work-shot bg-neutral-800" data-active={true}>
            <video
              ref={videoRef}
              src={projectShowcaseVideo}
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          </div>

          {/* Caption */}
          <div
            ref={captionRef}
            className="work-caption absolute bottom-5 left-5 flex items-center gap-2.5 text-[13px] font-medium tracking-tight text-white/85 md:bottom-7 md:left-7 md:text-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
            <span className="work-shot-label">Project Showcase</span>
          </div>
        </div>

        {/* Converging title, sitting over the figure */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-[0.35em] px-4 text-center text-[clamp(1.9rem,6.2vw,5.5rem)] font-semibold leading-none tracking-[-0.04em] text-white mix-blend-difference md:gap-[0.5em]">
          <span
            ref={leftRef}
            className="work-title-left whitespace-nowrap"
          >
            The projects
          </span>
          <span
            ref={rightRef}
            className="work-title-right whitespace-nowrap"
          >
            I worked on
          </span>
        </div>
      </div>
      
      {/* Invisible Snap Points */}
      <div className="relative z-0 -mt-[100vh] pointer-events-none">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-screen w-full snap-center" />
        ))}
      </div>
    </section>
  )
}
