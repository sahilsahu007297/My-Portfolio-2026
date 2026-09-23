import { useEffect, useRef } from "react"

export default function MountainTerrain() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let disposed = false
    let cleanup = () => {}

    // Keep the WebGL engine out of the initial application bundle.
    void import("three").then((THREE) => {
      if (disposed) return
      let renderer: InstanceType<typeof THREE.WebGLRenderer>
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" })
      } catch {
        return
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.setClearColor(0x000000, 0)
      renderer.domElement.style.cssText = "display:block;width:100%;height:100%"
      host.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
      camera.position.set(-3, 25, 100)
      const loader = new THREE.TextureLoader()
      const heightMap = loader.load(`${import.meta.env.BASE_URL}terrain/height.png`, () => draw())
      const alphaMap = loader.load(`${import.meta.env.BASE_URL}terrain/alpha.png`, () => draw())
      const geometry = new THREE.PlaneGeometry(200, 200, 96, 128)
      const material = new THREE.MeshStandardMaterial({
        color: "#d6e7e0", wireframe: true, transparent: true, opacity: 0.2,
        displacementMap: heightMap, displacementScale: 40, alphaMap,
        depthTest: false, side: THREE.DoubleSide,
      })
      const terrain = new THREE.Mesh(geometry, material)
      terrain.rotation.x = 11
      terrain.scale.setScalar(1.18)
      // Shader displacement extends beyond the flat plane's original bounds.
      terrain.frustumCulled = false
      scene.add(terrain, new THREE.AmbientLight(0xffffff, 2))

      const dustCount = window.innerWidth < 768 ? 1500 : 3000
      const dustBase = new Float32Array(dustCount * 3)
      for (let i = 0; i < dustCount; i++) {
        const f = (n: number) => n - Math.floor(n)
        dustBase.set([(f(i * .61803) - .5) * 240, f(i * .75487) * 95 - 12, (f(i * .56984) - .5) * 160], i * 3)
      }
      const dustGeometry = new THREE.BufferGeometry()
      dustGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(dustBase), 3))
      const dustMaterial = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        vertexShader: `void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(230./-mv.z,1.5,4.);}`,
        fragmentShader: `void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(.65,.86,.78,pow(1.-d*2.,1.5)*.8);}`,
      })
      const dust = new THREE.Points(dustGeometry, dustMaterial)
      dust.frustumCulled = false
      scene.add(dust)
      const ripples: { x: number; y: number; born: number }[] = []
      let lastRipple = 0
      const positions = geometry.attributes.position
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
      let pointerX = 0
      let pointerY = 0
      let inView = false
      let frame = 0
      let lastTime = 0
      let elapsed = 0
      const draw = () => {
        if (!disposed && host.clientWidth > 0) renderer.render(scene, camera)
      }
      const animate = (time: number) => {
        frame = 0
        if (disposed || !inView || document.hidden || reducedMotion.matches) return
        const delta = Math.min((time - (lastTime || time)) / 1000, 0.05)
        lastTime = time
        elapsed += delta
        const ease = 1 - Math.exp(-delta * 4)
        terrain.rotation.z += (pointerX * 0.22 - terrain.rotation.z) * ease
        material.displacementScale += (40 + pointerY * 8 - material.displacementScale) * ease
        for (let i = 0; i < positions.count; i++) {
          const u = geometry.attributes.uv.getX(i) * Math.PI * 16
          const v = geometry.attributes.uv.getY(i) * Math.PI * 16
          let ripple = 0
          for (const wave of ripples) {
            const age = elapsed - wave.born
            const d = Math.hypot(positions.getX(i) - wave.x, positions.getY(i) - wave.y)
            ripple += Math.sin(d * .24 - age * 7) * Math.exp(-Math.pow((d - age * 26) / 24, 2)) * Math.exp(-age * 1.4) * 1.8
          }
          positions.setZ(i, (Math.sin(u + elapsed * 5) + Math.cos(v + elapsed * 5)) * 0.2 + ripple)
        }
        const dustPositions = dustGeometry.attributes.position
        for (let i = 0; i < dustCount; i++) {
          const k = i * 3, x = dustBase[k], y = dustBase[k+1]
          const dx = x - pointerX * camera.aspect * 72, dy = y - (25 - pointerY * 72)
          const force = Math.exp(-(dx*dx+dy*dy) / 850)
          dustPositions.setXYZ(i, x + Math.sin(elapsed * .3 + i) * 1.2 - dy * force * .45,
            y + Math.cos(elapsed * .25 + i) * 1.4 + dx * force * .45,
            dustBase[k+2] + Math.sin(elapsed + i) * force * 6)
        }
        dustPositions.needsUpdate = true
        while (ripples.length && elapsed - ripples[0].born > 3) ripples.shift()
        positions.needsUpdate = true
        draw()
        frame = requestAnimationFrame(animate)
      }
      const sync = () => {
        cancelAnimationFrame(frame)
        lastTime = 0
        if (inView && !document.hidden && !reducedMotion.matches) frame = requestAnimationFrame(animate)
        else draw()
      }
      const resize = new ResizeObserver(() => {
        const width = host.clientWidth
        const height = host.clientHeight
        if (!width || !height) return
        renderer.setSize(width, height, false)
        camera.aspect = width / height
        camera.position.z = width < 768 ? 135 : 100
        camera.updateProjectionMatrix()
        draw()
      })
      resize.observe(host)
      const intersection = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting
        sync()
      })
      intersection.observe(host)
      const move = (event: PointerEvent) => {
        const bounds = host.getBoundingClientRect()
        if (!bounds.width || !bounds.height) return
        pointerX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width) * 2 - 1))
        pointerY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height) * 2 - 1))
        if (!reducedMotion.matches && elapsed - lastRipple > .09 && inView) {
          ripples.push({ x: pointerX * 90, y: pointerY * 80, born: elapsed })
          if (ripples.length > 8) ripples.shift()
          lastRipple = elapsed
        }
      }
      window.addEventListener("pointermove", move, { passive: true })
      document.addEventListener("visibilitychange", sync)
      reducedMotion.addEventListener("change", sync)
      cleanup = () => {
        cancelAnimationFrame(frame)
        resize.disconnect()
        intersection.disconnect()
        window.removeEventListener("pointermove", move)
        document.removeEventListener("visibilitychange", sync)
        reducedMotion.removeEventListener("change", sync)
        dustGeometry.dispose()
        dustMaterial.dispose()
        geometry.dispose()
        material.dispose()
        heightMap.dispose()
        alphaMap.dispose()
        renderer.dispose()
        renderer.domElement.remove()
      }
    }).catch(() => { /* Preserve the readable hero if WebGL cannot load. */ })
    return () => { disposed = true; cleanup() }
  }, [])

  return <div ref={hostRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />
}
