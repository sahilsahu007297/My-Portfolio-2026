import { useLayoutEffect, useRef, useSyncExternalStore } from "react"
import { router } from "../routes"

const positions = new Map<string, { x: number; y: number }>()

export default function NavigationScroll() {
  const location = useSyncExternalStore(router.subscribe, () => router.state.location)
  const currentKey = useRef(location.key)
  const restoring = useRef(false)
  const pendingNavigation = useRef(false)

  useLayoutEffect(() => {
    const save = () => {
      if (!restoring.current && !pendingNavigation.current) positions.set(currentKey.current, { x: scrollX, y: scrollY })
    }
    const capture = () => {
      positions.set(currentKey.current, { x: scrollX, y: scrollY })
      pendingNavigation.current = true
    }
    const captureLink = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null
      if (!link || link.hasAttribute("download") || link.target === "_blank" || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
      const url = new URL(link.href, window.location.origin)
      if (url.origin === window.location.origin && url.pathname !== window.location.pathname) capture()
    }
    const unsubscribe = router.subscribe(state => {
      if (state.location.key !== currentKey.current) {
        save()
        currentKey.current = state.location.key
        pendingNavigation.current = false
      }
    })
    history.scrollRestoration = "manual"
    window.addEventListener("scroll", save, { passive: true })
    window.addEventListener("portfolio:before-navigation", capture)
    document.addEventListener("click", captureLink, true)
    return () => { unsubscribe(); window.removeEventListener("scroll", save); window.removeEventListener("portfolio:before-navigation", capture); document.removeEventListener("click", captureLink, true) }
  }, [])

  useLayoutEffect(() => {
    const graphicHome = /^\/(graphic-design|graphics)\/?$/.test(location.pathname) && !location.hash
    const saved = !graphicHome && router.state.historyAction === "POP" ? positions.get(location.key) : undefined
    restoring.current = true
    let frame = 0, finished = false, settleTimer = 0
    const finish = () => {
      finished = true
      restoring.current = false
      observer.disconnect()
      window.clearTimeout(timer)
      window.clearTimeout(settleTimer)
    }
    const settle = () => { window.clearTimeout(settleTimer); settleTimer = window.setTimeout(finish, 500) }
    const restore = () => {
      frame = 0
      if (finished) return
      if (saved) {
        window.scrollTo({ left: saved.x, top: saved.y, behavior: "instant" })
        window.dispatchEvent(new CustomEvent("portfolio:restore-scroll", { detail: saved }))
        if (document.documentElement.scrollHeight - innerHeight >= saved.y - 2) settle()
      } else if (location.hash) {
        const id = decodeURIComponent(location.hash.slice(1))
        const target = Array.from(document.querySelectorAll<HTMLElement>(`[id="${CSS.escape(id)}"]`)).find(el => el.getClientRects().length > 0)
        if (target) { target.scrollIntoView({ behavior: "instant" }); window.dispatchEvent(new CustomEvent("portfolio:restore-scroll", { detail: { x: scrollX, y: scrollY } })); settle() }
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" })
        window.dispatchEvent(new CustomEvent("portfolio:restore-scroll", { detail: { x: 0, y: 0 } }))
        // The gallery replaces a very long pinned page. Keep the reset active
        // while its layout and Lenis dimensions settle, rather than finishing
        // before the first resize can restore the old scroll position.
        if (graphicHome) settle()
        else finish()
      }
    }
    const schedule = () => { if (!frame && !finished) frame = requestAnimationFrame(restore) }
    const observer = new ResizeObserver(schedule)
    observer.observe(document.body)
    const timer = window.setTimeout(finish, 4000)
    window.addEventListener("wheel", finish, { passive: true, once: true })
    window.addEventListener("pointerdown", finish, { passive: true, once: true })
    if (graphicHome) restore()
    schedule()
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.clearTimeout(timer); window.clearTimeout(settleTimer); window.removeEventListener("wheel", finish); window.removeEventListener("pointerdown", finish) }
  }, [location.key, location.hash, location.pathname])

  return null
}
