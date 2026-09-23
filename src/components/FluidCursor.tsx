import { useEffect } from "react"
import fluidCursor from "@/hooks/use-FluidCursor"

export default function FluidCursor() {
  useEffect(() => fluidCursor(), [])
  return <div className="fixed inset-0 z-[60] pointer-events-none" aria-hidden="true">
    <canvas id="fluid" className="w-screen h-screen" />
  </div>
}
