import { bindPortfolioEffects } from "./components/portfolioAudio"
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react"
import { RouterProvider } from "react-router"
import { router } from "./routes"
// @ts-ignore
import Lenis from "lenis"
import "lenis/dist/lenis.css"
import CinematicHero from "./components/CinematicHero"
import ResumeModal from "./components/ResumeModal"
import TextRevealSection from "./components/TextRevealSection"
import ImageTrail from "./components/ImageTrail"
import RippleCursor from "./components/RippleCursor"
import NavigationScroll from "./components/NavigationScroll"
import TunnelIntro from "./components/TunnelIntro"
import ParticleJourney from "./components/ParticleJourney"
import Services from "./components/Services"
import Storytelling from "./components/Storytelling"
import Graphics from "./components/Graphics"
import CaseStudies from "./components/CaseStudies"

import BuiltDifferent from "./components/BuiltDifferent"
import WorkList from "./components/WorkList"
import WorkAnticipation from "./components/WorkAnticipation"
import Footer from "./components/Footer"
import HeroSequenceSection from "./components/ImageSequenceSection"

import MobileHeroSequenceSection from "./components/mobile/MobileHeroSequenceSection"
import MobileServices from "./components/mobile/MobileServices"
import MobileBuiltDifferent from "./components/mobile/MobileBuiltDifferent"
import MobileWorkList from "./components/mobile/MobileWorkList"
import MobileFooter from "./components/mobile/MobileFooter"
function formatIndiaTime(date = new Date()) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(date)
}

export function Home() {
  const homeRef = useRef<HTMLDivElement>(null)
  useEffect(() => bindPortfolioEffects(), [])
  const [indiaTime, setIndiaTime] = useState(() => formatIndiaTime())
  const [isResumeOpen, setIsResumeOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [entryReady, setEntryReady] = useState(() => {
    if (["#case-studies", "#projects", "#graphic-design"].includes(window.location.hash)) window.portfolioEntered = true
    return window.portfolioEntered === true
  })


  useEffect(() => {
    const updateClock = () => setIndiaTime(formatIndiaTime())
    updateClock()
    const timer = window.setInterval(updateClock, 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const update = () => setSoundEnabled(window.backgroundMusicState === true)
    window.addEventListener("portfolio:sound", update)
    update()
    return () => window.removeEventListener("portfolio:sound", update)
  }, [])

  const toggleSound = () => {
    const newState = !soundEnabled
    setSoundEnabled(newState)
    if (window.toggleBackgroundMusic) {
      window.toggleBackgroundMusic(newState)
    } else {
      window.backgroundMusicState = newState
    }
  }

  return (
    <div ref={homeRef} className="min-h-screen bg-black text-[var(--ink)] relative" style={{ "--portfolio-entry-opacity": entryReady ? 1 : 0 } as CSSProperties}>
      <ParticleJourney />
      {isResumeOpen && <ResumeModal onClose={() => setIsResumeOpen(false)} />}

      {/* Content wrapper with z-10 so it sits above any global backgrounds */}
      <div className="relative z-10">
        {/* Sticky Sound Toggle */}
      <button
        onClick={toggleSound}
        data-cursor-hover
        className="fixed z-[50] flex items-center justify-center px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white backdrop-blur-md transition-all hover:bg-white hover:text-black md:text-xs"
        style={{
          opacity: "var(--portfolio-entry-opacity, 0)",
          transitionProperty: "background-color, color, transform",
          pointerEvents: entryReady ? "auto" : "none",
          top: "82px",
          right: "24px",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "9999px",
        }}
      >
        Sound {soundEnabled ? "ON" : "OFF"}
      </button>

      <CinematicHero indiaTime={indiaTime} onResumeClick={() => setIsResumeOpen(true)} onEntered={() => setEntryReady(true)} onEntryProgress={opacity => homeRef.current?.style.setProperty("--portfolio-entry-opacity", String(opacity))} />

      <TunnelIntro />

      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="relative z-20">
          {/* Image sequence and philosophy */}
          <HeroSequenceSection
            indiaTime={indiaTime}
            onResumeClick={() => setIsResumeOpen(true)}
          />
        </div>

        <TextRevealSection />
        <div className="relative z-30 bg-black">
          {/* Scroll-driven services: colored number cards + rising service cards */}
          <Services />
          <Storytelling />
          <BuiltDifferent />
          <WorkAnticipation />
          <WorkList />
          <CaseStudies />

          <Graphics />
          <Footer />
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <div className="relative z-20">
          <MobileHeroSequenceSection
            indiaTime={indiaTime}
            onResumeClick={() => setIsResumeOpen(true)}
          />
        </div>

        <TextRevealSection />
        <div className="relative z-30 bg-black">
          <MobileServices />
          <Storytelling />
          <MobileBuiltDifferent />
          <WorkAnticipation />
          <MobileWorkList />
          <CaseStudies />

          <Graphics />
          <MobileFooter />
        </div>
      </div>
      </div>
    </div>
  )
}

function CursorEffects() {
  const pathname = useSyncExternalStore(router.subscribe, () => router.state.location.pathname)
  const graphicPortfolio = /^\/(graphic-design|graphics)\/?$/.test(pathname)
  return graphicPortfolio ? <ImageTrail /> : <RippleCursor />
}

export default function App() {
  useEffect(() => {
    const loader = document.getElementById("startup-loader")
    if (!loader) return
    if (window.location.pathname !== "/") {
      loader.remove()
      return
    }
    const fill = loader.querySelector(".startup-loader__fill")
    let removeTimer = 0
    const dismiss = () => {
      loader.classList.add("is-ready")
      removeTimer = window.setTimeout(() => loader.remove(), 550)
    }
    if (fill?.getAnimations().some((animation) => animation.playState === "running")) {
      fill.addEventListener("animationend", dismiss, { once: true })
    } else {
      dismiss()
    }
    return () => {
      fill?.removeEventListener("animationend", dismiss)
      window.clearTimeout(removeTimer)
    }
  }, [])

  // Initialize Lenis for globally smooth, subtle scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !matchMedia("(prefers-reduced-motion: reduce)").matches,
      wheelMultiplier: 0.48, // slows down the wheel speed
      touchMultiplier: 0.85,
    })

    if (window.location.pathname === "/" && !window.portfolioEntered) lenis.stop()
    const startScroll = () => lenis.start()
    const restoreScroll = (event: Event) => {
      const { y } = (event as CustomEvent<{ y: number }>).detail
      lenis.resize()
      lenis.scrollTo(y, { immediate: true, force: true })
    }
    window.addEventListener("portfolio:entered", startScroll)
    window.addEventListener("portfolio:restore-scroll", restoreScroll)
    let animationFrame = 0
    function raf(time: number) {
      lenis.raf(time)
      animationFrame = requestAnimationFrame(raf)
    }

    animationFrame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener("portfolio:entered", startScroll)
      window.removeEventListener("portfolio:restore-scroll", restoreScroll)
      lenis.destroy()
    }
  }, [])

  return <><RouterProvider router={router} /><NavigationScroll /><CursorEffects /></>
}
