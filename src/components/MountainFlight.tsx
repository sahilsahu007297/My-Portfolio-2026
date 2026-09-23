import { useEffect, useRef, type RefObject } from "react"

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
      // Reuse the original height-map mountain profile across the flight path.
      const textureLoader=new T.TextureLoader()
      const heightMap=textureLoader.load(`${import.meta.env.BASE_URL}terrain/height.png`,()=>sync())
      heightMap.wrapS=T.MirroredRepeatWrapping;heightMap.wrapT=T.MirroredRepeatWrapping;heightMap.repeat.set(1,5)
      resources.push(heightMap)
      const terrainGeometry=new T.PlaneGeometry(300,1200,innerWidth<768?100:180,innerWidth<768?400:720)
      terrainGeometry.rotateX(-Math.PI/2);terrainGeometry.translate(0,0,-400)
      const terrainMaterial=new T.MeshStandardMaterial({color:0xd6e7e0,wireframe:true,transparent:true,opacity:0,depthWrite:false,displacementMap:heightMap,displacementScale:40,side:T.DoubleSide})
      const terrain=new T.Mesh(terrainGeometry,terrainMaterial);terrain.frustumCulled=false;terrain.renderOrder=1;scene.add(terrain,new T.AmbientLight(0xffffff,2))
      resources.push(terrainGeometry,terrainMaterial)
      const groundMaterial=new T.MeshBasicMaterial({color:0x03070b,transparent:true,opacity:0,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1})
      // Keep the dark base below the displaced ridges.
      const ground=new T.Mesh(terrainGeometry,groundMaterial);ground.position.y=-1;scene.add(ground);resources.push(groundMaterial)
      const terrainTime={value:0},terrainMouse={value:new T.Vector2()}
      terrainMaterial.onBeforeCompile=shader=>{
        shader.uniforms.uTerrainTime=terrainTime;shader.uniforms.uTerrainMouse=terrainMouse
        shader.vertexShader="uniform float uTerrainTime;uniform vec2 uTerrainMouse;\n"+shader.vertexShader
        shader.vertexShader=shader.vertexShader.replace("#include <displacementmap_vertex>",`#include <displacementmap_vertex>
          float d=length(position.xz-uTerrainMouse);
          transformed.y+=sin(d*.13-uTerrainTime*2.)*exp(-d*.015)*1.5;
          transformed.y+=sin(position.x*.06+position.z*.035+uTerrainTime*.45)*.45;`)
      }
      // Sparse, long air currents travel between the ridgelines.
      const winds: InstanceType<typeof T.Line>[]=[]
      for(let j=0;j<14;j++){
        const pts=[]
        for(let k=0;k<160;k++){const z=150-k*6;const x=Math.sin(z*.016+j*.8)*(18+j*3)+(j-6.5)*10;pts.push(new T.Vector3(x,18+j*.9+Math.sin(z*.023+j)*4,z))}
        const g=new T.BufferGeometry().setFromPoints(pts),m=new T.LineBasicMaterial({color:0xb5cbd6,transparent:true,opacity:0,depthWrite:false})
        const line=new T.Line(g,m);scene.add(line);winds.push(line);resources.push(g,m)
      }
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
          float spread=smoothstep(0.,.9,uEntry);vec2 target=vec2(seed.x*2.-1.,seed.y*1.92-.96);
          vec2 p=mix(vec2(x,y),target,spread);p+=vec2(sin(seed.z*30.+uTime*.15),cos(seed.x*20.+uTime*.12))*.025;
          p+=uMouse*vec2(-.035,-.025)*(1.-seed.z*.6);vec2 delta=p-uMouse;float influence=exp(-dot(delta,delta)*18.);p+=(normalize(delta+vec2(.001))*.065+vec2(-delta.y,delta.x)*.24)*influence;
          float twinkle=pow(.5+.5*sin(uTime*.7+seed.z*150.),10.);
          vAlpha=mix(.50,.12,spread)*(.45+twinkle*2.2)*(1.-uScroll*.6);vSeed=seed.z;
          gl_Position=vec4(p,0.,1.);gl_PointSize=(1.1+pow(seed.z,8.)*4.+twinkle*1.5)*uPixel;}`,
        fragmentShader:`varying float vAlpha;varying float vSeed;void main(){vec2 p=gl_PointCoord-.5;float d=length(p);if(d>.5)discard;float halo=pow(1.-d*2.,2.);float core=exp(-d*d*100.);vec3 tint=vec3(.94,.97,1.);gl_FragColor=vec4(tint,(halo*.65+core*1.5)*vAlpha);}`})
      const wave=new T.Points(waveGeometry,waveMaterial);wave.frustumCulled=false;overlay.add(wave);resources.push(waveGeometry,waveMaterial)
      let frame=0,time=0,last=0,visible=false,pointerX=0,pointerY=0,smoothX=0,smoothY=0,previousProgress=0,scrollEnergy=0,smoothedProgress=progress.current
      const clamp=(n:number)=>Math.max(0,Math.min(1,n))
      const render=(now:number)=>{
        frame=0;if(disposed||!visible||document.hidden)return
        const dt=Math.min((now-(last||now))/1000,.15);last=now;if(!reduced.matches)time+=dt
        smoothedProgress+=(progress.current-smoothedProgress)*(1-Math.exp(-dt*5)); const p=reduced.matches?progress.current:smoothedProgress,e=entry.current,fly=reduced.matches?0:p
        const follow=1-Math.exp(-dt*3.5);smoothX+=((reduced.matches?0:pointerX)-smoothX)*follow;smoothY+=((reduced.matches?0:pointerY)-smoothY)*follow
        camera.position.set(-3+Math.sin(fly*Math.PI*1.8)*15+smoothX*12,38+Math.sin(fly*Math.PI)*15-smoothY*5,115-fly*430)
        camera.lookAt(Math.sin(fly*Math.PI*1.8+.3)*12+smoothX*24,10-fly*22-smoothY*12,camera.position.z-130)
        camera.rotateZ(Math.sin(fly*Math.PI*2)*.025-smoothX*.018)
        terrainTime.value=time;terrainMouse.value.set(smoothX*100,camera.position.z-75+smoothY*65)
        terrainMaterial.displacementScale=40
        const appear=reduced.matches?e:clamp((e-.15)/.85)
        const speed=reduced.matches?0:Math.min(1,Math.abs(p-previousProgress)/Math.max(dt,.001)*10);previousProgress=p
        scrollEnergy+=(speed-scrollEnergy)*Math.min(1,dt*4)
        terrainMaterial.opacity=appear*(.27*(1-clamp((p-.93)/.07)));groundMaterial.opacity=appear
        terrain.position.y=Math.sin(time*.16)*.12
        for(let j=0;j<winds.length;j++){winds[j].position.z=Math.sin(time*.22+j)*12+p*95+scrollEnergy*12;(winds[j].material as InstanceType<typeof T.LineBasicMaterial>).opacity=appear*(.19+j*.004+scrollEnergy*.25)*(1-clamp((p-.93)/.07))}
        waveMaterial.uniforms.uTime.value=time;waveMaterial.uniforms.uEntry.value=e;waveMaterial.uniforms.uScroll.value=p
        waveMaterial.uniforms.uMouse.value.set(smoothX,-smoothY)
        renderer.clear();renderer.render(scene,camera);renderer.clearDepth();renderer.render(overlay,overlayCamera)
        if(!reduced.matches||e<1&&e>0)frame=requestAnimationFrame(render)
      }
      const sync=()=>{if(!frame&&!document.hidden&&visible){last=0;frame=requestAnimationFrame(render)}}
      const resize=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();sync()});resize.observe(host)
      const observer=new IntersectionObserver(([r])=>{visible=r.isIntersecting;if(visible)sync();else {cancelAnimationFrame(frame);frame=0}});observer.observe(host)
      const leave=()=>{pointerX=0;pointerY=0;sync()}
      const move=(event:PointerEvent)=>{const r=host.getBoundingClientRect();if(!visible||event.pointerType!=="mouse"||event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom){leave();return}pointerX=(event.clientX-r.left)/r.width*2-1;pointerY=(event.clientY-r.top)/r.height*2-1;sync()}
      document.documentElement.addEventListener("pointerleave",leave)
      window.addEventListener("pointermove",move,{passive:true});window.addEventListener("scroll",sync,{passive:true});document.addEventListener("visibilitychange",sync);window.addEventListener("portfolio:entered",sync);reduced.addEventListener("change",sync)
      cleanup=()=>{document.documentElement.removeEventListener("pointerleave",leave);cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();window.removeEventListener("pointermove",move);window.removeEventListener("scroll",sync);document.removeEventListener("visibilitychange",sync);window.removeEventListener("portfolio:entered",sync);reduced.removeEventListener("change",sync);resources.forEach(r=>r.dispose());renderer.dispose();renderer.domElement.remove()}
    }).catch(()=>{if(!disposed)failureRef.current()})
    return()=>{disposed=true;cleanup()}
  },[progress,entry])
  return <div ref={hostRef} className="mountain-flight" aria-hidden="true" />
}


