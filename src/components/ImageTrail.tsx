import { useEffect, useRef } from "react"
import { graphicWorks } from "./graphicWorks"
import { graphicThumbnail } from "./graphicImages"
import "./ImageTrail.css"

const images = ["41", "57", "04", "38", "22", "67", "18", "76", "16", "08"].map(id => graphicWorks.find(work => work.id === id)!)
export default function ImageTrail() {
  const layer = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const host = layer.current!, fine = matchMedia("(hover: hover) and (pointer: fine)"), reduced = matchMedia("(prefers-reduced-motion: reduce)")
    let x = -1000, y = -1000, index = 0, last = 0
    const move = (event: PointerEvent) => {
      if (!fine.matches || reduced.matches || event.pointerType !== "mouse") return
      if (!(event.target instanceof Element) || !event.target.closest("[data-image-trail]") || event.target.closest("a,button,dialog")) return
      const now = performance.now()
      if (now - last < 85 || Math.hypot(event.clientX - x, event.clientY - y) < 70) return
      x = event.clientX; y = event.clientY; last = now
      const img = document.createElement("img")
      img.src = graphicThumbnail(images[index % images.length]); img.alt = ""
      img.style.left = `${x}px`; img.style.top = `${y}px`
      const angle = ((index++ % 5) - 2) * 7
      host.appendChild(img)
      while (host.childElementCount > 8) host.firstElementChild?.remove()
      const animation = img.animate([
        { opacity: 0, transform: `translate(-50%,-50%) rotate(${angle - 8}deg) scale(.6)` },
        { opacity: 1, transform: `translate(-50%,-50%) rotate(${angle}deg) scale(1)`, offset: .16 },
        { opacity: 1, transform: `translate(-50%,-55%) rotate(${angle}deg) scale(1)`, offset: .55 },
        { opacity: 0, transform: `translate(-50%,-85%) rotate(${angle + 5}deg) scale(.88)` },
      ], { duration: 1100, easing: "cubic-bezier(.2,.7,.2,1)" })
      animation.onfinish = () => img.remove()
    }
    const clear = () => host.replaceChildren()
    window.addEventListener("pointermove", move, { passive: true }); window.addEventListener("blur", clear); reduced.addEventListener("change", clear)
    return () => { clear(); window.removeEventListener("pointermove", move); window.removeEventListener("blur", clear); reduced.removeEventListener("change", clear) }
  }, [])
  return <div ref={layer} className="image-trail" aria-hidden="true" />
}
