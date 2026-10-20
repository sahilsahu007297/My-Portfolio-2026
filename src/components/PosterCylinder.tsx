import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { graphicWorks } from "./graphicWorks"
import { graphicThumbnail } from "./graphicImages"
import type * as THREE from "three"

const posters = ["41", "57", "04", "22", "76", "16", "40", "08", "18", "45", "59", "30"].map(id => graphicWorks.find(work => work.id === id)!)

export default function PosterCylinder() {
  const host = useRef<HTMLDivElement>(null)
  const controls = useRef<{ step: (direction: number) => void; pause: (value: boolean) => void } | null>(null)
  const [paused, setPaused] = useState(false)
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading")
  const [reduced, setReduced] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const el = host.current!, media = matchMedia("(prefers-reduced-motion: reduce)")
    let disposed = false, starting = false, visible = false, cleanup = () => {}, wake = () => {}
    const motionChange = () => { setReduced(media.matches); wake() }
    motionChange(); media.addEventListener("change", motionChange)
    const init = async () => {
      if (starting || disposed) return
      starting = true
      try {
        const T = await import("three")
        if (disposed) return
        const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" })
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75))
        renderer.outputColorSpace = T.SRGBColorSpace
        renderer.setClearColor(0x000000, 0)
        el.appendChild(renderer.domElement)
        renderer.domElement.setAttribute("aria-hidden", "true")
        const scene = new T.Scene(), camera = new T.PerspectiveCamera(36, 1, .1, 80)
        const ring = new T.Group(); scene.add(ring)
        const textures: THREE.Texture[] = [], materials: THREE.Material[] = [], geometries: THREE.BufferGeometry[] = []
        const meshes: THREE.Mesh[] = [], loader = new T.TextureLoader()
        const radius = 3.65, arc = Math.PI * 2 / posters.length
        let frame = 0, last = 0, rotation = -.16, target = -.16, isPaused = false, dragging = false, dragged = false, downX = 0, previousX = 0, pointerId = -1
        let hover = false, loaded = 0, failed = 0
        const raycaster = new T.Raycaster(), pointer = new T.Vector2()
        const render = (time: number) => {
          frame = 0
          const dt = Math.min((time - (last || time)) / 1000, .05); last = time
          if (!visible || document.hidden) return
          if (!isPaused && !media.matches && !dragging && !hover) target += dt * .115
          rotation += (target - rotation) * (1 - Math.exp(-dt * 12))
          ring.rotation.y = rotation
          renderer.render(scene, camera)
          if ((!isPaused && !media.matches && !hover) || dragging || Math.abs(target - rotation) > .001) frame = requestAnimationFrame(render)
        }
        wake = () => { if (!frame && visible && !disposed) { last = 0; frame = requestAnimationFrame(render) } }
        posters.forEach((poster, index) => {
          const geometry = new T.CylinderGeometry(radius, radius, 2.7, 28, 1, true, index * arc, arc * .88)
          geometries.push(geometry)
          const texture = loader.load(graphicThumbnail(poster, innerWidth < 768 ? 480 : 800), () => {
            if (disposed) { texture.dispose(); return }
            backTexture.needsUpdate = true
            loaded++; setStatus("ready"); wake()
          }, undefined, () => { if (!disposed && ++failed === posters.length && loaded === 0) setStatus("fallback") })
          texture.colorSpace = T.SRGBColorSpace
          texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
          const backTexture = texture.clone()
          backTexture.repeat.x = -1
          backTexture.offset.x = 1
          textures.push(texture, backTexture)
          const material = new T.MeshBasicMaterial({ map: texture, side: T.FrontSide })
          const back = new T.MeshBasicMaterial({ map: backTexture, color: 0xaaa397, side: T.BackSide })
          materials.push(material, back)
          const mesh = new T.Mesh(geometry, material); meshes.push(mesh); ring.add(mesh)
          ring.add(new T.Mesh(geometry, back))
        })
        const resize = () => {
          const { width, height } = el.getBoundingClientRect()
          if (!width || !height) return
          renderer.setSize(width, height)
          camera.aspect = width / height
          const distance = Math.max(10.2, 4.5 / (Math.tan(T.MathUtils.degToRad(18)) * camera.aspect))
          camera.position.set(0, distance * .23, distance); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix(); wake()
        }
        const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(el); resize()
        const hit = (e: PointerEvent) => {
          const rect = el.getBoundingClientRect()
          pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1)
          raycaster.setFromCamera(pointer, camera)
          return raycaster.intersectObjects(meshes).length > 0
        }
        const down = (e: PointerEvent) => { if (e.button !== 0) return; dragging = true; dragged = false; downX = previousX = e.clientX; pointerId = e.pointerId; el.setPointerCapture(e.pointerId); el.classList.add("is-dragging"); wake() }
        const move = (e: PointerEvent) => {
          if (dragging) { const dx = e.clientX - previousX; previousX = e.clientX; if (Math.abs(e.clientX - downX) > 6) dragged = true; target += dx * .006; wake() }
          else { hover = hit(e); el.style.cursor = hover ? "grab" : "default"; wake() }
        }
        const release = (e: PointerEvent) => {
          if (!dragging || e.pointerId !== pointerId) return
          dragging = false; el.classList.remove("is-dragging")
          if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
          if (e.type === "pointerup" && !dragged && hit(e)) navigate("/graphic-design")
          hover = false; wake()
        }
        const leave = () => { hover = false; wake() }
        const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0 } else wake() }
        el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move); el.addEventListener("pointerup", release); el.addEventListener("pointercancel", release); el.addEventListener("pointerleave", leave); document.addEventListener("visibilitychange", visibility)
        controls.current = { step: direction => { target += direction * arc; wake() }, pause: value => { isPaused = value; wake() } }
        const lost = (event: Event) => { event.preventDefault(); cancelAnimationFrame(frame); frame = 0; setStatus("fallback") }
        renderer.domElement.addEventListener("webglcontextlost", lost)
        cleanup = () => {
          cancelAnimationFrame(frame); resizeObserver.disconnect(); controls.current = null
          el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", release); el.removeEventListener("pointercancel", release); el.removeEventListener("pointerleave", leave); document.removeEventListener("visibilitychange", visibility)
          renderer.domElement.removeEventListener("webglcontextlost", lost)
          textures.forEach(texture => texture.dispose()); materials.forEach(material => material.dispose()); geometries.forEach(geometry => geometry.dispose()); renderer.dispose(); renderer.domElement.remove()
        }
        wake()
      } catch { if (!disposed) setStatus("fallback") }
    }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && el.getBoundingClientRect().width > 0; if (visible) { void init(); wake() } }, { rootMargin: "180px" })
    observer.observe(el)
    return () => { disposed = true; observer.disconnect(); media.removeEventListener("change", motionChange); cleanup() }
  }, [navigate])

  const togglePause = () => setPaused(value => { controls.current?.pause(!value); return !value })
  return <div className="poster-cylinder" data-status={status}>
    <div className="poster-cylinder__stage" ref={host} aria-label="Rotating 3D cylinder of graphic design posters. Drag horizontally to rotate, or use the buttons below.">
      <div className="poster-cylinder__shadow" aria-hidden="true" />
      {status !== "ready" && <div className="poster-cylinder__fallback">{posters.slice(0, 3).map(poster => <img key={poster.id} src={graphicThumbnail(poster)} alt={poster.title} width={poster.width} height={poster.height} loading="lazy" />)}</div>}
    </div>
    <div className="poster-cylinder__controls">
      <button onClick={() => controls.current?.step(-1)} disabled={status !== "ready"} aria-label="Rotate posters left">←</button>
      <span>{status === "fallback" ? "A selection from the collection" : "Drag to discover"}</span>
      {!reduced && status === "ready" && <button className="poster-cylinder__pause" onClick={togglePause} aria-pressed={paused}>{paused ? "Play rotation" : "Pause rotation"}</button>}
      <button onClick={() => controls.current?.step(1)} disabled={status !== "ready"} aria-label="Rotate posters right">→</button>
    </div>
  </div>
}
