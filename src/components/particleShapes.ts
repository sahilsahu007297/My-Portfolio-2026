import * as T from "three"

// Sample complete, closed model surfaces by triangle area, retaining true normals.
export function particleShapes(count: number) {
  const shapes: Float32Array[] = [], normals: Float32Array[] = []
  let seed = 9173
  const random = () => { seed = (Math.imul(1664525, seed)+1013904223)>>>0; return seed/4294967296 }
  const sphere = (r:number) => new T.SphereGeometry(r,48,32)
  const ring = (r:number,t:number) => new T.TorusGeometry(r,t,16,80)
  const turned = (profile:number[][]) => new T.LatheGeometry(profile.map(([y,r])=>new T.Vector2(r,y)),80)
  for (let shape=0;shape<12;shape++) {
    const parts:T.BufferGeometry[]=[]
    const add=(g:T.BufferGeometry,x=0,y=0,z=0,rx=0,ry=0,rz=0) => {
      g.rotateX(rx);g.rotateY(ry);g.rotateZ(rz);g.translate(x,y,z);parts.push(g)
    }
    if(shape===0) add(sphere(1.5))
    const panel=(outline:number[][],depth=.09)=>{
      const path=new T.Shape();outline.forEach(([x,y],i)=>i?path.lineTo(x,y):path.moveTo(x,y));path.closePath()
      const g=new T.ExtrudeGeometry(path,{depth,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2,steps:1});g.translate(0,0,-depth/2);return g
    }
    const wing=(side:number,scale=1)=>{const g=panel([[.22,1.35],[2.85,-.95],[2.25,-1.25],[1.35,-.85],[.45,-1.3]],.075);g.scale(side*scale,scale,scale);return g}
    const engine=(x:number,y=0,scale=1)=>{
      const g=new T.CylinderGeometry(.23,.3,1.7,48,8,true);g.scale(scale,scale,scale);add(g,x,y,-.10)
      add(ring(.25*scale,.045*scale),x,y-.85*scale,-.1,Math.PI/2)
      for(let j=0;j<12;j++)add(new T.BoxGeometry(.035*scale,.35*scale,.12*scale),x+Math.cos(j*Math.PI/6)*.15*scale,y-.75*scale,-.1+Math.sin(j*Math.PI/6)*.15*scale,0,j*Math.PI/6,.2)
    }
    const blendedWing=(side:number)=>{
      const path=new T.Shape();path.moveTo(0,2.65)
      path.bezierCurveTo(.38,1.8,.48,1.05,1.05,.58)
      path.bezierCurveTo(1.65,.05,2.55,-.65,3.12,-1.18)
      path.lineTo(2.58,-1.36);path.lineTo(1.82,-1.05);path.lineTo(1.08,-1.45);path.lineTo(.42,-1.55);path.lineTo(0,-1.35);path.closePath()
      const g=new T.ExtrudeGeometry(path,{depth:.1,bevelEnabled:true,bevelSize:.075,bevelThickness:.065,bevelSegments:3,curveSegments:28,steps:1})
      g.translate(0,0,-.05);g.scale(side,1,1);return g
    }
    const jet=()=>{
      add(panel([[0,2.5],[.38,1.15],[.62,.25],[.62,-1.4],[.26,-1.7],[0,-1.42],[-.26,-1.7],[-.62,-1.4],[-.62,.25],[-.38,1.15]],.24))
      add(blendedWing(1));add(blendedWing(-1));engine(-.32,-.5,.65);engine(.32,-.5,.65)
      const canopy=sphere(1);canopy.scale(.17,.82,.15);add(canopy,0,.9,.23)
      for(const side of [-1,1]) {
        add(panel([[side*.42,-.65],[side*1.38,-1.55],[side*.75,-1.72],[side*.38,-1.35]],.07))
        add(panel([[0,0],[.1,.4],[.52,-.06],[.45,-.45]],.045),side*.5,-.95,.10,0,side*.95,side*.13)
        add(new T.BoxGeometry(.19,.58,.14),side*.38,.05,.12)
        for(let j=0;j<5;j++)add(new T.BoxGeometry(.012,.14,.015),side*(.7+j*.23),-.38-j*.12,.065)
      }
    }
    if(shape===1){add(wing(1,.7),-.8,.1);add(wing(-1,.7),.8,.1)}
    if(shape===2){const g=panel([[0,1.8],[.8,-1.5],[0,-.95],[-.8,-1.5]],.24);add(g)}
    if(shape===3){engine(0,0,1.5);for(let j=0;j<5;j++)add(ring(.52,.025),0,-.8+j*.4,0,Math.PI/2)}
    if(shape===4){engine(-.7);engine(.7);add(new T.BoxGeometry(1.7,.16,.12))}
    if(shape===5){const g=sphere(1);g.scale(.6,1.7,.45);add(g);add(ring(.65,.04),0,-.7,0,Math.PI/2)}
    if(shape===6){add(wing(1,.85),-.3);add(wing(-1,.85),.3)}
    if(shape===7){jet();parts.forEach(g=>g.scale(.7,.7,.7))}
    if(shape===8){const g=sphere(1);g.scale(.75,1.5,.48);add(g);for(const x of [-.65,.65])add(new T.BoxGeometry(.06,2.4,.08),x,-.1)}
    if(shape===9){jet();parts.forEach(g=>g.scale(.75,.75,.75))}
    if(shape===10){engine(0,0,1.6);add(ring(.8,.06),0,-1.35,0,Math.PI/2)}
    if(shape===11)jet()
    parts.forEach(g=>{g.rotateX(-.48);g.rotateY(-.22);g.computeVertexNormals()})
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
