import * as T from "three"
import fitted from "./faceLandmarks.json"

// Generated offline from the user's portrait. No model download or inference at runtime.
const toPoint = ([u,v,z]: number[]) => new T.Vector3((u-.489)*1.64/.165, 2.4-(v-.188)*4.5/.363, 1.1-z*1.64/.165)
const vertices = fitted.landmarks.map(toPoint)
const outline = fitted.oval.map(i => vertices[i])

// Join the sculpted scalp/temples to the measured facial boundary without a mask seam.
export function joinFittedFace(point: T.Vector3) {
  let distance=Infinity, depth=point.z
  for(let i=0;i<outline.length;i++) {
    const a=outline[i],b=outline[(i+1)%outline.length],dx=b.x-a.x,dy=b.y-a.y
    const t=Math.max(0,Math.min(1,((point.x-a.x)*dx+(point.y-a.y)*dy)/(dx*dx+dy*dy)))
    const d=Math.hypot(point.x-a.x-dx*t,point.y-a.y-dy*t)
    if(d<distance){distance=d;depth=a.z+(b.z-a.z)*t}
  }
  const t=Math.min(1,distance/.65),blend=t*t*(3-2*t)
  point.z=depth+(point.z-depth)*blend
  return point
}

export function insideFittedFace(x: number, y: number) {
  let inside=false
  for(let i=0,j=outline.length-1;i<outline.length;j=i++) {
    const a=outline[i],b=outline[j]
    if((a.y>y)!==(b.y>y) && x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside
  }
  return inside
}

type AddPoint = (p:T.Vector3,n:T.Vector3,light:number,seed:number)=>void
export default function sampleFittedFace(photo: ImageData, count: number, add: AddPoint) {
  const mesh=new T.BufferGeometry()
  mesh.setAttribute("position",new T.Float32BufferAttribute(vertices.flatMap(p=>[p.x,p.y,p.z]),3))
  const indices=[...fitted.triangles]
  const areas:number[]=[]
  const ab=new T.Vector3(),ac=new T.Vector3()
  let total=0
  for(let i=0;i<indices.length;i+=3) {
    const a=vertices[indices[i]],b=vertices[indices[i+1]],c=vertices[indices[i+2]]
    const cross=ab.subVectors(b,a).cross(ac.subVectors(c,a))
    if(cross.z<0)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]]
    const area=cross.length()*.5;areas.push(area);total+=area
  }
  mesh.setIndex(indices);mesh.computeVertexNormals()
  const normal=mesh.getAttribute("normal")
  let seed=7319
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
  for(let i=0;i<areas.length;i++) {
    const ia=indices[i*3],ib=indices[i*3+1],ic=indices[i*3+2]
    const a=vertices[ia],b=vertices[ib],c=vertices[ic]
    const na=new T.Vector3().fromBufferAttribute(normal,ia),nb=new T.Vector3().fromBufferAttribute(normal,ib),nc=new T.Vector3().fromBufferAttribute(normal,ic)
    const samples=Math.round(count*areas[i]/total)
    for(let j=0;j<samples;j++) {
      const root=Math.sqrt(random()),wa=1-root,wb=root*(1-random()),wc=1-wa-wb
      const point=new T.Vector3().addScaledVector(a,wa).addScaledVector(b,wb).addScaledVector(c,wc)
      const n=new T.Vector3().addScaledVector(na,wa).addScaledVector(nb,wb).addScaledVector(nc,wc).normalize()
      const uv=fitted.landmarks[ia].map((v,k)=>v*wa+fitted.landmarks[ib][k]*wb+fitted.landmarks[ic][k]*wc)
      const x=Math.max(0,Math.min(photo.width-1,Math.round(uv[0]*photo.width))),y=Math.max(0,Math.min(photo.height-1,Math.round(uv[1]*photo.height)))
      const pixel=(y*photo.width+x)*4,l=(photo.data[pixel]*.2126+photo.data[pixel+1]*.7152+photo.data[pixel+2]*.0722)/255
      add(point,n,.16+Math.pow(l,.8)*.88,random())
    }
  }
  // Small curved eye surfaces fill the openings in the landmark tessellation.
  for(const id of [468,473]) {
    const center=vertices[id]
    for(let i=0;i<700;i++) {
      const a=random()*Math.PI*2,r=Math.sqrt(random())*.085
      add(new T.Vector3(center.x+Math.cos(a)*r,center.y+Math.sin(a)*r*.7,center.z+.025*Math.sqrt(1-r/.085)),new T.Vector3(0,0,1),r<.04?.17:.33,random())
    }
  }
  mesh.dispose()
}
