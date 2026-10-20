import { useEffect, useRef } from "react"
import "./Storytelling.css"

const clamp = (v: number) => Math.max(0, Math.min(1, v))
const smooth = (v: number) => { const p = clamp(v); return p * p * (3 - 2 * p) }

export default function Storytelling() {
  const section = useRef<HTMLElement>(null)
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let disposed = false, cleanup = () => {}
    void import("three").then(T => {
      if (disposed || !host.current || !section.current) return
      const container = host.current, wrapper = section.current
      let renderer: InstanceType<typeof T.WebGLRenderer>
      try { renderer = new T.WebGLRenderer({ alpha: true, antialias: true }) } catch { wrapper.dataset.fallback = "true"; return }
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); container.appendChild(renderer.domElement)
      const scene = new T.Scene(), camera = new T.PerspectiveCamera(38, 1, .1, 60)
      camera.position.z = 10
      const group = new T.Group(); scene.add(group)
      const parts: InstanceType<typeof T.BufferGeometry>[] = []
      const add = (g: InstanceType<typeof T.BufferGeometry>) => { parts.push(g) }
      const bone = (a: number[], b: number[], radius = .065, limb = 0) => {
        const start = new T.Vector3(...a), end = new T.Vector3(...b), direction = end.clone().sub(start)
        const g = new T.CylinderGeometry(radius, radius * 1.06, direction.length(), 14, 4)
        g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), direction.normalize()))
        g.translate(...start.add(end).multiplyScalar(.5).toArray()); g.userData.limb = limb; add(g)
      }
      const head = new T.SphereGeometry(.32, 32, 24); head.translate(0, 1.25, 0); add(head)
      bone([0, .92, 0], [0, -.18, 0], .08)
      bone([0, -.18, 0], [-.32, -.78, 0]); bone([-.32, -.78, 0], [-.44, -1.36, .03])
      bone([0, -.18, 0], [.34, -.73, 0]); bone([.34, -.73, 0], [.42, -1.36, .06])
      bone([0, .72, 0], [-.4, .25, .02]); bone([-.4, .25, .02], [-.48, -.18, .1])
      bone([0, .72, 0], [.42, .55, 0], .065, 1); bone([.42, .55, 0], [.65, 1.02, .02], .065, 2)
      const palm = new T.SphereGeometry(.085, 16, 12); palm.scale(.8, 1.2, .65); palm.translate(.65, 1.02, .02); palm.userData.limb = 3; add(palm)
      for (const x of [-.44, .42]) { const foot = new T.SphereGeometry(.11, 12, 8); foot.scale(1, .6, 1.6); foot.translate(x, -1.36, .1); add(foot) }
      const stage = new T.CylinderGeometry(1.25, 1.35, .22, 80); stage.translate(0, -1.55, 0); stage.userData.stage = true; add(stage)
      const count = innerWidth < 768 ? 28000 : 64000
      const targets = new Float32Array(count * 3), seeds = new Float32Array(count * 3), limbs = new Float32Array(count)
      let state = 2817
      const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296 }
      const triangles: { g: InstanceType<typeof T.BufferGeometry>; a: number; b: number; c: number; area: number }[] = []
      let total = 0
      const a = new T.Vector3(), b = new T.Vector3(), c = new T.Vector3()
      for (const g of parts) { const p = g.getAttribute("position") as InstanceType<typeof T.BufferAttribute>, idx = g.index
        for (let j = 0; j < (idx?.count ?? p.count); j += 3) {
          const ai = idx ? idx.getX(j) : j, bi = idx ? idx.getX(j + 1) : j + 1, ci = idx ? idx.getX(j + 2) : j + 2
          a.fromBufferAttribute(p, ai); b.fromBufferAttribute(p, bi); c.fromBufferAttribute(p, ci)
          total += b.sub(a).cross(c.sub(a)).length() / 2 * (g.userData.stage ? .22 : 1); triangles.push({ g, a: ai, b: bi, c: ci, area: total })
        }
      }
      for (let i = 0; i < count; i++) {
        const r = random() * total; let low = 0, high = triangles.length - 1
        while (low < high) { const m = (low + high) >> 1; if (triangles[m].area < r) low = m + 1; else high = m }
        const tri = triangles[low], p = tri.g.getAttribute("position") as InstanceType<typeof T.BufferAttribute>, root = Math.sqrt(random()), w = random()
        for (let axis = 0; axis < 3; axis++) targets[i * 3 + axis] = p.array[tri.a * 3 + axis] * (1 - root) + p.array[tri.b * 3 + axis] * root * w + p.array[tri.c * 3 + axis] * root * (1 - w)
        seeds.set([random(), random(), random()], i * 3)
        limbs[i] = tri.g.userData.limb ?? 0
      }
      const geometry = new T.BufferGeometry(); geometry.setAttribute("position", new T.BufferAttribute(targets, 3)); geometry.setAttribute("seed", new T.BufferAttribute(seeds, 3))
      geometry.setAttribute("limb", new T.BufferAttribute(limbs, 1))
      const material = new T.ShaderMaterial({ transparent: true, depthWrite: false,
        uniforms: { assembly: { value: 0 }, time: { value: 0 }, close: { value: 0 }, kiss: { value: 0 }, pixel: { value: renderer.getPixelRatio() }, opacity: { value: 1 } },
        vertexShader: `attribute vec3 seed;attribute float limb;uniform float assembly,time,pixel,close,kiss;varying float light,stageAlpha;
          vec3 poseBone(vec3 p,vec3 a,vec3 b,vec3 c,vec3 d){
            vec3 oldDir=normalize(b-a),newDir=normalize(d-c);float along=dot(p-a,oldDir)/length(b-a);
            vec3 radial=p-a-oldDir*along*length(b-a),axis=cross(oldDir,newDir);
            radial=radial+cross(axis,radial)+cross(axis,cross(axis,radial))/max(.01,1.+dot(oldDir,newDir));
            return mix(c,d,along)+radial;
          }
          void main(){vec3 p=position;
          float gesture=smoothstep(0.,.22,kiss),release=smoothstep(.4,.85,kiss);
          vec3 elbow=mix(vec3(.42,.55,0.),vec3(.44,.78,.12),gesture);
          vec3 wrist=mix(vec3(.65+sin(time*3.)*.09,1.02+cos(time*3.)*.04,.02),mix(vec3(.09,1.17,.32),vec3(.8,1.2,.7),release),gesture);
          if(limb>.5&&limb<1.5)p=poseBone(p,vec3(0.,.72,0.),vec3(.42,.55,0.),vec3(0.,.72,0.),elbow);
          if(limb>1.5&&limb<2.5)p=poseBone(p,vec3(.42,.55,0.),vec3(.65,1.02,.02),elbow,wrist);
          if(limb>2.5)p+=wrist-vec3(.65,1.02,.02);
          vec3 field=vec3((seed.x-.5)*7.,-5.+seed.y*2.,(seed.z-.5)*4.);
          p=mix(field,p,assembly);p.z+=sin(seed.x*60.+time)*.012*assembly;
          vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
          gl_PointSize=clamp((9.+seed.z*9.)*pixel/max(1.,-mv.z),1.,5.);light=.45+seed.z*.55;stageAlpha=position.y< -1.43?1.-close:1.;}`,
        fragmentShader: `uniform float opacity;varying float light,stageAlpha;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(vec3(.12,.49,.58)*light,opacity*stageAlpha*(1.-smoothstep(.15,.5,d)));}` })
      const points = new T.Points(geometry, material); points.frustumCulled = false; group.add(points)
      const reduced = matchMedia("(prefers-reduced-motion: reduce)")
      let frame = 0, visible = false, elapsed = 0, last = 0
      const render = (now: number) => {
        frame = 0; if (disposed || !visible || document.hidden) return
        const dt = Math.min((now - (last || now)) / 1000, .05); last = now; if (!reduced.matches) elapsed += dt
        const p = reduced.matches ? .36 : clamp(-wrapper.getBoundingClientRect().top / Math.max(1, wrapper.offsetHeight - innerHeight))
        const entrance = smooth(p / .16), right = smooth((p-.16)/.12), move = smooth((p - .43) / .14), finale = smooth((p-.73)/.12), mobile = innerWidth < 768
        const kiss = reduced.matches ? 0 : smooth((p-.84)/.14)
        material.uniforms.assembly.value = reduced.matches ? 1 : entrance
        material.uniforms.time.value = elapsed
        material.uniforms.close.value = move
        material.uniforms.kiss.value = kiss
        group.rotation.y = move * Math.PI * 2 + Math.sin(finale*Math.PI)*.5 + Math.sin(elapsed * .3) * .08
        group.rotation.x = -.08 + Math.sin(move * Math.PI) * .15 + finale*.08
        group.position.set(mobile ? 0 : right*2.1 - move*4.2 + finale*3.4, mobile ? -1.55-move*.25-finale*.1 : -.1-move*.8-finale*.25-(1-entrance)*2, mobile ? move*1.4+finale*.7 : (1-right)*1.1+move*3.3+finale*1.1)
        group.scale.setScalar(mobile ? .85+finale*.05 : 1.4-right*.15+finale*.12)
        const first = smooth((p-.23)/.07)*(1-smooth((p-.40)/.06)), second = smooth((p-.55)/.07)*(1-smooth((p-.71)/.06)), third = smooth((p-.82)/.07)
        wrapper.style.setProperty("--first", String(reduced.matches ? 1 : first))
        wrapper.style.setProperty("--second", String(reduced.matches ? 1 : second))
        wrapper.style.setProperty("--third", String(reduced.matches ? 1 : third))
        wrapper.style.setProperty("--rise", `${(1-first)*70}px`)
        wrapper.style.setProperty("--slide", `${(1-second)*-80}px`)
        renderer.render(scene, camera); if (!reduced.matches) frame = requestAnimationFrame(render)
      }
      const wake = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(render) } }
      const resize = new ResizeObserver(() => { renderer.setSize(container.clientWidth, container.clientHeight); camera.aspect = container.clientWidth / container.clientHeight; camera.updateProjectionMatrix(); wake() }); resize.observe(container)
      const observer = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake(); else { cancelAnimationFrame(frame); frame = 0 } }); observer.observe(container)
      window.addEventListener("scroll", wake, { passive: true }); document.addEventListener("visibilitychange", wake); reduced.addEventListener("change", wake)
      cleanup = () => { cancelAnimationFrame(frame); observer.disconnect(); resize.disconnect(); window.removeEventListener("scroll", wake); document.removeEventListener("visibilitychange", wake); reduced.removeEventListener("change", wake); parts.forEach(g => g.dispose()); geometry.dispose(); material.dispose(); renderer.dispose(); renderer.domElement.remove() }
    }).catch(() => { if (section.current) section.current.dataset.fallback = "true" })
    return () => { disposed = true; cleanup() }
  }, [])
  return <section ref={section} className="storytelling" aria-label="I love storytelling">
    <div className="storytelling__stage">
      <div ref={host} className="storytelling__canvas" aria-hidden="true" />
      <div className="storytelling__first"><span className="storytelling__label">A design skill. A business advantage.</span><h2>I design<br /><em>with story.</em></h2><p>I make a product's value clear.<br />And its next step worth taking.</p></div>
      <div className="storytelling__second"><span className="storytelling__label">Clarity creates momentum.</span><h3>Help people see<br />the value.</h3><p>I use storytelling to connect a user's problem to a product's promise. It shapes how I frame a feature, structure onboarding, and guide someone from first look to first useful moment.</p><p>For a business, that means design with a purpose: making value easier to understand, decisions easier to make, and the path to activation clearer.</p></div>
      <div className="storytelling__third"><span className="storytelling__label">Useful moments. Lasting relationships.</span><h3>Earn trust.<br /><em>Build momentum.</em></h3><p>I bring the same thinking to product strategy and brand experience. Each screen should answer a real question, each interaction should support the next step, and each detail should reinforce the promise.</p><p>That is how I use story: to help people succeed with a product and give the business a stronger reason to be chosen again.</p></div>
      <span className="storytelling__foot">THE STORY MOVES WITH YOU ↓</span>
    </div>
  </section>
}
