
declare global {
  interface Window {
    portfolioEntered?: boolean
    toggleBackgroundMusic?: (play: boolean) => void
    backgroundMusicState?: boolean
  }
}
let ambience: GainNode | undefined
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

// Original, continuous ambient score: low drone, detuned pads and filtered air.
// Oscillators run continuously so there is no audible loop seam or extra download.
function createAmbience() {
  if (ambience || !context || !master || !echo) return
  const ctx = context
  ambience = ctx.createGain()
  ambience.gain.value = .7
  const warmth = ctx.createBiquadFilter()
  warmth.type = "lowpass"; warmth.frequency.value = 750; warmth.Q.value = .35
  ambience.connect(warmth); warmth.connect(master)
  const space = ctx.createGain(); space.gain.value = .3
  warmth.connect(space); space.connect(echo)
  ;[55, 110, 164.81, 220, 261.63, 329.63].forEach((frequency, i) => {
    const oscillator = ctx.createOscillator(), gain = ctx.createGain(), pan = ctx.createStereoPanner()
    oscillator.type = i < 2 ? "sine" : "triangle"
    oscillator.frequency.value = frequency
    oscillator.detune.value = i % 2 ? 3 : -3
    const level = i === 0 ? .055 : i === 1 ? .025 : .009
    gain.gain.value = level
    pan.pan.value = (i % 3 - 1) * .45
    const breath = ctx.createOscillator(), depth = ctx.createGain()
    breath.frequency.value = .025 + i * .007; depth.gain.value = level * .45
    breath.connect(depth); depth.connect(gain.gain)
    oscillator.connect(gain); gain.connect(pan); pan.connect(ambience!)
    oscillator.start(); breath.start()
  })
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 8, ctx.sampleRate)
  const samples = buffer.getChannelData(0)
  let low = 0, seed = 2026
  for (let i = 0; i < samples.length; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    low = .985 * low + .015 * (seed / 4294967296 * 2 - 1)
    samples[i] = low
  }
  const air = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain()
  air.buffer = buffer; air.loop = true
  filter.type = "lowpass"; filter.frequency.value = 480
  gain.gain.value = .1
  air.connect(filter); filter.connect(gain); gain.connect(ambience); air.start()
}

export function setPortfolioSound(play: boolean) {
  window.toggleBackgroundMusic = setPortfolioSound
  window.backgroundMusicState = play
  if (play) {
    try {
      const ctx = engine()
      createAmbience()
      void ctx.resume().then(() => {
        if (!window.backgroundMusicState || document.hidden) return
        master!.gain.cancelScheduledValues(ctx.currentTime)
        master!.gain.setTargetAtTime(.6, ctx.currentTime, .06)
      }).catch(() => {})
    } catch { /* Keep the portfolio usable when browser audio is unavailable. */ }
  } else {
    if (context && master) { master.gain.cancelScheduledValues(context.currentTime); master.gain.setTargetAtTime(0, context.currentTime, .02) }
  }
  window.dispatchEvent(new Event("portfolio:sound"))
}

export async function playEntrySound() {
  if (!window.backgroundMusicState || !context) return
  await context.resume().catch(() => {})
  playPortfolioEffect("enter")
}

let flightNoise: AudioBuffer | undefined

// Soft turbine air, a low harmonic motor, and an airy dispersal. No sharp transient.
export function createFlightSound() {
  type Voice = { source: AudioScheduledSourceNode; gain: GainNode; filter: BiquadFilterNode; pan: StereoPannerNode; stopping: boolean }
  const voices = new Set<Voice>()
  let running: Voice[] | null = null, previous: number | null = null, lastBurst = -Infinity
  const clamp = (n:number) => Math.max(0,Math.min(1,n))
  const noise = () => {
    if (flightNoise) return flightNoise
    const ctx=context!;flightNoise=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate)
    const data=flightNoise.getChannelData(0);let low=0,seed=1701
    for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const white=seed/4294967296*2-1;low=.97*low+.03*white;data[i]=low*2.5+white*.05}
    return flightNoise
  }
  const voice = (frequency?:number) => {
    const ctx=context!,gain=ctx.createGain(),filter=ctx.createBiquadFilter(),pan=ctx.createStereoPanner()
    const source=frequency===undefined?ctx.createBufferSource():ctx.createOscillator()
    if(source instanceof AudioBufferSourceNode){source.buffer=noise();source.loop=true}
    else {source.type="sine";source.frequency.value=frequency!}
    filter.type="lowpass";filter.frequency.value=650;filter.Q.value=.35;gain.gain.value=0
    source.connect(filter);filter.connect(gain);gain.connect(pan);pan.connect(master!)
    const item={source,gain,filter,pan,stopping:false};voices.add(item)
    source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();pan.disconnect();voices.delete(item)}
    source.start();return item
  }
  const stop = () => {
    if(!context)return
    const now=context.currentTime
    for(const item of voices){if(item.stopping)continue;item.stopping=true;item.gain.gain.cancelScheduledValues(now);item.gain.gain.setTargetAtTime(0,now,.06);item.source.stop(now+.24)}
    running=null
  }
  return {
    update(progress:number){
      const old=previous;previous=progress
      if(!window.backgroundMusicState||document.hidden||!context||context.state!=="running"||!master||progress<19.1||progress>23){if(running||voices.size)stop();return}
      const now=context.currentTime,lift=clamp((progress-19.1)/2.1)
      if(!running)running=[voice(),voice(86),voice(129)]
      const envelope=clamp(lift/.25)*(1-clamp((progress-21.05)/.9))
      running.forEach((item,i)=>{
        item.gain.gain.setTargetAtTime(envelope*(i===0?.085:i===1?.012:.005),now,.18)
        item.filter.frequency.setTargetAtTime(380+Math.sin(lift*Math.PI)*720,now,.2)
        item.pan.pan.setTargetAtTime(-.18+lift*.36,now,.2)
        if(item.source instanceof OscillatorNode)item.source.frequency.setTargetAtTime((i===1?86:129)*(1.12-lift*.42),now,.2)
      })
      if(old!==null&&old>19.1&&old<21.1&&progress>=21.1&&progress<22&&performance.now()-lastBurst>6000){
        lastBurst=performance.now()
        const bloom=voice(),bass=voice(62)
        for(const [item,level] of [[bloom,.06],[bass,.017]] as const){
          item.gain.gain.linearRampToValueAtTime(level,now+.3);item.gain.gain.exponentialRampToValueAtTime(.0001,now+2.8);item.source.stop(now+2.9)
        }
        bloom.filter.frequency.setValueAtTime(1100,now);bloom.filter.frequency.exponentialRampToValueAtTime(180,now+2.7)
        if(bass.source instanceof OscillatorNode)bass.source.frequency.exponentialRampToValueAtTime(42,now+2.7)
      }
    },
    stop,
    dispose:stop,
  }
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
    if (document.hidden) { if (context) void context.suspend().catch(() => {}) }
    else if (window.backgroundMusicState) setPortfolioSound(true)
  }
  document.addEventListener("pointerover", hover); document.addEventListener("focusin", hover)
  document.addEventListener("click", click); document.addEventListener("pointermove", glitter, { passive: true })
  document.addEventListener("visibilitychange", visibility)
  return () => {
    document.removeEventListener("pointerover", hover); document.removeEventListener("focusin", hover)
    document.removeEventListener("click", click); document.removeEventListener("pointermove", glitter); document.removeEventListener("visibilitychange", visibility)
    setPortfolioSound(false)
  }
}
