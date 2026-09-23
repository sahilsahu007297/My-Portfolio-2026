import { bindPortfolioEffects } from "./components/portfolioAudio"
import { useEffect, useState } from "react"
import { RouterProvider } from "react-router"
import { router } from "./routes"
// @ts-ignore
import Lenis from "lenis"
import CinematicHero from "./components/CinematicHero"
import ResumeModal from "./components/ResumeModal"
import TextRevealSection from "./components/TextRevealSection"
import FluidCursor from "./components/FluidCursor"
import TunnelIntro from "./components/TunnelIntro"
import ParticleJourney from "./components/ParticleJourney"
import Services from "./components/Services"
import BuiltDifferent from "./components/BuiltDifferent"
import WorkShowcase from "./components/WorkShowcase"
import WorkList from "./components/WorkList"
import Footer from "./components/Footer"
import HeroSequenceSection from "./components/ImageSequenceSection"
import ForwardSection from "./components/ForwardSection"
import MobileHeroSequenceSection from "./components/mobile/MobileHeroSequenceSection"
import MobileServices from "./components/mobile/MobileServices"
import MobileBuiltDifferent from "./components/mobile/MobileBuiltDifferent"
import MobileWorkShowcase from "./components/mobile/MobileWorkShowcase"
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
  useEffect(() => bindPortfolioEffects(), [])
  const [indiaTime, setIndiaTime] = useState(() => formatIndiaTime())
  const [isResumeOpen, setIsResumeOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [entryReady, setEntryReady] = useState(window.portfolioEntered === true)

  // Initialize Lenis for globally smooth, subtle scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.8, // slows down the wheel speed
      touchMultiplier: 1.5,
    })

    if (!window.portfolioEntered) lenis.stop()
    const startScroll = () => lenis.start()
    window.addEventListener("portfolio:entered", startScroll)
    let animationFrame = 0
    function raf(time: number) {
      lenis.raf(time)
      animationFrame = requestAnimationFrame(raf)
    }

    animationFrame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener("portfolio:entered", startScroll)
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    const updateClock = () => setIndiaTime(formatIndiaTime())
    updateClock()
    const timer = window.setInterval(updateClock, 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual"
    }
    
    // Always force the page to start at the very top for the cinematic intro
    window.scrollTo(0, 0)
    
    // Clear any hash from the URL so it doesn't cause auto-scrolling on reload
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname)
    }
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
    <div className="min-h-screen bg-black text-[var(--ink)] relative">
      <ParticleJourney />
      <FluidCursor />
      {isResumeOpen && <ResumeModal onClose={() => setIsResumeOpen(false)} />}

      {/* Content wrapper with z-10 so it sits above any global backgrounds */}
      <div className="relative z-10">
        {/* Sticky Sound Toggle */}
      <button
        onClick={toggleSound}
        data-cursor-hover
        className="fixed z-[50] flex items-center justify-center px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white backdrop-blur-md transition-all hover:bg-white hover:text-black md:text-xs"
        style={{
          opacity: entryReady ? 1 : 0,
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

      <CinematicHero indiaTime={indiaTime} onResumeClick={() => setIsResumeOpen(true)} onEntered={() => setEntryReady(true)} />
      <ForwardSection />
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
          <BuiltDifferent />
          <WorkShowcase />
          <WorkList />
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
          <MobileBuiltDifferent />
          <MobileWorkShowcase />
          <MobileWorkList />
          <MobileFooter />
        </div>
      </div>
      </div>
    </div>
  )
}

export default function App() {
  return <RouterProvider router={router} />
}
