import { useEffect, useRef } from "react"

/** A slowly breathing knot: separate ideas finding a shared orbit. */
export default function QuietOrbit() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let disposed = false, cleanup = () => {}
    void import("three").then(T => {
      if (disposed) return
      const host = ref.current!
      let renderer: InstanceType<typeof T.WebGLRenderer>
      try { renderer = new T.WebGLRenderer({ alpha: true, antialias: false }) } catch { return }
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); host.appendChild(renderer.domElement)
      const scene = new T.Scene(), camera = new T.PerspectiveCamera(40, 1, .1, 30)
      camera.position.z = 7
      const positions = new Float32Array(4200 * 3)
      for (let i=0;i<4200;i++) {
        const t=i/4200*Math.PI*2, r=1+.32*Math.cos(t*3), a=i*2.39996
        positions.set([r*Math.cos(t*2)+Math.cos(a)*.055,r*Math.sin(t*2)+Math.sin(a)*.055,.52*Math.sin(t*3)],i*3)
      }
      const settled=new Float32Array(positions)
      const geometry=new T.BufferGeometry(); geometry.setAttribute("position",new T.BufferAttribute(positions,3))
      const material=new T.PointsMaterial({color:0xb6c6b8,size:.017,transparent:true,opacity:.35,depthWrite:false})
      const points=new T.Points(geometry,material);scene.add(points)
      const reduced=matchMedia("(prefers-reduced-motion: reduce)")
      let frame=0,visible=false,last=0,time=0
      const render=(now:number)=>{frame=0;if(!visible||document.hidden)return;time+=Math.min((now-(last||now))/1000,.05);last=now
        points.rotation.y=reduced.matches?0:Math.sin(time*.13)*.35;points.rotation.z=reduced.matches?0:time*.025
        const rect=host.getBoundingClientRect();const form=reduced.matches?1:Math.max(0,Math.min(1,(innerHeight-rect.top)/(innerHeight*.65)))
        const scatter=Math.pow(1-form,2)
        for(let i=0;i<4200;i++){const k=i*3;positions[k]=settled[k]+Math.sin(i*12.3)*scatter*3;positions[k+1]=settled[k+1]+Math.cos(i*8.7)*scatter*2;positions[k+2]=settled[k+2]+Math.sin(i*3.1)*scatter*2}
        geometry.attributes.position.needsUpdate=true;points.scale.setScalar(.85+.15*form)
        renderer.render(scene,camera);if(!reduced.matches)frame=requestAnimationFrame(render)
      }
      const wake=()=>{if(!frame&&visible&&!document.hidden){last=0;frame=requestAnimationFrame(render)}}
      const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;wake()});observer.observe(host)
      const resize=new ResizeObserver(()=>{if(!host.clientWidth||!host.clientHeight)return;renderer.setSize(host.clientWidth,host.clientHeight);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();wake()});resize.observe(host)
      document.addEventListener("visibilitychange",wake);reduced.addEventListener("change",wake)
      cleanup=()=>{cancelAnimationFrame(frame);observer.disconnect();resize.disconnect();document.removeEventListener("visibilitychange",wake);reduced.removeEventListener("change",wake);geometry.dispose();material.dispose();renderer.dispose();renderer.domElement.remove()}
    })
    return()=>{disposed=true;cleanup()}
  },[])
  return <div ref={ref} aria-hidden="true" className="quiet-orbit" />
}
