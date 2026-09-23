import { useEffect, useRef, type RefObject } from "react"

export default function BuiltDifferentCanvas({ progress }: { progress: RefObject<number> }) {
  const hostRef=useRef<HTMLDivElement>(null)
  useEffect(()=>{
    const host=hostRef.current!
    let disposed=false,cleanup=()=>{}
    void import("three").then(T=>{
      if(disposed)return
      let renderer: InstanceType<typeof T.WebGLRenderer>
      try { renderer=new T.WebGLRenderer({alpha:true,antialias:false,powerPreference:"low-power"}) } catch {return}
      renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0)
      host.appendChild(renderer.domElement)
      const scene=new T.Scene(),camera=new T.OrthographicCamera(-1,1,1,-1,0,1)
      const geometry=new T.PlaneGeometry(2,2)
      const material=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{
        uTime:{value:0},uProgress:{value:0},uAspect:{value:1},uMouse:{value:new T.Vector2(.5,.5)},uStrength:{value:0}
      },vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.);}`,
      fragmentShader:`precision highp float;
        varying vec2 vUv;uniform float uTime,uProgress,uAspect,uStrength;uniform vec2 uMouse;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
        float box(vec2 p,vec2 halfSize,float radius){vec2 q=abs(p)-halfSize+radius;return length(max(q,0.))+min(max(q.x,q.y),0.)-radius;}
        void main(){
          float slide=smoothstep(.63,.77,uProgress),expand=smoothstep(.77,.88,uProgress);
          float halfWidth=mix(.19,.251,expand),halfHeight=mix(.32,.501,expand),radius=mix(.085,0.,expand);
          float left=mix(-.23,.17,slide);left=mix(left,.25,expand);
          float right=1.-left;
          vec2 uv=vUv;vec2 delta=uv-uMouse;delta.x*=uAspect;
          float influence=exp(-dot(delta,delta)*9.);
          uv+=vec2(delta.y,-delta.x)*influence*uStrength*.22;
          uv+=sin(vec2(uv.y*8.,uv.x*7.)+uTime*.35)*.022*smoothstep(.86,.96,uProgress);
          float n=noise(uv*3.+vec2(uTime*.025,-uTime*.02));
          float boundary=smoothstep(.27,.8,uv.x+sin(uv.y*5.+n*2.)*.16+n*.15);
          vec3 warm=mix(vec3(.98,.27,.12),vec3(.99,.49,.29),noise(uv*4.));
          vec3 cool=mix(vec3(.18,.08,.52),vec3(.58,.35,.89),noise(uv*3.+5.));
          vec3 color=mix(warm,cool,boundary);
          color+=(hash(vUv*vec2(1800.,1200.))-.5)*.095;
          float leftMask=box(vec2((vUv.x-left)*uAspect,vUv.y-.5),vec2(halfWidth*uAspect,halfHeight),radius);
          float rightMask=box(vec2((vUv.x-right)*uAspect,vUv.y-.5),vec2(halfWidth*uAspect,halfHeight),radius);
          float alpha=1.-smoothstep(-.001,.001,min(leftMask,rightMask));
          gl_FragColor=vec4(color,alpha);
        }`})
      scene.add(new T.Mesh(geometry,material))
      let frame=0,last=0,time=0,visible=false,targetX=.5,targetY=.5,strength=0
      const reduced=matchMedia("(prefers-reduced-motion: reduce)")
      const render=(now:number)=>{
        frame=0;if(disposed||!visible||document.hidden||reduced.matches)return
        const dt=Math.min((now-(last||now))/1000,.05);last=now;time+=dt
        material.uniforms.uTime.value=time;material.uniforms.uProgress.value=progress.current
        material.uniforms.uMouse.value.lerp(new T.Vector2(targetX,targetY),1-Math.exp(-dt*8))
        strength*=Math.exp(-dt*1.5)
        material.uniforms.uStrength.value+=(strength-material.uniforms.uStrength.value)*(1-Math.exp(-dt*6))
        renderer.render(scene,camera);frame=requestAnimationFrame(render)
      }
      const sync=()=>{cancelAnimationFrame(frame);frame=0;last=0;if(visible&&!document.hidden&&!reduced.matches)frame=requestAnimationFrame(render)}
      const resize=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(w&&h){renderer.setSize(w,h);material.uniforms.uAspect.value=w/h}});resize.observe(host)
      const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync()});observer.observe(host)
      const move=(e:PointerEvent)=>{const rect=host.getBoundingClientRect();if(!rect.width||!rect.height)return;const x=(e.clientX-rect.left)/rect.width,y=1-(e.clientY-rect.top)/rect.height;if(x<0||x>1||y<0||y>1)return;strength=Math.min(1,strength+Math.hypot(x-targetX,y-targetY)*8);targetX=x;targetY=y}
      window.addEventListener("pointermove",move,{passive:true});document.addEventListener("visibilitychange",sync);reduced.addEventListener("change",sync)
      cleanup=()=>{cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();window.removeEventListener("pointermove",move);document.removeEventListener("visibilitychange",sync);reduced.removeEventListener("change",sync);geometry.dispose();material.dispose();renderer.dispose();renderer.domElement.remove()}
    })
    return()=>{disposed=true;cleanup()}
  },[progress])
  return <div ref={hostRef} className="built-story__canvas" aria-hidden="true" />
}
