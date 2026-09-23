import * as T from "three"

// Sample complete, closed model surfaces by triangle area, retaining true normals.
export function particleShapes(count: number) {
  const shapes: Float32Array[] = [], normals: Float32Array[] = []
  let seed = 9173
  const random = () => { seed = (Math.imul(1664525, seed)+1013904223)>>>0; return seed/4294967296 }
  const sphere = (r:number) => new T.SphereGeometry(r,48,32)
  const ring = (r:number,t:number) => new T.TorusGeometry(r,t,16,80)
  const turned = (profile:number[][]) => new T.LatheGeometry(profile.map(([y,r])=>new T.Vector2(r,y)),80)
  for (let shape=0;shape<11;shape++) {
    const parts:T.BufferGeometry[]=[]
    const add=(g:T.BufferGeometry,x=0,y=0,z=0,rx=0,ry=0,rz=0) => {
      g.rotateX(rx);g.rotateY(ry);g.rotateZ(rz);g.translate(x,y,z);parts.push(g)
    }
    if(shape===0) add(sphere(1.5))
    if(shape===1) {
      add(ring(.98,.15),-.3,.35)
      add(new T.CylinderGeometry(.14,.17,1.5,24),.85,-.85,0,0,0,Math.PI/4)
      add(sphere(.17),1.38,-1.38)
      // A shallow convex lens gives the magnifier a filled, dimensional center.
      const lens=sphere(.86);lens.scale(1,1,.1);add(lens,-.3,.35)
    }
    if(shape===2) {
      add(turned([[-1.65,0],[-1.65,.83],[-1.58,.9],[-1.45,.9],[-1.37,.82],[-1.32,.65],[-1.22,.65],[-1.15,.72],[-1.06,.68],[-.94,.49],[-.7,.36],[-.3,.25],[.05,.26],[.28,.36],[.36,.48],[.46,.51],[.56,.45],[.63,.26],[.76,.22],[.8,0]]))
      add(sphere(.51),0,1.08)
    }
    if(shape===3) {
      add(sphere(1.25))
      for(let j=-2;j<=2;j++){const lat=j*Math.PI/6;add(ring(1.28*Math.cos(lat),.025),0,1.28*Math.sin(lat),0,Math.PI/2)}
      add(ring(1.3,.035));add(ring(1.3,.035),0,0,0,0,Math.PI/2)
      add(ring(1.47,.065),0,0,0,0,0,-.3)
      add(new T.CylinderGeometry(.15,.2,.45,24),0,-1.6)
      add(new T.CylinderGeometry(.62,.72,.13,48),0,-1.89)
    }
    if(shape===4){add(ring(.82,.23),-.63);add(ring(.82,.23),.63,0,0,Math.PI/2)}
    if(shape===5){
      add(new T.CylinderGeometry(.54,1.3,.65,8,1,false),0,.8,0,0,.2)
      add(new T.ConeGeometry(1.3,1.9,8,1,false),0,-.47,0,Math.PI, .2)
    }
    if(shape===6){
      add(new T.CylinderGeometry(1.4,1.4,.16,80),0,0,-.13,Math.PI/2)
      add(ring(1.43,.09));add(ring(1.2,.02),0,0,.02)
      for(let j=0;j<12;j++){const a=j*Math.PI/6;add(new T.BoxGeometry(.025,.13,.035),Math.sin(a)*1.29,Math.cos(a)*1.29,.015,0,0,-a)}
      const needle=new T.Shape();needle.moveTo(0,1.08);needle.lineTo(.26,0);needle.lineTo(0,-1.08);needle.lineTo(-.26,0);needle.closePath()
      add(new T.ExtrudeGeometry(needle,{depth:.08,bevelEnabled:true,bevelSize:.02,bevelThickness:.02,bevelSegments:2,steps:1}),0,0,.02,0,0,-.3)
      add(sphere(.1),0,0,.15)
    }
    if(shape===7) add(new T.BoxGeometry(2.25,2.25,2.25,12,12,12),0,0,0,.22,.55)
    if(shape===8){
      add(new T.CylinderGeometry(.28,.28,2.7,6),0,-.1)
      add(new T.ConeGeometry(.28,.68,6),0,1.59)
      add(new T.CylinderGeometry(.29,.29,.18,32),0,-1.48)
      add(new T.CylinderGeometry(.28,.28,.27,24),0,-1.7)
      parts.forEach(p=>p.rotateZ(-.4))
    }
    if(shape===9){
      add(turned([[-1.28,0],[-1.28,.39],[-1.1,.48],[-.8,.5],[.8,.5],[1,.48],[1.2,.43],[1.4,.33],[1.6,.18],[1.75,0]]))
      add(new T.CylinderGeometry(.33,.4,.24,48),0,-1.37)
      const fin=new T.Shape();fin.moveTo(.38,-.4);fin.lineTo(1.02,-1.15);fin.lineTo(1.02,-1.55);fin.lineTo(.4,-1.15);fin.closePath()
      for(let j=0;j<4;j++) add(new T.ExtrudeGeometry(fin,{depth:.1,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2,steps:1}),0,0,0,0,j*Math.PI/2+.3)
      add(ring(.2,.05),0,.42,.495)
      add(new T.CircleGeometry(.17,32),0,.42,.52)
      add(ring(.49,.025),0,-.65,0,Math.PI/2)
    }
    if(shape===10){
      add(turned([[-1.4,0],[-1.4,.72],[-1.2,.72],[-.95,.64],[-.6,.4],[-.15,.1],[.15,.1],[.6,.4],[.95,.64],[1.2,.72],[1.4,.72],[1.4,0]]))
      for(const y of [-1.5,1.5]) add(new T.CylinderGeometry(.93,.93,.18,64),0,y)
      for(let j=0;j<4;j++){const a=j*Math.PI/2+Math.PI/4;add(new T.CylinderGeometry(.055,.055,2.9,16),.81*Math.cos(a),0,.81*Math.sin(a))}
    }
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
      const {g,a,b,c}=triangles[low],p=g.attributes.position,n=g.attributes.normal
      const root=Math.sqrt(random()),wa=1-root,wb=root*(1-random()),wc=1-wa-wb
      for(let axis=0;axis<3;axis++){
        const get=(attr:T.BufferAttribute|T.InterleavedBufferAttribute,j:number)=>axis===0?attr.getX(j):axis===1?attr.getY(j):attr.getZ(j)
        positions[i*3+axis]=get(p,a)*wa+get(p,b)*wb+get(p,c)*wc
        ns[i*3+axis]=get(n,a)*wa+get(n,b)*wb+get(n,c)*wc
      }
    }
    shapes.push(positions);normals.push(ns);parts.forEach(g=>g.dispose())
  }
  return {shapes,normals}
}
