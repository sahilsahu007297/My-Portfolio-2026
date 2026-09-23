import soundtrack from "../Assets/Sound for Portfolio Website .m4a"

declare global {
  interface Window {
    portfolioEntered?: boolean
    toggleBackgroundMusic?: (play: boolean) => void
    backgroundMusicState?: boolean
  }
}
let audio: HTMLAudioElement | undefined
let context: AudioContext | undefined
let master: GainNode | undefined
let echo: DelayNode | undefined
let lastEffect = 0

function engine() {
  if (context) return context
  context = new AudioContext()
  master = context.createGain(); master.gain.value = 0
  const limiter = context.createDynamicsCompressor()
  limiter.threshold.value = -18; limiter.ratio.value = 5
  master.connect(limiter); limiter.connect(context.destination)
  echo = context.createDelay(1); echo.delayTime.value = .23
  const feedback = context.createGain(); feedback.gain.value = .23
  const filter = context.createBiquadFilter(); filter.frequency.value = 2200
  echo.connect(filter); filter.connect(feedback); feedback.connect(echo); filter.connect(master)
  return context
}

function tone(frequency: number, duration: number, volume: number, offset = 0, pan = 0, type: OscillatorType = "sine") {
  if (!context || !master || !echo) return
  const start = context.currentTime + offset
  const oscillator = context.createOscillator(), envelope = context.createGain(), stereo = context.createStereoPanner()
  oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, start)
  oscillator.frequency.exponentialRampToValueAtTime(frequency * .994, start + duration)
  envelope.gain.setValueAtTime(0, start)
  envelope.gain.linearRampToValueAtTime(volume, start + Math.min(.025, duration * .15))
  envelope.gain.exponentialRampToValueAtTime(.0001, start + duration)
  stereo.pan.value = Math.max(-.8, Math.min(.8, pan))
  oscillator.connect(envelope); envelope.connect(stereo); stereo.connect(master); stereo.connect(echo)
  oscillator.start(start); oscillator.stop(start + duration + .02)
  oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); stereo.disconnect() }
}

export function playPortfolioEffect(kind: "enter" | "hover" | "project" | "click" | "glitter" | "ambient", variation = 0, pan = 0) {
  if (!window.backgroundMusicState || document.hidden || !context || context.state !== "running") return
  const now = performance.now()
  if (kind !== "enter" && kind !== "ambient" && now - lastEffect < 85) return
  if (kind !== "ambient") lastEffect = now
  if (kind === "enter") {
    // An original console-inspired glass chord, with a soft low-end bloom.
    tone(130.81, 1.8, .16)
    ;[261.63, 392, 523.25, 783.99].forEach((f, i) => tone(f, 1.5, .09, i * .085, (i - 1.5) * .22))
    tone(1567.98, 1.1, .035, .34)
  } else if (kind === "project") {
    const f = [196, 220, 261.63, 293.66, 329.63][variation % 5]
    tone(f, .42, .055, 0, pan, "triangle"); tone(f * 2, .65, .045, .055, pan)
    tone(f * 3, .7, .018, .10, -pan)
  } else if (kind === "glitter") {
    const f = [1046.5, 1174.66, 1318.51, 1567.98, 1760][variation % 5]
    tone(f, .7, .016, 0, pan); tone(f * 1.5, .8, .007, .07, -pan)
  } else if (kind === "ambient") {
    ;[130.81, 196, 293.66].forEach((f, i) => tone(f, 7, .013, i * .3, (i - 1) * .6))
  } else if (kind === "click") {
    tone(392, .16, .055); tone(783.99, .3, .025, .045)
  } else {
    tone(523.25 + variation * 65.4, .16, .024, 0, pan)
    tone(1046.5, .22, .009, .025, pan)
  }
}

export function setPortfolioSound(play: boolean) {
  if (!audio) { audio = new Audio(soundtrack); audio.loop = true; audio.volume = .16; audio.preload = "none" }
  window.toggleBackgroundMusic = setPortfolioSound
  window.backgroundMusicState = play
  if (play) {
    try {
      const ctx = engine()
      void ctx.resume().then(() => {
        if (!window.backgroundMusicState || document.hidden) return
        master!.gain.cancelScheduledValues(ctx.currentTime)
        master!.gain.setTargetAtTime(.6, ctx.currentTime, .06)
      }).catch(() => {})
    } catch { /* The existing soundtrack still works without Web Audio. */ }
    if (!document.hidden) void audio.play().catch(() => {})
  } else {
    audio.pause()
    if (context && master) { master.gain.cancelScheduledValues(context.currentTime); master.gain.setTargetAtTime(0, context.currentTime, .02) }
  }
  window.dispatchEvent(new Event("portfolio:sound"))
}

export async function playEntrySound() {
  if (!window.backgroundMusicState || !context) return
  await context.resume().catch(() => {})
  playPortfolioEffect("enter")
}

export function bindPortfolioEffects() {
  let lastGlitter = 0, glitterIndex = 0, x = 0, y = 0
  const selector = "a,button,[data-cursor-hover]"
  const hover = (event: PointerEvent | FocusEvent) => {
    if (!(event.target instanceof Element)) return
    const target = event.target.closest(selector)
    if (!target || (event.relatedTarget instanceof Node && target.contains(event.relatedTarget))) return
    if (target.closest(".particle-entry") || target.textContent?.trim().startsWith("Sound ")) return
    const rect = target.getBoundingClientRect(), pan = (rect.left + rect.width / 2) / innerWidth * 1.6 - .8
    if (target.matches(".project-row")) playPortfolioEffect("project", Array.from(target.parentElement!.children).indexOf(target), pan)
    else playPortfolioEffect("hover", target.closest(".process-step") ? 2 : target.tagName === "A" ? 1 : 0, pan)
  }
  const click = (event: MouseEvent) => {
    const target = event.target instanceof Element ? event.target.closest(selector) : null
    if (target && !target.closest(".particle-entry") && !target.textContent?.trim().startsWith("Sound ")) playPortfolioEffect("click")
  }
  const glitter = (event: PointerEvent) => {
    const now = performance.now(), distance = Math.hypot(event.clientX - x, event.clientY - y)
    x = event.clientX; y = event.clientY
    if (event.pointerType !== "mouse" || now - lastGlitter < 650 || distance < 6) return
    const target = event.target instanceof Element ? event.target : null
    if (!target?.closest(".cinematic-hero,[data-particle-sequence],footer") || target.closest(selector)) return
    lastGlitter = now
    playPortfolioEffect("glitter", glitterIndex++ % 5, event.clientX / innerWidth * 1.6 - .8)
  }
  const visibility = () => {
    if (document.hidden) { audio?.pause(); if (context) void context.suspend().catch(() => {}) }
    else if (window.backgroundMusicState) setPortfolioSound(true)
  }
  const ambient = window.setInterval(() => playPortfolioEffect("ambient"), 6500)
  document.addEventListener("pointerover", hover); document.addEventListener("focusin", hover)
  document.addEventListener("click", click); document.addEventListener("pointermove", glitter, { passive: true })
  document.addEventListener("visibilitychange", visibility)
  return () => {
    clearInterval(ambient); document.removeEventListener("pointerover", hover); document.removeEventListener("focusin", hover)
    document.removeEventListener("click", click); document.removeEventListener("pointermove", glitter); document.removeEventListener("visibilitychange", visibility)
    setPortfolioSound(false)
  }
}
