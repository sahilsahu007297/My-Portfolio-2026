import { useEffect, useRef } from "react"

export default function ParticleJourney() {
  const hostRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const host = hostRef.current!
    let disposed = false, cleanup = () => {}
    void Promise.all([import("three"), import("./particleShapes")]).then(([T, { particleShapes }]) => {
      if (disposed) return
      let renderer: InstanceType<typeof T.WebGLRenderer>
      try { renderer = new T.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" }) } catch { return }
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
      host.appendChild(renderer.domElement)
      const scene = new T.Scene()
      const camera = new T.PerspectiveCamera(45, 1, .1, 100)
      camera.position.z = 8
      const count = innerWidth < 768 ? 22000 : 68000
      const { shapes, normals } = particleShapes(count)
      const shapeAttributes=shapes.map(shape=>new T.BufferAttribute(shape,3))
      const normalAttributes=normals.map(normal=>new T.BufferAttribute(normal,3))
      const seeds = Float32Array.from({ length: count }, (_, i) => (i * .61803398875) % 1)
      const tunnelSeeds = new Float32Array(count*3)
      let randomState=4319
      for(let i=0;i<tunnelSeeds.length;i++){randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;tunnelSeeds[i]=randomState/4294967296}
      const geometry = new T.BufferGeometry()
      geometry.setAttribute("tunnelSeed", new T.BufferAttribute(tunnelSeeds,3))
      geometry.setAttribute("position", shapeAttributes[0])
      geometry.setAttribute("normal", normalAttributes[0])
      geometry.setAttribute("seed", new T.BufferAttribute(seeds, 1))
      geometry.setAttribute("exhaust",new T.BufferAttribute(Float32Array.from({length:count},(_,i)=>i%29===0?1:0),1))
      geometry.setAttribute("targetPosition",shapeAttributes[1])
      geometry.setAttribute("targetNormal",normalAttributes[1])
      const material = new T.ShaderMaterial({
        transparent: true, depthWrite: false, blending: T.NormalBlending,
        uniforms: { morph:{value:0}, spread:{value:0}, cloudAmount:{value:0}, lift:{value:0}, ignition:{value:0}, drift:{value:1}, pointer:{value:new T.Vector2(99,99)}, pointerForce:{value:0}, pixelRatio: { value: renderer.getPixelRatio() }, opacity: { value: 1 }, tunnelMix: { value: 0 }, travel: { value: 0 }, thrust: { value: 0 }, galaxy: { value: 0 }, time: { value: 0 }, cameraZ: { value: 8 }, speed: { value: 0 } },
        vertexShader: `attribute vec3 targetPosition,targetNormal; uniform float morph,spread,cloudAmount,lift,ignition,drift,pointerForce;uniform vec2 pointer;
        attribute float seed; attribute float exhaust; varying float vExhaust; attribute vec3 tunnelSeed; varying float vSeed; varying vec2 vDirection; varying vec3 vNormal; varying vec3 vView; varying float vFog; uniform float pixelRatio,tunnelMix,travel,time,cameraZ,speed,galaxy;
          void main(){
            vSeed=seed;vExhaust=exhaust;
            float depth=mod(tunnelSeed.y*95.-travel,95.);
            float angle=tunnelSeed.x*6.2831853+depth*.024;
            float radius=4.5+sin(angle*3.+depth*.105-time*.16)*.64+sin(angle*7.-depth*.065)*.19+(tunnelSeed.z-.5)*.48;
            vec3 tube=vec3(cos(angle)*radius+sin(depth*.038)*2.0,sin(angle)*radius+sin(depth*.045+.7)*1.1,cameraZ-depth);
            float ga=tunnelSeed.x*6.2831853+time*.035+tunnelSeed.y*4.;
            float gr=1.+sqrt(tunnelSeed.y)*14.;
            vec3 cloud=vec3(cos(ga)*gr,sin(ga)*gr*.55,(tunnelSeed.z-.5)*18.-8.);
            vec3 surface=mix(position,targetPosition,morph);
            vec3 surfaceNormal=normalize(mix(normal,targetNormal,morph));
            surface+=surfaceNormal*(sin(surface.y*1.8+time*.65)+cos(surface.x*1.6+surface.z*1.2-time*.45))*.035*drift;
            vec2 delta=surface.xy-pointer;float distanceToMouse=length(delta)+.001;
            surface.xy+=delta/distanceToMouse*exp(-distanceToMouse*distanceToMouse*1.8)*.18*pointerForce;
            surface.y+=lift*lift*4.8;
            float age=seed*1.1,side=tunnelSeed.x>.5?1.:-1.;
            vec3 plume=vec3(side*.32+sin(seed*80.+time*3.)*age*.06,-1.6+lift*lift*4.8-age,-.1+cos(seed*60.+time*3.)*age*.05);
            surface=mix(surface,plume,exhaust*ignition);
            float angleScatter=seed*6.2831853,scatterRadius=3.+tunnelSeed.z*7.;
            surface+=vec3(cos(angleScatter)*scatterRadius,sin(angleScatter)*scatterRadius,sin(seed*137.)*3.)*spread;
            surface.y-=cloudAmount*4.8;
            surface+=vec3(sin(time*.12+seed*24.)*.55,cos(time*.10+seed*31.)*.45,sin(time*.08+seed*19.)*.3)*cloudAmount;
            vec3 p=mix(mix(surface,tube,tunnelMix),cloud,galaxy);
            vec3 tubeNormal=normalize(vec3(-cos(angle),-sin(angle),.35));
            vNormal=normalize(normalMatrix*mix(surfaceNormal,tubeNormal,tunnelMix));
            vec4 mv=modelViewMatrix*vec4(p,1.);vView=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;vDirection=normalize(gl_Position.xy+vec2(.001));
            vFog=mix(1.,smoothstep(.8,5.,depth)*(1.-smoothstep(55.,95.,depth)),tunnelMix);
            float size=mix((1.4+seed*.9)*8.,(1.6+seed*1.8)*15.,tunnelMix);
            gl_PointSize=clamp(size*pixelRatio/max(.3,-mv.z),1.,5.)*(1.+speed*tunnelMix);
          }`,
        fragmentShader: `varying float vExhaust; uniform float thrust; varying vec2 vDirection; varying float vSeed; varying vec3 vNormal; varying vec3 vView; varying float vFog; uniform float opacity,tunnelMix,speed;
          void main(){vec2 uv=gl_PointCoord-.5;float along=dot(uv,vDirection),across=dot(uv,vec2(-vDirection.y,vDirection.x));float d=length(vec2(along,across*(1.+speed*tunnelMix*2.)));if(d>.48)discard;
          vec3 n=normalize(vNormal), light=normalize(vec3(-.6,.85,1.4));
          float diffuse=max(dot(n,light),0.);float rim=pow(1.-abs(dot(n,vView)),3.);
          float spec=pow(max(dot(n,normalize(light+vView)),0.),28.);
          vec3 base=mix(vec3(.08,.16,.18),vec3(.57,.76,.77),diffuse);
          vec3 color=base+vec3(.48,.67,.61)*spec*.8+vec3(.12,.4,.32)*rim*.4;
          vec3 tunnelColor=mix(vec3(.10,.27,.22),vec3(.68,.86,.65),pow(fract(vSeed*37.13),2.));
          color=mix(color,tunnelColor,tunnelMix)*(.85+vSeed*.25);
          color=mix(color,vec3(.45,.72,1.4),vExhaust*thrust);
          gl_FragColor=vec4(color,opacity*vFog*(1.-smoothstep(.22,.48,d)));}`,


      })
      const points = new T.Points(geometry, material)
      points.frustumCulled = false
      scene.add(points)
      const reduced = matchMedia("(prefers-reduced-motion: reduce)")
      let section: HTMLElement | undefined, progress = 0, ended = false, frame = 0, last = 0, elapsed = 0, tunnelProgress = 0, smoothTunnel = 0, tunnelEntrance = 0, tunnelVisible = false, pointerX = 0, pointerY = 0
      let mx = 99, my = 99, vx = 0, vy = 0
      const clamp = (n: number) => Math.max(0, Math.min(1, n))
      const measure = () => {
        section = Array.from(document.querySelectorAll<HTMLElement>("[data-particle-sequence]")).find(el => el.getClientRects().length > 0)
        if (!section) return
        const rect = section.getBoundingClientRect()
        progress = Math.max(0, -rect.top / innerHeight)
        const outro = Array.from(document.querySelectorAll<HTMLElement>("[data-particle-outro]")).find(el=>el.getClientRects().length>0)
        const outroRect = outro?.getBoundingClientRect()
        const tunnel=document.querySelector<HTMLElement>("[data-particle-tunnel]")
        const tr=tunnel?.getBoundingClientRect()
        tunnelProgress=tr&&tunnel?clamp(-tr.top/Math.max(1,tunnel.offsetHeight-innerHeight)):1
        tunnelVisible=!!tr&&tr.top<innerHeight&&tr.bottom>0
        tunnelEntrance=tr?clamp((-tr.top/innerHeight-.12)/.35):1
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
        const ending=clamp((smoothTunnel-.86)/.14),settle=ending*ending*(3-2*ending)
        const tunnelMix=reduced.matches||!tunnelVisible?0:1-settle
        material.uniforms.galaxy.value=tunnelVisible?1-clamp((smoothTunnel-.09)/.17):0
        material.uniforms.tunnelMix.value=tunnelMix
        material.uniforms.travel.value=Math.min(smoothTunnel,.86)*240+elapsed*.32*(1-settle)
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
        let morph=smooth
        const assembly=clamp((progress-16.4)/1.7), lift=clamp((progress-19.1)/2.1)
        material.uniforms.thrust.value=Math.sin(lift*Math.PI)*.65
        // Budget detail by viewport and interaction, restoring full surface density for the reveal.
        const activeCount=Math.floor(count*(progress>16?1:Math.max(.6,1-material.uniforms.speed.value*.35)))
        geometry.setDrawRange(0,activeCount)
        const finalBurst=clamp((progress-20.6)/1.5)
        if(progress>15)morph=assembly*assembly*(3-2*assembly)
        const scatter = reduced.matches ? 0 : Math.max(finalBurst,clamp((progress-14.9)/.8)*(1-assembly))
        const spread = scatter*scatter*(3-2*scatter)
        // Carry the jet's particles through the entire paragraph section.
        // Keep a quiet, visible field instead of fading it away at the burst.
        material.uniforms.opacity.value = (1-finalBurst*.55)*(tunnelVisible?tunnelEntrance:1)
        const mobile = innerWidth < 768
        const particleScale = mobile ? .54 : .95
        points.scale.setScalar(particleScale+(1-particleScale)*tunnelMix)
        const reveal = clamp(progress / .8)
        points.position.x = 0
        points.position.y = mobile ? reveal * .7 : 0
        points.rotation.y = Math.sin(elapsed * .16) * .12*(1-tunnelMix)
        points.rotation.z = Math.sin(elapsed * .12) * .012*(1-tunnelMix)
        const worldHeight = Math.tan(Math.PI / 8) * camera.position.z * 2
        material.uniforms.pointer.value.set((mx*worldHeight*camera.aspect/2)/particleScale,(my*worldHeight/2-points.position.y)/particleScale)
        material.uniforms.pointerForce.value=reduced.matches?0:progress>16?.08:1
        material.uniforms.morph.value=morph
        material.uniforms.spread.value=spread
        material.uniforms.cloudAmount.value=finalBurst*finalBurst*(3-2*finalBurst)
        material.uniforms.lift.value=lift
        material.uniforms.ignition.value=clamp(lift*8)*(1-finalBurst)
        material.uniforms.drift.value=reduced.matches||progress>16?0:1
        const source=progress>15?10:from,target=progress>15?11:to
        if(geometry.getAttribute("position")!==shapeAttributes[source]){
          geometry.setAttribute("position",shapeAttributes[source]);geometry.setAttribute("normal",normalAttributes[source])
        }
        if(geometry.getAttribute("targetPosition")!==shapeAttributes[target]){
          geometry.setAttribute("targetPosition",shapeAttributes[target]);geometry.setAttribute("targetNormal",normalAttributes[target])
        }
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
    }).catch(() => { host.style.opacity="0" })
    return () => { disposed=true; cleanup() }
  }, [])
  return <div ref={hostRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-black" />
}
