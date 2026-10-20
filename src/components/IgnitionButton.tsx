import { useEffect, useRef, type RefObject } from "react"
import fragmentSource from "./ignition.frag?raw"
import "./IgnitionButton.css"

export default function IgnitionButton({ onClick, disabled, buttonRef }: { onClick: () => void; disabled: boolean; buttonRef: RefObject<HTMLButtonElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const interaction = useRef({ target: 0, flash: 0 })
  useEffect(() => {
    const canvas = canvasRef.current!
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false })
    if (!gl) return
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source); gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null }
      return shader
    }
    const vertex = compile(gl.VERTEX_SHADER, "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}")
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource)
    if (!vertex || !fragment) { if (vertex) gl.deleteShader(vertex); if (fragment) gl.deleteShader(fragment); return }
    const program = gl.createProgram()!
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); gl.deleteShader(vertex); gl.deleteShader(fragment); return }
    gl.useProgram(program)
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const attribute = gl.getAttribLocation(program, "p"); gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0)
    const res = gl.getUniformLocation(program, "u_res"), time = gl.getUniformLocation(program, "u_time"), warpUniform = gl.getUniformLocation(program, "u_warp"), flashUniform = gl.getUniformLocation(program, "u_flash")
    const reduced = matchMedia("(prefers-reduced-motion: reduce)")
    let frame = 0, last = 0, warp = 0, travel = 0
    const render = (now: number) => {
      frame = 0; if (document.hidden) return
      const dt = Math.min(.05, (now - (last || now)) / 1000); last = now
      warp += (interaction.current.target - warp) * Math.min(1, dt * 2.6)
      interaction.current.flash *= Math.exp(-4.5 * dt); travel += dt * (.05 + warp * 1.35)
      const ratio = Math.min(devicePixelRatio, 2), w = Math.round(canvas.clientWidth * ratio), h = Math.round(canvas.clientHeight * ratio)
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h) }
      gl.uniform2f(res, w, h); gl.uniform1f(time, reduced.matches ? 4 : travel); gl.uniform1f(warpUniform, reduced.matches ? 0 : warp); gl.uniform1f(flashUniform, reduced.matches ? 0 : interaction.current.flash)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      if (!reduced.matches) frame = requestAnimationFrame(render)
    }
    const wake = () => { if (!frame) { last = 0; frame = requestAnimationFrame(render) } }
    const resize = new ResizeObserver(wake); resize.observe(canvas)
    document.addEventListener("visibilitychange", wake); reduced.addEventListener("change", wake); wake()
    return () => { cancelAnimationFrame(frame); resize.disconnect(); document.removeEventListener("visibilitychange", wake); reduced.removeEventListener("change", wake); gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(vertex); gl.deleteShader(fragment) }
  }, [])
  return <button ref={buttonRef} type="button" className="ignition-button" disabled={disabled} aria-label="Launch portfolio with sound"
    onMouseEnter={() => { interaction.current.target = 1 }} onMouseLeave={() => { interaction.current.target = 0 }}
    onFocus={() => { interaction.current.target = 1 }} onBlur={() => { interaction.current.target = 0 }}
    onClick={() => { interaction.current.flash = 1; onClick() }}>
    <span className="ignition-button__core"><canvas ref={canvasRef} aria-hidden="true" /><span className="ignition-button__label">LAUNCH</span></span>
  </button>
}
