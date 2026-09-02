import { useEffect, useState } from "react"
import atmoSound from "../Assets/Sound for Portfolio Website .m4a"

interface VenetianPreloaderProps {
  blindCount?: number
  animationDuration?: number
  staggerDelay?: number
}

type Phase = "arrival" | "choice" | "opening" | "complete"


declare global {
  interface Window {
    toggleBackgroundMusic?: (play: boolean) => void;
    backgroundMusicState?: boolean;
  }
}

let globalAudioContext: AudioContext | null = null;
let globalAudioSource: AudioBufferSourceNode | null = null;
let backgroundAudioBuffer: AudioBuffer | null = null;
let isMusicInitialized = false;
let hasEntered = false;

function initBackgroundMusic(playImmediately: boolean) {
  if (isMusicInitialized) return;
  isMusicInitialized = true;
  
  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  if (!AudioContextClass) return
  
  globalAudioContext = new AudioContextClass()
  const context = globalAudioContext;

  window.toggleBackgroundMusic = (play: boolean) => {
    window.backgroundMusicState = play;
    if (play) {
      if (context.state === "suspended") {
        context.resume();
      }
      if (!globalAudioSource && backgroundAudioBuffer) {
        const source = context.createBufferSource()
        source.buffer = backgroundAudioBuffer
        source.loop = true
        source.connect(context.destination)
        source.start(0)
        globalAudioSource = source
      }
    } else {
      if (globalAudioSource) {
        globalAudioSource.stop()
        globalAudioSource.disconnect()
        globalAudioSource = null
      }
    }
  }

  fetch(atmoSound)
    .then((response) => response.arrayBuffer())
    .then((buffer) => context.decodeAudioData(buffer))
    .then((decodedData) => {
      backgroundAudioBuffer = decodedData
      if (window.backgroundMusicState !== false && playImmediately) {
        window.toggleBackgroundMusic!(true);
      }
    })
    .catch((err) => console.error("Error playing background music:", err))
}

function playCurtainSound(blindCount: number, staggerDelay: number) {
  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  if (!AudioContextClass) return
  const context = new AudioContextClass()
  const now = context.currentTime

  Array.from({ length: blindCount }).forEach((_, index) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const time = now + index * (staggerDelay / 1000)
    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(210 - index * 8, time)
    oscillator.frequency.exponentialRampToValueAtTime(110, time + 0.16)
    gain.gain.setValueAtTime(0.0001, time)
    gain.gain.exponentialRampToValueAtTime(0.15, time + 0.018)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start(time)
    oscillator.stop(time + 0.17)
  })
  window.setTimeout(() => context.close(), blindCount * staggerDelay + 350)
}

/** Curtains drop in, wait for an explicit entry preference, then open sideways. */
export default function VenetianPreloader({
  blindCount = 10,
  animationDuration = 800,
  staggerDelay = 70,
}: VenetianPreloaderProps) {
  const [phase, setPhase] = useState<Phase>(hasEntered ? "complete" : "arrival")
  const entryDuration = 620
  const entryStagger = 60
  const entryFinishAt = entryDuration + (blindCount - 1) * entryStagger
  const finishAt = animationDuration + (blindCount - 1) * staggerDelay + 40

  useEffect(() => {
    if (phase !== "arrival") return
    const timer = window.setTimeout(() => setPhase("choice"), entryFinishAt)
    return () => window.clearTimeout(timer)
  }, [entryFinishAt, phase])

  useEffect(() => {
    if (phase !== "opening") return
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const timer = window.setTimeout(
      () => {
        setPhase("complete")
      },
      reducedMotion ? 20 : finishAt,
    )
    return () => window.clearTimeout(timer)
  }, [finishAt, phase])

  const enter = (withSound: boolean) => {
    hasEntered = true;
    window.backgroundMusicState = withSound;
    initBackgroundMusic(withSound);
    if (withSound) {
      playCurtainSound(blindCount, staggerDelay)
    }
    setPhase("opening")
  }

  if (phase === "complete") return null

  return (
    <div
      className="venetian-preloader fixed inset-0 z-[10000] overflow-hidden"
      aria-label="Portfolio entry"
      aria-live="polite"
      role="dialog"
      aria-modal="true"
    >
      <div className={`venetian-preloader__choice ${phase === "choice" ? "is-visible" : ""}`}>
        <p className="venetian-preloader__name">Sahil Sahu</p>
        <div className="venetian-preloader__actions" aria-label="Choose entry sound preference">
          <button type="button" data-cursor-hover onClick={() => enter(true)}>
            Enter with sound
          </button>
          <button type="button" data-cursor-hover onClick={() => enter(false)}>
            Enter without sound
          </button>
        </div>
      </div>
      {Array.from({ length: blindCount }).map((_, index) => (
        <div
          key={index}
          className="venetian-preloader__blind"
          style={{
            left: `${(index / blindCount) * 100}%`,
            width: `${100 / blindCount + 0.15}%`,
            animation:
              phase === "opening"
                ? `venetian-blind-open ${animationDuration}ms cubic-bezier(0.77, 0, 0.175, 1) ${index * staggerDelay}ms forwards`
                : `venetian-blind-drop ${entryDuration}ms cubic-bezier(0.22, 1, 0.36, 1) ${index * entryStagger}ms both`,
          }}
        />
      ))}
    </div>
  )
}
