import * as T from "three"
import { fighterParts } from "./fighterModel"

// Sample complete, closed model surfaces by triangle area, retaining true normals.
export function particleShapes(count: number) {
  const shapes: Float32Array[] = [], normals: Float32Array[] = []
  let seed = 9173
  const random = () => { seed = (Math.imul(1664525, seed)+1013904223)>>>0; return seed/4294967296 }
  const sphere = (r:number) => new T.SphereGeometry(r,48,32)
  const ring = (r:number,t:number) => new T.TorusGeometry(r,t,16,80)
  for (let shape=0;shape<12;shape++) {
    const parts:T.BufferGeometry[]=[]
    const add=(g:T.BufferGeometry,x=0,y=0,z=0,rx=0,ry=0,rz=0) => {
      g.rotateX(rx);g.rotateY(ry);g.rotateZ(rz);g.translate(x,y,z);parts.push(g)
    }
    const tube=(points:T.Vector3[],radius=.025,closed=false)=>new T.TubeGeometry(new T.CatmullRomCurve3(points,closed),100,radius,6,closed)
    const line=(a:number[],b:number[],r=.025)=>tube([new T.Vector3(...a),new T.Vector3(...b)],r)
    const boxFrame=(w:number,h:number,d:number,y=0)=>{
      for(const x of [-w/2,w/2])for(const z of [-d/2,d/2])add(line([x,-h/2,z],[x,h/2,z]),0,y)
      for(const yy of [-h/2,h/2])for(const z of [-d/2,d/2])add(line([-w/2,yy,z],[w/2,yy,z]),0,y)
      for(const yy of [-h/2,h/2])for(const x of [-w/2,w/2])add(line([x,yy,-d/2],[x,yy,d/2]),0,y)
    }
    // Purpose-built miniature instruments, rendered exclusively as sampled particles.
    if(shape===0){ // Research: a lens and its concentric field of view.
      add(ring(1.35,.085));add(ring(1.1,.025),0,0,.18);add(ring(.8,.025),0,0,-.2)
      const lens=sphere(1);lens.scale(.72,.72,.16);add(lens)
      add(line([.95,-.95,0],[1.85,-1.85,0],.12))
      for(let i=0;i<8;i++){const a=i*Math.PI/4;add(line([Math.cos(a)*1.5,Math.sin(a)*1.5,0],[Math.cos(a)*1.68,Math.sin(a)*1.68,0]))}
    }
    if(shape===1){ // Context: a topographic operating envelope.
      for(let layer=0;layer<12;layer++){
        const r=.28+layer*.15,pts=[]
        for(let j=0;j<90;j++){const a=j/90*Math.PI*2,rr=r*(1+.12*Math.sin(a*3+layer*.15));pts.push(new T.Vector3(Math.cos(a)*rr,1.1-layer*.17,Math.sin(a)*rr*.7))}
        add(tube(pts,.025,true))
      }
    }
    if(shape===2){ // Architecture: ribs establish the wing before its skin.
      for(let j=0;j<13;j++){
        const x=-2+j/3,pts=[]
        for(let k=0;k<60;k++){const a=k/60*Math.PI*2;pts.push(new T.Vector3(x,Math.sin(a)*.20*(1-Math.abs(x)*.17),Math.cos(a)*(.9-Math.abs(x)*.22)+x*.2))}
        add(tube(pts,.028,true))
      }
      for(const z of [-.3,0,.3])add(line([-2,0,z-.4],[2,0,z+.4],.035))
    }
    if(shape===3){ // Wind tunnel: streamlines bend around the test section.
      for(let j=0;j<7;j++)add(ring(1.15,.028),0,0,-1.7+j*.55)
      for(let j=0;j<12;j++){const a=j/12*Math.PI*2,pts=[];for(let k=0;k<35;k++){const z=-2+k/34*4,r=.6+.55*Math.exp(-z*z*2);pts.push(new T.Vector3(Math.cos(a)*r,Math.sin(a)*r,z))}add(tube(pts,.018))}
      const foil=sphere(1);foil.scale(.65,.16,1.2);add(foil)
    }
    if(shape===4){ // Cockpit: a hierarchy of instruments around one critical reading.
      boxFrame(3.5,2.1,.35)
      for(const [x,y,r] of [[0,.2,.65],[-1.15,.45,.32],[1.15,.45,.32],[-1.1,-.55,.25],[1.1,-.55,.25]]){
        add(ring(r,.035),x,y,.3);add(line([x,y,.3],[x+r*.55,y+r*.4,.3],.025))
        for(let j=0;j<12;j++){const a=j*Math.PI/6;add(line([x+Math.cos(a)*r*.8,y+Math.sin(a)*r*.8,.3],[x+Math.cos(a)*r*.94,y+Math.sin(a)*r*.94,.3],.015))}
      }
      for(let i=0;i<6;i++)add(new T.BoxGeometry(.11,.1,.1),-.42+i*.17,-.8,.25)
    }
    if(shape===5){ // Systems: aligned reusable layers and shared interfaces.
      for(let i=0;i<4;i++){
        boxFrame(2.7,.08,1.8,-1+i*.65)
        for(let j=0;j<3;j++)add(new T.BoxGeometry(.55,.12,.45),-.8+j*.8,-.94+i*.65,0)
      }
      for(const x of [-1.35,1.35])add(line([x,-1.2,-.9],[x,1.3,-.9],.035))
    }
    if(shape===6){ // Integration: a deliberately exploded airframe assembly.
      const fuselage=sphere(1);fuselage.scale(.3,1.7,.3);add(fuselage)
      for(const side of [-1,1]){const wing=new T.BoxGeometry(1.5,.55,.08);add(wing,side*1.3,-.2,side*.3,0,0,side*.25);add(line([side*.3,-.2,0],[side*.7,-.2,side*.3],.02))}
      for(let i=0;i<4;i++)add(ring(.34,.025),0,-1.3+i*.8,0,Math.PI/2)
    }
    if(shape===7){ // Ground checks: a suspended component in a diagnostic rig.
      boxFrame(2.8,2.8,1.6)
      add(ring(.8,.06),0,0,.2);add(ring(.58,.025),0,0,.3)
      for(let i=0;i<8;i++){const a=i*Math.PI/4;add(line([Math.cos(a)*.85,Math.sin(a)*.85,.2],[Math.cos(a)*1.4,Math.sin(a)*1.4,.2],.02))}
      add(line([-.4,0,.35],[-.1,-.25,.35],.06));add(line([-.1,-.25,.35],[.45,.35,.35],.06))
    }
    if(shape===8){ // Validation: a measured flight envelope around the prototype.
      parts.push(...fighterParts(1).map(part=>part.geometry.scale(.38,.38,.38)))
      add(ring(1.9,.025),0,0,0,.55);add(ring(1.7,.025),0,0,0,-.7,.6)
      for(let i=0;i<4;i++)add(sphere(.09),Math.cos(i*Math.PI/2)*1.9,Math.sin(i*Math.PI/2)*1.9)
    }
    if(shape===9){ // Iteration: continuous return paths, with checkpoint beads.
      for(let lane=0;lane<5;lane++){
        const pts=[];for(let j=0;j<100;j++){const a=j/100*Math.PI*2;pts.push(new T.Vector3(Math.sin(a)*1.9,Math.sin(a*2)*.7,Math.cos(a)*.35+(lane-2)*.12))}add(tube(pts,.025,true))
      }
      for(const a of [.4,2.4,4.1])add(sphere(.13),Math.sin(a)*1.9,Math.sin(a*2)*.7,Math.cos(a)*.35)
    }
    if(shape===10){for(let i=0;i<7;i++)add(ring(1.25-i*.13,.035),0,0,-1+i*.3);add(new T.ConeGeometry(.38,1.4,32),0,0,.2,Math.PI/2)}
    if(shape===11)parts.push(...fighterParts(1).map(part=>part.geometry))
    parts.forEach(g=>{if(shape!==11){g.rotateX(-.48);g.rotateY(-.22)}g.computeVertexNormals()})
    const triangles: {g:T.BufferGeometry;a:number;b:number;c:number;sum:number}[]=[]
    let total=0
    const va=new T.Vector3(),vb=new T.Vector3(),vc=new T.Vector3(),ab=new T.Vector3(),ac=new T.Vector3()
    for(const g of parts){
      const p=g.attributes.position, index=g.index
      for(let j=0;j<(index?index.count:p.count);j+=3){
        const a=index?index.getX(j):j,b=index?index.getX(j+1):j+1,c=index?index.getX(j+2):j+2
        va.fromBufferAttribute(p,a);vb.fromBufferAttribute(p,b);vc.fromBufferAttribute(p,c)
        const area=ab.subVectors(vb,va).cross(ac.subVectors(vc,va)).length()*.5
        if(area<1e-9)continue
        total+=area;triangles.push({g,a,b,c,sum:total})
      }
    }
    const positions=new Float32Array(count*3), ns=new Float32Array(count*3)
    for(let i=0;i<count;i++){
      const target=random()*total;let low=0,high=triangles.length-1
      while(low<high){const mid=(low+high)>>1;if(triangles[mid].sum<target)low=mid+1;else high=mid}
      const {g,a,b,c}=triangles[low],p=(g.attributes.position as T.BufferAttribute).array,n=(g.attributes.normal as T.BufferAttribute).array
      const root=Math.sqrt(random()),wa=1-root,wb=root*(1-random()),wc=1-wa-wb
      for(let axis=0;axis<3;axis++){
        positions[i*3+axis]=p[a*3+axis]*wa+p[b*3+axis]*wb+p[c*3+axis]*wc
        ns[i*3+axis]=n[a*3+axis]*wa+n[b*3+axis]*wb+n[c*3+axis]*wc
      }
    }
    shapes.push(positions);normals.push(ns);parts.forEach(g=>g.dispose())
  }
  return {shapes,normals}
}
