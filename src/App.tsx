import { useEffect, useState } from "react"
import { RouterProvider } from "react-router"
import { router } from "./routes"
import CustomCursor from "./components/CustomCursor"
import VenetianPreloader from "./components/VenetianPreloader"
import ResumeModal from "./components/ResumeModal"
import Services from "./components/Services"
import BuiltDifferent from "./components/BuiltDifferent"
import WorkShowcase from "./components/WorkShowcase"
import WorkList from "./components/WorkList"
import Footer from "./components/Footer"
import HeroSequenceSection from "./components/ImageSequenceSection"
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
  const [indiaTime, setIndiaTime] = useState(() => formatIndiaTime())
  const [isResumeOpen, setIsResumeOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)

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
    
    // If there's a hash (like #projects), let the browser handle it or scroll to it manually
    if (window.location.hash) {
      const id = window.location.hash.substring(1)
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView()
      }, 0)
    } else {
      window.scrollTo(0, 0)
    }
  }, [])

  useEffect(() => {
    // Periodically check the background music state set by VenetianPreloader
    const interval = setInterval(() => {
      if (window.backgroundMusicState !== undefined) {
        setSoundEnabled(window.backgroundMusicState)
        clearInterval(interval)
      }
    }, 100)
    return () => clearInterval(interval)
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
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--ink)]">
      <CustomCursor />
      <VenetianPreloader />
      {isResumeOpen && <ResumeModal onClose={() => setIsResumeOpen(false)} />}

      {/* Sticky Sound Toggle */}
      <button
        onClick={toggleSound}
        data-cursor-hover
        className="fixed z-[50] flex items-center justify-center px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white backdrop-blur-md transition-all hover:bg-white hover:text-black md:text-xs"
        style={{
          top: "72px",
          right: "24px",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "9999px",
        }}
      >
        Sound {soundEnabled ? "ON" : "OFF"}
      </button>

      {/* Desktop View */}
      <div className="hidden md:block">
        {/* Unified hero + image sequence — one canvas, no seams */}
        <HeroSequenceSection
          indiaTime={indiaTime}
          onResumeClick={() => setIsResumeOpen(true)}
        />

        {/* Scroll-driven services: colored number cards + rising service cards */}
        <Services />
        <BuiltDifferent />
        <WorkShowcase />
        <WorkList />
        <Footer />
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileHeroSequenceSection
          indiaTime={indiaTime}
          onResumeClick={() => setIsResumeOpen(true)}
        />
        <MobileServices />
        <MobileBuiltDifferent />
        <MobileWorkShowcase />
        <MobileWorkList />
        <MobileFooter />
      </div>
    </div>
  )
}

export default function App() {
  return <RouterProvider router={router} />
}
