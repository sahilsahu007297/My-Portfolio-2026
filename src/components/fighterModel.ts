import * as T from "three"

type Part = { geometry: T.BufferGeometry }

// Sampling surfaces only: these geometries never become rendered meshes.
// A modern stealth silhouette, nose +Y, dorsal +Z, with one central exhaust.
export function fighterParts(detail: 0 | 1 | 2): Part[] {
  const parts: Part[] = [], segments = [12,24,40][detail]
  const add = (geometry:T.BufferGeometry,x=0,y=0,z=0) => {
    geometry.translate(x,y,z);parts.push({geometry})
  }
  const plate = (outline:number[][],depth=.055) => {
    const path=new T.Shape()
    outline.forEach(([x,y],i)=>i?path.lineTo(x,y):path.moveTo(x,y));path.closePath()
    const geometry=new T.ExtrudeGeometry(path,{depth,bevelEnabled:true,bevelSize:.015,bevelThickness:.015,bevelSegments:detail+1,steps:1})
    geometry.translate(0,0,-depth/2);return geometry
  }
  // Lofted, faceted body: pointed radome, broad intake shoulders, tapered engine bay.
  const sections=[[2.9,.012,.012,0],[2.35,.2,.13,0],[1.55,.36,.22,0],[.7,.62,.29,0],[-.15,.72,.32,0],[-.9,.66,.3,0],[-1.55,.45,.27,0],[-2.04,.32,.25,0]]
  const vertices:number[]=[],indices:number[]=[],sides=16
  for(const [y,width,height,z] of sections)for(let j=0;j<sides;j++){
    const angle=j/sides*Math.PI*2
    vertices.push(Math.cos(angle)*width,y,z+Math.sin(angle)*height)
  }
  for(let i=0;i<sections.length-1;i++)for(let j=0;j<sides;j++){
    const a=i*sides+j,b=i*sides+(j+1)%sides,c=a+sides,d=b+sides
    indices.push(a,b,c,b,d,c)
  }
  const hull=new T.BufferGeometry();hull.setAttribute("position",new T.Float32BufferAttribute(vertices,3));hull.setIndex(indices);hull.computeVertexNormals();add(hull)
  const canopy=new T.SphereGeometry(1,segments,segments/2);canopy.scale(.25,.63,.23);add(canopy,0,1.1,.28)
  const spine=plate([[0,.64],[.2,.18],[.19,-1.35],[0,-1.66],[-.19,-1.35],[-.2,.18]],.05);add(spine,0,0,.3)
  for(const side of [-1,1]){
    // Clipped trapezoidal wings and separate aft stabilizers, without sci-fi pods.
    const wing=plate([[.49,.62],[2.47,-.58],[2.32,-1.13],[1.01,-.9],[.55,-1.27]],.07)
    wing.scale(side,1,1);add(wing,0,0,-.015)
    const stabilizer=plate([[.43,-1.27],[1.48,-1.88],[1.24,-2.4],[.45,-2.03]],.045)
    stabilizer.scale(side,1,1);add(stabilizer,0,0,.035)
    const fin=plate([[0,0],[-.45,.87],[-1.05,.75],[-1.14,0]],.04)
    fin.rotateX(Math.PI/2);fin.rotateZ(Math.PI/2);fin.rotateY(side*.38);add(fin,side*.49,-.83,.2)
    const chine=plate([[.24,1.72],[.7,.62],[.83,-.38],[.55,-.91],[.39,.42]],.05)
    chine.scale(side,1,1);add(chine,0,0,.06)
    // Angular intake lips and recessed throat surfaces.
    add(new T.BoxGeometry(.24,.62,.045),side*.59,.5,-.17)
    add(new T.BoxGeometry(.035,.64,.25),side*.72,.5,-.045)
    add(new T.BoxGeometry(.22,.055,.25),side*.6,.82,-.045)
    if(detail>0){
      const flap=plate([[1.08,-.8],[2.25,-1.03],[2.21,-1.08],[1.07,-.85]],.012)
      flap.scale(side,1,1);add(flap,0,0,.038)
      add(new T.BoxGeometry(.028,.72,.025),side*.29,-.55,.285)
    }
  }
  add(new T.CylinderGeometry(.31,.34,.38,segments,1,true),0,-2.1,0)
  for(const y of [-1.96,-2.28]){
    const rim=new T.TorusGeometry(.32,.026,8,segments);rim.rotateX(Math.PI/2);add(rim,0,y,0)
  }
  if(detail>0)for(let j=0;j<16;j++){
    const angle=j/16*Math.PI*2
    const petal=new T.BoxGeometry(.065,.27,.02);petal.rotateY(-angle+Math.PI/2)
    add(petal,Math.cos(angle)*.326,-2.12,Math.sin(angle)*.326)
  }
  return parts
}
