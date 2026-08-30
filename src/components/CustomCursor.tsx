import { useEffect, useRef } from "react"

// A restrained cursor treatment for desktop devices with a fine pointer.
// Touch devices retain the native cursor/touch affordances.
export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)")
    if (!cursor) return

    let raf = 0
    const move = (event: MouseEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`
        cursor.dataset.visible = "true"
      })
    }

    const start = () => {
      if (!mediaQuery.matches) return
      document.body.classList.add("has-custom-cursor")
      window.addEventListener("mousemove", move, { passive: true })
    }
    const stop = () => {
      document.body.classList.remove("has-custom-cursor")
      cursor.dataset.visible = "false"
      window.removeEventListener("mousemove", move)
    }
    const updateMode = () => (mediaQuery.matches ? start() : stop())

    updateMode()
    mediaQuery.addEventListener("change", updateMode)
    return () => {
      mediaQuery.removeEventListener("change", updateMode)
      stop()
      cancelAnimationFrame(raf)
    }
  }, [])

  return <div ref={cursorRef} className="custom-cursor" data-visible="false" aria-hidden="true" />
}
