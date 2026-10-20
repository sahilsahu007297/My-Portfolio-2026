import { useEffect, useRef, type RefObject } from "react"


export default function MountainFlight({progress,entry,onReady,onUnavailable}:{progress:RefObject<number>;entry:RefObject<number>;onReady:()=>void;onUnavailable:()=>void}) {
  const hostRef=useRef<HTMLDivElement>(null)
  const failureRef=useRef(onUnavailable);failureRef.current=onUnavailable
  const readyRef=useRef(onReady);readyRef.current=onReady
  useEffect(()=>{
    const host=hostRef.current!
    let disposed=false,ready=false,cleanup=()=>{}
    void Promise.all([import("three"),import("./mountainBiplanes")]).then(([T,{default:createBiplanes}])=>{
      if(disposed)return
      let renderer: InstanceType<typeof T.WebGLRenderer>
      try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:"high-performance"})}catch{failureRef.current();return}
      renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0x03060a,0);renderer.autoClear=false
      host.appendChild(renderer.domElement)
      const scene=new T.Scene();scene.fog=new T.FogExp2(0x03060a,.0045)
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
      const terrainHeight=(x:number,z:number,lift=1)=>{
        const valley=Math.sin(z*.009)*13,bank=1-Math.exp(-Math.pow(Math.abs(x-valley)/62,2))
        const radius=Math.sqrt(Math.pow(x/85,2)+Math.pow((z+65)/85,2)),core=Math.max(0,1-radius)
        const erosion=(Math.sin(x*.21+z*.08)+Math.sin(x*.39-z*.16)*.45)*22*core*(1-core)
        const peak=Math.pow(core,1.4)*(98+fractal(x*2+19,z*2-31)*12)+erosion
        return -9+fractal(x,z)*7+bank*(50+fractal(x+90,z)*72)*(1-.8*Math.exp(-Math.pow((z+20)/160,2)))+peak*lift
      }
      const terrainGeometry=new T.PlaneGeometry(650,1600,innerWidth<768?170:340,innerWidth<768?360:800)
      terrainGeometry.rotateX(-Math.PI/2);terrainGeometry.translate(0,0,-500)
      const positions=terrainGeometry.attributes.position
      const summitOffsets=new Float32Array(positions.count)
      const summitLift={value:1}
      for(let i=0;i<positions.count;i++) {
        const x=positions.getX(i),z=positions.getZ(i),valley=Math.sin(z*.009)*13
        const bank=1-Math.exp(-Math.pow(Math.abs(x-valley)/62,2))
        const radius=Math.sqrt(Math.pow(x/85,2)+Math.pow((z+65)/85,2))
        const core=Math.max(0,1-radius)
        const erosion=(Math.sin(x*.21+z*.08)+Math.sin(x*.39-z*.16)*.45)*22*core*(1-core)
        const peak=Math.pow(core,1.4)*(98+fractal(x*2+19,z*2-31)*12)+erosion
        summitOffsets[i]=peak
        positions.setY(i,-9+fractal(x,z)*7+bank*(50+fractal(x+90,z)*72)*(1-.8*Math.exp(-Math.pow((z+20)/160,2)))+peak)
      }
      terrainGeometry.computeVertexNormals()
      terrainGeometry.setAttribute("summitOffset",new T.BufferAttribute(summitOffsets,1))
      const terrainMaterial=new T.MeshStandardMaterial({color:0x33444b,roughness:.94,metalness:.12,transparent:true,opacity:0,side:T.DoubleSide})
      terrainMaterial.onBeforeCompile=shader=>{
        shader.uniforms.summitLift=summitLift
        shader.vertexShader="uniform float summitLift; attribute float summitOffset;\n"+shader.vertexShader
        shader.vertexShader=shader.vertexShader.replace("#include <begin_vertex>","#include <begin_vertex>\n transformed.y -= summitOffset * (1. - summitLift);")
      }
      const terrain=new T.Mesh(terrainGeometry,terrainMaterial);terrain.frustumCulled=false;scene.add(terrain,new T.HemisphereLight(0xb8d7e2,0x080d16,1.6))
      const moon=new T.DirectionalLight(0xb8d0dc,3.2);moon.position.set(-100,110,-180);scene.add(moon)
      const rim=new T.DirectionalLight(0x577b8b,1.8);rim.position.set(110,45,-450);scene.add(rim)
      resources.push(terrainGeometry,terrainMaterial)
      const summitKey=new T.DirectionalLight(0xbcdce4,1.8);summitKey.position.set(-70,160,140);scene.add(summitKey)
      const summitGlow=new T.PointLight(0xb8e6f2,9000,240,2);summitGlow.position.set(-35,120,10);scene.add(summitGlow)
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
        void main(){vec3 seed=position;float drift=uTime*(.045+seed.z*.065);
          float x=mod(seed.x*2.6+drift,2.6)-1.3;
          x+=sin(uTime*.23+seed.y*31.)*.10;
          float width=.18+.38*pow(.5+.5*sin(x*3.1+uTime*.17),2.);
          float y=sin(x*2.+uTime*.28+seed.z*2.4)*.22+sin(x*4.8-uTime*.19+seed.y*5.)*.10-.12;
          y+=(seed.y-.5)*width*2.+sin(uTime*(.16+seed.z*.28)+seed.x*48.)*.14;
          if(seed.z>.72)y=(seed.y*2.-1.)*.95+sin(uTime*.21+seed.x*20.)*.08;
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
      let headingSizes=headings.map(heading=>({width:heading.offsetWidth,height:heading.offsetHeight}))
      const measureHeadings=()=>{headingSizes=headings.map(heading=>({width:heading.offsetWidth,height:heading.offsetHeight}))}
      const biplanes=createBiplanes(T,camera,renderer.getPixelRatio())
      host.closest(".cinematic-hero")!.classList.add("has-three-summit")
      const render=(now:number)=>{
        frame=0;if(disposed||!visible||document.hidden)return
        const dt=Math.min((now-(last||now))/1000,.15);last=now;if(!reduced.matches)time+=dt
        smoothedProgress=progress.current; const p=reduced.matches?progress.current:smoothedProgress,e=entry.current,fly=reduced.matches?0:p
        const follow=1-Math.exp(-dt*3.5);smoothX+=((reduced.matches?0:pointerX)-smoothX)*follow;smoothY+=((reduced.matches?0:pointerY)-smoothY)*follow
        camera.position.set(-3+Math.sin(fly*Math.PI*1.8)*15+smoothX*12,64+Math.sin(fly*Math.PI)*8-smoothY*5,115-fly*760)
        camera.lookAt(Math.sin(fly*Math.PI*1.8+.3)*12+smoothX*24,43+Math.sin(clamp(fly/.20)*Math.PI)*(innerWidth<768?12:25)-smoothY*8,camera.position.z-130)
        camera.rotateZ(Math.sin(fly*Math.PI*2)*.025-smoothX*.018)
        camera.updateMatrixWorld()
        biplanes.update(p,time,e,reduced.matches)
        const opening=1-Math.pow(1-clamp((e-.12)/.88),3)
        const occupied:{left:number;top:number;right:number;bottom:number}[]=[]
        headings.forEach((heading,i)=>{
          // Fixed world landmarks approach the camera; scroll never relocates them.
          const checkpoint=.20+i*.158,z=-checkpoint*760
          const x=Math.sin(checkpoint*Math.PI*1.8+.3)*12+(innerWidth<768?2:(i%2?-20:20))
          const landmark=new T.Vector3(x,terrainHeight(x,z,0)+22,z)
          const depth=camera.position.z-z,distance=camera.position.distanceTo(landmark)
          const opacity=depth>0?clamp((235-depth)/55)*clamp((depth-25)/30)*clamp((p-.075)/.035)*e:0
          landmark.project(camera)
          const anchorX=(landmark.x*.5+.5)*host.clientWidth
          const anchorY=(-landmark.y*.5+.5)*host.clientHeight
          const scale=reduced.matches?1:Math.max(.35,Math.min(2.2,115/distance))
          const size=headingSizes[i]
          const box={left:anchorX-size.width*scale/2,top:anchorY-size.height*scale,right:anchorX+size.width*scale/2,bottom:anchorY}
          const overlaps=occupied.some(other=>box.left<other.right+25&&box.right>other.left-25&&box.top<other.bottom+25&&box.bottom>other.top-25)
          const visible=opacity>0&&!overlaps
          if(visible&&opacity>.05&&box.bottom>0&&box.top<host.clientHeight)occupied.push(box)
          heading.style.left=`${anchorX}px`;heading.style.top=`${anchorY}px`
          heading.style.opacity=String(visible?opacity:0)
          heading.style.visibility=visible?"visible":"hidden"
          heading.style.transform=`translate(-50%,-100%) scale(${scale})`
          heading.style.transformOrigin="50% 100%"

        })
        summitLift.value=opening*(1-clamp((p-.03)/.13))

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
        if(!ready){ready=true;readyRef.current()}
        if(!reduced.matches||e<1&&e>0)frame=requestAnimationFrame(render)
      }
      const sync=()=>{if(!frame&&!document.hidden&&visible){last=0;frame=requestAnimationFrame(render)}}
      const resize=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();measureHeadings();sync()});resize.observe(host)
      void document.fonts.ready.then(()=>{if(!disposed){measureHeadings();sync()}})
      const observer=new IntersectionObserver(([r])=>{visible=r.isIntersecting;if(visible)sync();else {cancelAnimationFrame(frame);frame=0}});observer.observe(host)
      const leave=()=>{pointerX=0;pointerY=0;sync()}
      const move=(event:PointerEvent)=>{const r=host.getBoundingClientRect();if(!visible||event.pointerType!=="mouse"||event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom){leave();return}pointerX=(event.clientX-r.left)/r.width*2-1;pointerY=(event.clientY-r.top)/r.height*2-1;sync()}
      document.documentElement.addEventListener("pointerleave",leave)
      window.addEventListener("pointermove",move,{passive:true});window.addEventListener("scroll",sync,{passive:true});document.addEventListener("visibilitychange",sync);window.addEventListener("portfolio:entered",sync);reduced.addEventListener("change",sync)
      cleanup=()=>{document.documentElement.removeEventListener("pointerleave",leave);cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();window.removeEventListener("pointermove",move);window.removeEventListener("scroll",sync);document.removeEventListener("visibilitychange",sync);window.removeEventListener("portfolio:entered",sync);reduced.removeEventListener("change",sync);biplanes.dispose();host.closest(".cinematic-hero")?.classList.remove("has-three-summit");resources.forEach(r=>r.dispose());renderer.dispose();renderer.domElement.remove()}
    }).catch(()=>{if(!disposed)failureRef.current()})
    return()=>{disposed=true;cleanup()}
  },[progress,entry])
  return <div ref={hostRef} className="mountain-flight" aria-hidden="true" />
}


