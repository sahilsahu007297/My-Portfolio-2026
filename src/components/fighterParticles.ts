// Shared by the final assembly and map. Only the aircraft is generated.
let cached: Promise<Float32Array> | undefined
export function getFighterParticles() {
  return cached ??= import("./fighterModel").then(({fighterParts})=>{
    const parts=fighterParts(1),triangles:{p:ArrayLike<number>;a:number;b:number;c:number;area:number}[]=[]
    let area=0,seed=9127
    const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
    for(const {geometry:g} of parts){const p=g.attributes.position.array,idx=g.index
      for(let j=0;j<(idx?.count??p.length/3);j+=3){const a=(idx?idx.getX(j):j)*3,b=(idx?idx.getX(j+1):j+1)*3,c=(idx?idx.getX(j+2):j+2)*3
        const x=p[b]-p[a],y=p[b+1]-p[a+1],z=p[b+2]-p[a+2],u=p[c]-p[a],v=p[c+1]-p[a+1],w=p[c+2]-p[a+2]
        area+=Math.hypot(y*w-z*v,z*u-x*w,x*v-y*u)/2;triangles.push({p,a,b,c,area})
      }
    }
    const out=new Float32Array(6000*3)
    for(let i=0;i<6000;i++){const target=random()*area;let lo=0,hi=triangles.length-1
      while(lo<hi){const mid=(lo+hi)>>1;if(triangles[mid].area<target)lo=mid+1;else hi=mid}
      const {p,a,b,c}=triangles[lo],r=Math.sqrt(random()),s=random()
      for(let k=0;k<3;k++)out[i*3+k]=p[a+k]*(1-r)+p[b+k]*r*s+p[c+k]*r*(1-s)
    }
    parts.forEach(({geometry})=>geometry.dispose());return out
  })
}
