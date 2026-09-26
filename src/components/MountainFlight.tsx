import { useEffect, useRef, type RefObject } from "react"
import mountainHeadingPainter from "./mountainHeadingPainter"

export default function MountainFlight({progress,entry,onUnavailable}:{progress:RefObject<number>;entry:RefObject<number>;onUnavailable:()=>void}) {
  const hostRef=useRef<HTMLDivElement>(null)
  const failureRef=useRef(onUnavailable);failureRef.current=onUnavailable
  useEffect(()=>{
    const host=hostRef.current!
    let disposed=false,cleanup=()=>{}
    void import("three").then(T=>{
      if(disposed)return
      let renderer: InstanceType<typeof T.WebGLRenderer>
      try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:"high-performance"})}catch{failureRef.current();return}
      renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0x03060a,1);renderer.autoClear=false
      host.appendChild(renderer.domElement)
      const scene=new T.Scene();scene.fog=new T.FogExp2(0x03060a,.009)
      const camera=new T.PerspectiveCamera(55,1,.1,1100);scene.add(camera)
      const resources:{dispose:()=>void}[]=[]
      const reduced=matchMedia("(prefers-reduced-motion: reduce)")
      const fract=(n:number)=>n-Math.floor(n)
      // A continuous, eroded valley with tall ridges enclosing both sides.
      const fractal=(x:number,z:number)=>{
        let value=0,weight=1,frequency=.012
        for(let o=0;o<6;o++){value+=Math.abs(Math.sin(x*frequency+Math.sin(z*frequency*.73))*Math.cos(z*frequency*.91+x*frequency*.4))*weight;weight*=.48;frequency*=2.13}
        return value
      }
      const terrainGeometry=new T.PlaneGeometry(650,1600,innerWidth<768?170:340,innerWidth<768?360:800)
      terrainGeometry.rotateX(-Math.PI/2);terrainGeometry.translate(0,0,-500)
      const positions=terrainGeometry.attributes.position
      for(let i=0;i<positions.count;i++) {
        const x=positions.getX(i),z=positions.getZ(i),valley=Math.sin(z*.009)*13
        const bank=1-Math.exp(-Math.pow(Math.abs(x-valley)/62,2))
        positions.setY(i,-9+fractal(x,z)*7+bank*(50+fractal(x+90,z)*72))
      }
      terrainGeometry.computeVertexNormals()
      const terrainMaterial=new T.MeshStandardMaterial({color:0x33444b,roughness:.94,metalness:.12,transparent:true,opacity:0,side:T.DoubleSide})
      const terrain=new T.Mesh(terrainGeometry,terrainMaterial);terrain.frustumCulled=false;scene.add(terrain,new T.HemisphereLight(0xb8d7e2,0x080d16,1.6))
      const moon=new T.DirectionalLight(0xb8d0dc,3.2);moon.position.set(-100,110,-180);scene.add(moon)
      const rim=new T.DirectionalLight(0x577b8b,1.8);rim.position.set(110,45,-450);scene.add(rim)
      resources.push(terrainGeometry,terrainMaterial)
      // Short, soft particle wisps advect through the valley in a single draw call.
      const windCount=innerWidth<768?1400:2800,windGeometry=new T.BufferGeometry()
      const windSeeds=new Float32Array(windCount*3)
      for(let i=0;i<windCount;i++)windSeeds.set([Math.floor(i/100)/28,(i%100)/99,fract(i*.6180339)],i*3)
      windGeometry.setAttribute("position",new T.BufferAttribute(windSeeds,3))
      const windMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,
        uniforms:{time:{value:0},travel:{value:0},opacity:{value:0},pixel:{value:renderer.getPixelRatio()}},
        vertexShader:`uniform float time,travel,opacity,pixel;varying float alpha;
        void main(){float id=position.x*28.,tail=position.y;
          float depth=mod(id*19.71-time*(46.+mod(id,5.)*4.),380.);
          float z=travel-depth-tail*(5.+mod(id,4.)*2.);
          float x=sin(id*17.3)*43.+sin(z*.018+id)*7.;
          float y=42.+mod(id*7.31,39.)+sin(z*.04+id)*2.;
          x+=sin(tail*4.+id)*.3+(position.z-.5)*.35;
          y+=cos(tail*3.+id)*.25+(position.z-.5)*.24;
          vec4 mv=modelViewMatrix*vec4(x,y,z,1.);gl_Position=projectionMatrix*mv;
          gl_PointSize=clamp((2.+position.z*2.)*pixel*26./max(1.,-mv.z),1.,9.);
          alpha=opacity*sin(tail*3.14159)*smoothstep(3.,25.,depth)*(1.-smoothstep(250.,380.,depth));
        }`,fragmentShader:`varying float alpha;void main(){float d=length(gl_PointCoord-.5);float glow=exp(-d*d*22.);gl_FragColor=vec4(.59,.72,.76,glow*alpha*.28);}`})
      const wind=new T.Points(windGeometry,windMaterial);wind.frustumCulled=false;scene.add(wind);resources.push(windGeometry,windMaterial)
      // The entry wave is rendered in screen space, clipped below the navigation.
      const overlay=new T.Scene(),overlayCamera=new T.OrthographicCamera(-1,1,1,-1,0,2)
      overlayCamera.position.z=1
      const waveCount=innerWidth<768?4500:8000,waveGeometry=new T.BufferGeometry(),waveSeeds=new Float32Array(waveCount*3)
      for(let i=0;i<waveCount;i++)waveSeeds.set([fract(i*.6180339),fract(i*.7548776),fract(i*.5698402)],i*3)
      waveGeometry.setAttribute("position",new T.BufferAttribute(waveSeeds,3))
      const waveMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{uTime:{value:0},uEntry:{value:0},uScroll:{value:0},uMouse:{value:new T.Vector2(9,9)},uRatio:{value:1},uPixel:{value:renderer.getPixelRatio()}},
        vertexShader:`uniform float uTime,uEntry,uScroll,uRatio,uPixel;uniform vec2 uMouse;varying float vAlpha;varying float vSeed;
        void main(){vec3 seed=position;float x=(seed.x*2.-1.)*1.3;float y=sin(x*2.+uTime*.28+seed.z*.65)*.17+sin(x*3.8-uTime*.19)*.055-.18+(seed.y-.5)*(.24+seed.z*.3);
          if(seed.z>.90)y=(seed.y*2.-1.)*.95;
          float spread=smoothstep(seed.z*.22,1.,uEntry);vec2 target=vec2(seed.x*2.-1.,seed.y*1.92-.96);
          vec2 p=mix(vec2(x,y),target,spread);float swirl=sin(spread*3.14159);p+=vec2(sin(seed.z*24.+spread*3.),cos(seed.x*19.+spread*2.))*swirl*.16;p+=vec2(sin(seed.z*30.+uTime*.15),cos(seed.x*20.+uTime*.12))*.025;
          p+=uMouse*vec2(-.035,-.025)*(1.-seed.z*.6);vec2 delta=p-uMouse;float influence=exp(-dot(delta,delta)*18.);p+=(normalize(delta+vec2(.001))*.065+vec2(-delta.y,delta.x)*.24)*influence;
          float twinkle=pow(.5+.5*sin(uTime*.7+seed.z*150.),10.);
          vAlpha=mix(.50,.12,spread)*(.45+twinkle*2.2)*(1.-uScroll*.6);vSeed=seed.z;
          gl_Position=vec4(p,0.,1.);gl_PointSize=(1.1+pow(seed.z,8.)*4.+twinkle*1.5)*uPixel;}`,
        fragmentShader:`varying float vAlpha;varying float vSeed;void main(){vec2 p=gl_PointCoord-.5;float d=length(p);if(d>.5)discard;float halo=pow(1.-d*2.,2.);float core=exp(-d*d*100.);vec3 tint=vec3(.94,.97,1.);gl_FragColor=vec4(tint,(halo*.65+core*1.5)*vAlpha);}`})
      const wave=new T.Points(waveGeometry,waveMaterial);wave.frustumCulled=false;overlay.add(wave);resources.push(waveGeometry,waveMaterial)
      let frame=0,time=0,last=0,visible=false,pointerX=0,pointerY=0,smoothX=0,smoothY=0,previousProgress=0,scrollEnergy=0,smoothedProgress=progress.current
      const clamp=(n:number)=>Math.max(0,Math.min(1,n))
      const headings=Array.from(host.closest(".cinematic-hero")!.querySelectorAll<HTMLElement>(".flight-heading"))
      const headingPainter=mountainHeadingPainter(headings[0].parentElement!,headings)
      const render=(now:number)=>{
        frame=0;if(disposed||!visible||document.hidden)return
        const dt=Math.min((now-(last||now))/1000,.15);last=now;if(!reduced.matches)time+=dt
        smoothedProgress=progress.current; const p=reduced.matches?progress.current:smoothedProgress,e=entry.current,fly=reduced.matches?0:p
        const follow=1-Math.exp(-dt*3.5);smoothX+=((reduced.matches?0:pointerX)-smoothX)*follow;smoothY+=((reduced.matches?0:pointerY)-smoothY)*follow
        camera.position.set(-3+Math.sin(fly*Math.PI*1.8)*15+smoothX*12,64+Math.sin(fly*Math.PI)*8-smoothY*5,115-fly*760)
        camera.lookAt(Math.sin(fly*Math.PI*1.8+.3)*12+smoothX*24,43-smoothY*8,camera.position.z-130)
        camera.rotateZ(Math.sin(fly*Math.PI*2)*.025-smoothX*.018)
        camera.updateMatrixWorld()
        headingPainter?.clear()
        headings.forEach((heading,i)=>{
          const checkpoint=.23+i*.155,depth=(checkpoint-p)*760+75
          const opacity=depth>.5?clamp((112-depth)/24)*clamp((p-.12)/.08):0
          const scale=reduced.matches?1:85/Math.max(.5,depth)
          headingPainter?.draw(i,scale,opacity*e)
          heading.style.opacity=String(opacity*e)
          heading.style.visibility=opacity>0?"visible":"hidden"
          // Stay opaque through the close pass; the viewport clips the expanding
          // heading until its depth passes the camera. Keep its centre fixed.
          heading.style.transform=`translate(-50%,-50%) scale(${scale})`
        })


        const appear=reduced.matches?e:clamp((e-.15)/.85)
        const speed=reduced.matches?0:Math.min(1,Math.abs(p-previousProgress)/Math.max(dt,.001)*10);previousProgress=p
        scrollEnergy+=(speed-scrollEnergy)*Math.min(1,dt*4)
        terrainMaterial.opacity=appear*(1-clamp((p-.97)/.03))
        terrain.position.y=Math.sin(time*.16)*.12
        windMaterial.uniforms.time.value=time
        windMaterial.uniforms.travel.value=camera.position.z
        windMaterial.uniforms.opacity.value=appear*(.45+scrollEnergy*.2)*(1-clamp((p-.93)/.07))
        waveMaterial.uniforms.uTime.value=time;waveMaterial.uniforms.uEntry.value=e;waveMaterial.uniforms.uScroll.value=p
        waveMaterial.uniforms.uMouse.value.set(smoothX,-smoothY)
        renderer.clear();renderer.render(scene,camera);renderer.clearDepth();renderer.render(overlay,overlayCamera)
        if(!reduced.matches||e<1&&e>0)frame=requestAnimationFrame(render)
      }
      const sync=()=>{if(!frame&&!document.hidden&&visible){last=0;frame=requestAnimationFrame(render)}}
      const resize=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();headingPainter?.measure();sync()});resize.observe(host)
      void document.fonts.ready.then(()=>{if(!disposed){headingPainter?.measure();sync()}})
      const observer=new IntersectionObserver(([r])=>{visible=r.isIntersecting;if(visible)sync();else {cancelAnimationFrame(frame);frame=0}});observer.observe(host)
      const leave=()=>{pointerX=0;pointerY=0;sync()}
      const move=(event:PointerEvent)=>{const r=host.getBoundingClientRect();if(!visible||event.pointerType!=="mouse"||event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom){leave();return}pointerX=(event.clientX-r.left)/r.width*2-1;pointerY=(event.clientY-r.top)/r.height*2-1;sync()}
      document.documentElement.addEventListener("pointerleave",leave)
      window.addEventListener("pointermove",move,{passive:true});window.addEventListener("scroll",sync,{passive:true});document.addEventListener("visibilitychange",sync);window.addEventListener("portfolio:entered",sync);reduced.addEventListener("change",sync)
      cleanup=()=>{document.documentElement.removeEventListener("pointerleave",leave);cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();window.removeEventListener("pointermove",move);window.removeEventListener("scroll",sync);document.removeEventListener("visibilitychange",sync);window.removeEventListener("portfolio:entered",sync);reduced.removeEventListener("change",sync);headingPainter?.dispose();resources.forEach(r=>r.dispose());renderer.dispose();renderer.domElement.remove()}
    }).catch(()=>{if(!disposed)failureRef.current()})
    return()=>{disposed=true;cleanup()}
  },[progress,entry])
  return <div ref={hostRef} className="mountain-flight" aria-hidden="true" />
}


