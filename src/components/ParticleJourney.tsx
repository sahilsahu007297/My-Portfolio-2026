import { useEffect, useRef } from "react"

export default function ParticleJourney() {
  const hostRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const host = hostRef.current!
    let disposed = false, cleanup = () => {}
    void Promise.all([import("three"), import("./particleShapes")]).then(([T, { particleShapes }]) => {
      if (disposed) return
      let renderer: InstanceType<typeof T.WebGLRenderer>
      try { renderer = new T.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" }) } catch { return }
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
      host.appendChild(renderer.domElement)
      const scene = new T.Scene()
      const camera = new T.PerspectiveCamera(45, 1, .1, 100)
      camera.position.z = 8
      const count = innerWidth < 768 ? 14000 : 32000
      const { shapes, normals } = particleShapes(count)
      const surfaceNormals = new Float32Array(normals[0])
      const positions = new Float32Array(shapes[0])
      const seeds = Float32Array.from({ length: count }, (_, i) => (i * .61803398875) % 1)
      const tunnelSeeds = new Float32Array(count*3)
      let randomState=4319
      for(let i=0;i<tunnelSeeds.length;i++){randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;tunnelSeeds[i]=randomState/4294967296}
      const geometry = new T.BufferGeometry()
      geometry.setAttribute("tunnelSeed", new T.BufferAttribute(tunnelSeeds,3))
      geometry.setAttribute("position", new T.BufferAttribute(positions, 3))
      geometry.setAttribute("normal", new T.BufferAttribute(surfaceNormals, 3))
      geometry.setAttribute("seed", new T.BufferAttribute(seeds, 1))
      const material = new T.ShaderMaterial({
        transparent: true, depthWrite: false, blending: T.NormalBlending,
        uniforms: { pixelRatio: { value: renderer.getPixelRatio() }, opacity: { value: 1 }, tunnelMix: { value: 0 }, travel: { value: 0 }, time: { value: 0 }, cameraZ: { value: 8 }, speed: { value: 0 } },
        vertexShader: `attribute float seed; attribute vec3 tunnelSeed; varying float vSeed; varying vec2 vDirection; varying vec3 vNormal; varying vec3 vView; varying float vFog; uniform float pixelRatio,tunnelMix,travel,time,cameraZ,speed;
          void main(){
            vSeed=seed;
            float depth=mod(tunnelSeed.y*95.-travel,95.);
            float angle=tunnelSeed.x*6.2831853+depth*.024;
            float radius=4.5+sin(angle*3.+depth*.105-time*.16)*.64+sin(angle*7.-depth*.065)*.19+(tunnelSeed.z-.5)*.48;
            vec3 tube=vec3(cos(angle)*radius+sin(depth*.038)*2.0,sin(angle)*radius+sin(depth*.045+.7)*1.1,cameraZ-depth);
            vec3 p=mix(position,tube,tunnelMix);
            vec3 tubeNormal=normalize(vec3(-cos(angle),-sin(angle),.35));
            vNormal=normalize(normalMatrix*mix(normal,tubeNormal,tunnelMix));
            vec4 mv=modelViewMatrix*vec4(p,1.);vView=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;vDirection=normalize(gl_Position.xy+vec2(.001));
            vFog=mix(1.,smoothstep(.8,5.,depth)*(1.-smoothstep(55.,95.,depth)),tunnelMix);
            float size=mix((2.2+seed*1.1)*8.,(1.6+seed*1.8)*15.,tunnelMix);
            gl_PointSize=clamp(size*pixelRatio/max(.3,-mv.z),1.,5.)*(1.+speed*tunnelMix);
          }`,
        fragmentShader: `varying vec2 vDirection; varying float vSeed; varying vec3 vNormal; varying vec3 vView; varying float vFog; uniform float opacity,tunnelMix,speed;
          void main(){vec2 uv=gl_PointCoord-.5;float along=dot(uv,vDirection),across=dot(uv,vec2(-vDirection.y,vDirection.x));float d=length(vec2(along,across*(1.+speed*tunnelMix*2.)));if(d>.48)discard;
          vec3 n=normalize(vNormal), light=normalize(vec3(-.6,.85,1.4));
          float diffuse=max(dot(n,light),0.);float rim=pow(1.-abs(dot(n,vView)),3.);
          float spec=pow(max(dot(n,normalize(light+vView)),0.),28.);
          vec3 base=mix(vec3(.055,.24,.19),vec3(.38,.85,.68),diffuse);
          vec3 color=base+vec3(.48,.67,.61)*spec*.8+vec3(.12,.4,.32)*rim*.4;
          vec3 tunnelColor=mix(vec3(.10,.27,.22),vec3(.68,.86,.65),pow(fract(vSeed*37.13),2.));
          color=mix(color,tunnelColor,tunnelMix)*(.85+vSeed*.25);
          gl_FragColor=vec4(color,opacity*vFog*(1.-smoothstep(.22,.48,d)));}`,


      })
      const points = new T.Points(geometry, material)
      points.frustumCulled = false
      scene.add(points)
      const reduced = matchMedia("(prefers-reduced-motion: reduce)")
      let section: HTMLElement | undefined, progress = 0, outroProgress = -1, ended = false, frame = 0, last = 0, elapsed = 0, tunnelProgress = 0, smoothTunnel = 0, tunnelVisible = false, pointerX = 0, pointerY = 0
      let mx = 99, my = 99, vx = 0, vy = 0
      const clamp = (n: number) => Math.max(0, Math.min(1, n))
      const measure = () => {
        section = Array.from(document.querySelectorAll<HTMLElement>("[data-particle-sequence]")).find(el => el.getClientRects().length > 0)
        if (!section) return
        const rect = section.getBoundingClientRect()
        progress = Math.max(0, -rect.top / innerHeight)
        const outro = Array.from(document.querySelectorAll<HTMLElement>("[data-particle-outro]")).find(el=>el.getClientRects().length>0)
        const outroRect = outro?.getBoundingClientRect()
        outroProgress = outroRect ? (innerHeight-outroRect.top)/innerHeight : -1
        const tunnel=document.querySelector<HTMLElement>("[data-particle-tunnel]")
        const tr=tunnel?.getBoundingClientRect()
        tunnelProgress=tr&&tunnel?clamp(-tr.top/Math.max(1,tunnel.offsetHeight-innerHeight)):1
        tunnelVisible=!!tr&&tr.top<innerHeight&&tr.bottom>0
        ended = (!tunnelVisible && rect.top >= innerHeight) || (outroRect ? outroRect.bottom<=0 : rect.bottom<=0)
        host.style.opacity = "1"
      }
      const resize = () => {
        renderer.setSize(innerWidth, innerHeight)
        camera.aspect = innerWidth / innerHeight
        camera.position.z = innerWidth < 768 ? 10 : 8
        camera.updateProjectionMatrix()
        measure()
      }
      const render = (time: number) => {
        frame = 0
        if (disposed || document.hidden || ended) return
        const dt = Math.min((time - (last || time)) / 1000, .05); last = time
        if (!reduced.matches) elapsed += dt
        material.uniforms.speed.value=reduced.matches?0:Math.min(1,Math.abs(tunnelProgress-smoothTunnel)*10)
        smoothTunnel+=(tunnelProgress-smoothTunnel)*(reduced.matches?1:1-Math.exp(-dt*7))
        const ending=clamp((smoothTunnel-.68)/.29),settle=ending*ending*(3-2*ending)
        const tunnelMix=reduced.matches||!tunnelVisible?0:1-settle
        material.uniforms.tunnelMix.value=tunnelMix
        material.uniforms.travel.value=Math.min(smoothTunnel,.74)*185+elapsed*.32*(1-settle)
        material.uniforms.time.value=elapsed
        material.uniforms.cameraZ.value=camera.position.z
        pointerX+=((mx===99?0:mx)-pointerX)*(1-Math.exp(-dt*3))
        pointerY+=((my===99?0:my)-pointerY)*(1-Math.exp(-dt*3))
        camera.position.x=reduced.matches?0:pointerX*tunnelMix*.28
        camera.position.y=reduced.matches?0:pointerY*tunnelMix*.20
        camera.lookAt(0,0,-14*tunnelMix)
        const stage = clamp((progress - .25) / 1.4 / 10) * 10
        const from = Math.min(9, Math.floor(stage)), to = Math.min(10, from + 1)
        const fraction = stage - from
        const blend = clamp(fraction / .82), smooth = blend * blend * (3 - 2 * blend)
        const a = shapes[from], b = shapes[to], na=normals[from], nb=normals[to]
        const scatter = reduced.matches ? 0 : clamp(outroProgress / 2.1)
        const spread = scatter*scatter*(3-2*scatter)
        material.uniforms.opacity.value = (1-spread*.55)*(1-clamp((outroProgress-1.3)/2.2)*.94)
        const mobile = innerWidth < 768
        const particleScale = mobile ? .68 : .9
        points.scale.setScalar(particleScale+(1-particleScale)*tunnelMix)
        const reveal = clamp(progress / .8)
        points.position.x = 0
        points.position.y = mobile ? reveal * .7 : 0
        points.rotation.y = Math.sin(elapsed * .16) * .12*(1-tunnelMix)
        points.rotation.z = Math.sin(elapsed * .12) * .012*(1-tunnelMix)
        const worldHeight = Math.tan(Math.PI / 8) * camera.position.z * 2
        const mouseX = (mx * worldHeight * camera.aspect / 2 - points.position.x) / particleScale
        const mouseY = (my * worldHeight / 2 - points.position.y) / particleScale
        for (let i = 0; i < count; i++) {
          const k = i * 3, seed = seeds[i]
          let x = a[k] + (b[k] - a[k]) * smooth
          let y = a[k+1] + (b[k+1] - a[k+1]) * smooth
          let z = a[k+2] + (b[k+2] - a[k+2]) * smooth
          const breath=reduced.matches?0:(Math.sin(y*1.8+elapsed*.65)+Math.cos(x*1.6+z*1.2-elapsed*.45))*.055
          x+=na[k]*breath; y+=na[k+1]*breath; z+=na[k+2]*breath
          x += Math.sin(i * 127.1) * .012
          y += Math.sin(i * 311.7) * .012
          z += Math.sin(i * 74.7) * .012
          const drift = reduced.matches ? 0 : .035
          x += Math.sin(elapsed * .6 + seed * 60) * drift
          y += Math.cos(elapsed * .7 + seed * 50) * drift
          const dx = x - mouseX, dy = y - mouseY, d = Math.sqrt(dx*dx+dy*dy) + .001
          const force = reduced.matches ? 0 : Math.exp(-d*d*1.8)
          x += force * (dx/d*.18 + vx*1.2 - dy*.15)
          y += force * (dy/d*.18 + vy*1.2 + dx*.15)
          z += force * Math.sin(d*9-elapsed*4)*.12
          // A small halo of loose particles gives the silhouettes breathing room.
          const angle=seed*Math.PI*2, radius=3+((i*.754877)%1)*7
          x += Math.cos(angle)*radius*spread
          y += Math.sin(angle)*radius*spread
          z += Math.sin(i*1.37)*spread*3
          for(let axis=0;axis<3;axis++) surfaceNormals[k+axis]=na[k+axis]+(nb[k+axis]-na[k+axis])*smooth
          const relax=reduced.matches?1:1-Math.exp(-dt*7); positions[k]+=(x-positions[k])*relax; positions[k+1]+=(y-positions[k+1])*relax; positions[k+2]+=(z-positions[k+2])*relax
        }
        vx *= Math.exp(-dt*5); vy *= Math.exp(-dt*5)
        geometry.attributes.position.needsUpdate = true
        geometry.attributes.normal.needsUpdate = true
        renderer.render(scene, camera)
        if (!reduced.matches) frame = requestAnimationFrame(render)
      }
      const wake = () => {
        measure()
        if (!frame && !document.hidden && !ended) { last = 0; frame = requestAnimationFrame(render) }
      }
      const pointer = (e: PointerEvent) => {
        const x = e.clientX / innerWidth * 2 - 1, y = 1-e.clientY / innerHeight*2
        if (mx !== 99) { vx = Math.max(-.15, Math.min(.15, x-mx)); vy = Math.max(-.15, Math.min(.15, y-my)) }
        mx=x; my=y
      }
      const leave = () => { mx=99; my=99 }
      resize(); wake()
      window.addEventListener("scroll", wake, { passive: true })
      window.addEventListener("resize", resize)
      window.addEventListener("pointermove", pointer, { passive: true })
      document.documentElement.addEventListener("pointerleave", leave)
      document.addEventListener("visibilitychange", wake)
      reduced.addEventListener("change", wake)
      cleanup = () => {
        cancelAnimationFrame(frame)
        window.removeEventListener("scroll", wake)
        window.removeEventListener("resize", resize)
        window.removeEventListener("pointermove", pointer)
        document.documentElement.removeEventListener("pointerleave", leave)
        document.removeEventListener("visibilitychange", wake)
        reduced.removeEventListener("change", wake)
        geometry.dispose(); material.dispose(); renderer.dispose(); renderer.domElement.remove()
      }
    })
    return () => { disposed=true; cleanup() }
  }, [])
  return <div ref={hostRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-black" />
}
