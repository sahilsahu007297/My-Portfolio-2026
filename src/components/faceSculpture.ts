import * as T from "three"
import sampleFittedFace, { insideFittedFace, joinFittedFace } from "./fittedFace"

/** A full procedural head, sculpted against Sahil's front, tilted and profile references.
 * The facial surface is fitted to 478 inferred landmarks; the photo supplies particle color.
 * The reference views guide the volume; this is an authored model, not a photogrammetry scan.
 */
export default function faceSculpture(photo: ImageData, count: number) {
  const positions: number[] = [], colors: number[] = [], normals: number[] = [], seeds: number[] = []
  const gauss = (x: number, y: number, cx: number, cy: number, sx: number, sy: number) => Math.exp(-Math.pow((x-cx)/sx,2)-Math.pow((y-cy)/sy,2))
  // Cross-sections measured visually from the supplied views: a broad crown,
  // fuller cheeks, a squared beard/jaw, and a rounded chin (not an ellipsoid).
  const sections = [
    [-2.10,0,.0],[-1.98,.54,.54],[-1.74,.91,.87],[-1.35,1.15,1.04],
    [-.85,1.34,1.16],[-.25,1.43,1.23],[.4,1.46,1.28],[1.0,1.52,1.31],
    [1.55,1.46,1.28],[1.95,1.16,1.05],[2.25,.65,.62],[2.40,0,0],
  ]
  const sectionAt = (y: number) => {
    let i=0;while(i<sections.length-2 && y>sections[i+1][0])i++
    const a=sections[i],b=sections[i+1],before=sections[Math.max(0,i-1)],after=sections[Math.min(sections.length-1,i+2)]
    const span=b[0]-a[0],t=Math.max(0,Math.min(1,(y-a[0])/span)),t2=t*t,t3=t2*t
    return [1,2].map(axis=>{
      const m0=(b[axis]-before[axis])/(b[0]-before[0])*span
      const m1=(after[axis]-a[axis])/(after[0]-a[0])*span
      return Math.max(0,(2*t3-3*t2+1)*a[axis]+(t3-2*t2+t)*m0+(-2*t3+3*t2)*b[axis]+(t3-t2)*m1)
    })
  }
  const surface = (v: number, angle: number) => {
    const y = .15 + v * 2.25, [width,depth] = sectionAt(y)
    const x = Math.sin(angle)*width
    const cosine=Math.cos(angle), front=Math.max(0,cosine)
    // A flatter facial plane and deeper cranium match the side-view silhouette.
    let z=cosine>=0 ? Math.pow(cosine,.58)*depth : cosine*depth*1.13-.12
    if (front > 0) {
      const features =
        .34 * gauss(x,y,0,.02,.20,.65) + // bridge
        .61 * gauss(x,y,0,-.48,.28,.23) + // rounded nose tip
        .13 * gauss(x,y,-.28,-.49,.16,.14) + .13 * gauss(x,y,.28,-.49,.16,.14) -
        .19 * gauss(x,y,-.59,.14,.36,.24) - .19 * gauss(x,y,.59,.14,.36,.24) + // sockets
        .12 * gauss(x,y,-.63,.44,.43,.15) + .12 * gauss(x,y,.63,.44,.43,.15) + // brows
        .19 * gauss(x,y,-.78,-.35,.40,.35) + .19 * gauss(x,y,.78,-.35,.40,.35) + // cheeks
        .17 * gauss(x,y,0,-.93,.53,.10) + .15 * gauss(x,y,0,-1.07,.48,.10) -
        .07 * gauss(x,y,0,-1,.46,.035) + .29 * gauss(x,y,0,-1.62,.66,.29)
      z += features * Math.pow(front, 3)
      const hairline=1.05+.23*Math.exp(-Math.pow((x-.45)/.65,2))
      if(y>hairline)z+=(.08+.045*Math.sin(x*17+y*10))*front
      z-=.065*gauss(x,y,-.16,-.61,.085,.05)+.065*gauss(x,y,.16,-.61,.085,.05)
    }
    const point=new T.Vector3(x,y,z)
    return front>0 ? joinFittedFace(point) : point
  }
  const add = (point: T.Vector3, normal: T.Vector3, light: number, seed: number) => {
    positions.push(point.x,point.y,point.z); normals.push(normal.x,normal.y,normal.z)
    const c = new T.Color().setRGB(light*.86, light*.94, light, T.SRGBColorSpace)
    colors.push(c.r,c.g,c.b); seeds.push(seed)
  }
  for (let i=0;i<count;i++) {
    const v = -1 + 2*(i+.5)/count, angle = i*2.39996323
    const point = surface(v,angle)
    if(Math.cos(angle)>0 && insideFittedFace(point.x,point.y))continue
    const tangent = surface(v,angle+.001).sub(surface(v,angle-.001))
    const vertical = surface(Math.min(.99999,v+.0001),angle).sub(surface(Math.max(-.99999,v-.0001),angle))
    const normal = tangent.cross(vertical).normalize()
    const front = Math.max(0,Math.cos(angle))
    let light = point.y > .95 ? .29 : point.y < -.7 ? .34 : .48
    if (front > .2) {
      // Actual face crop: hairline through chin, with no neck, clothes or shoulders.
      const px=Math.max(0,Math.min(photo.width-1,Math.round((.489+point.x/1.64*.165)*photo.width)))
      const py=Math.max(0,Math.min(photo.height-1,Math.round((.188+(2.4-point.y)/4.5*.363)*photo.height)))
      const k=(py*photo.width+px)*4
      const l=(photo.data[k]*.2126+photo.data[k+1]*.7152+photo.data[k+2]*.0722)/255
      const photoLight=.20+Math.pow(l,.72)*.87
      const weight=Math.max(0,Math.min(1,(front-.2)/.5));light+= (photoLight-light)*weight
    }
    point.x+=Math.sin(i*127.1)*.005;point.y+=Math.sin(i*311.7)*.005
    add(point,normal,light,(i*.6180339)%1)
  }
  sampleFittedFace(photo, Math.round(count*.72), add)
  // Ears: a curved pinna, recessed concha, helix rim and lobule in real depth.
  for(const side of [-1,1]) {
    for(let i=0;i<2600;i++) {
      const v=-1+2*(i+.5)/2600,a=i*2.39996323,r=Math.sqrt(1-v*v)
      const x=side*(1.39+.24*r*Math.cos(a)), y=-.24+v*.52
      const z=.10+.25*r*Math.sin(a)-.07*Math.exp(-v*v*8)
      add(new T.Vector3(x,y,z),new T.Vector3(side*r*Math.cos(a),v,r*Math.sin(a)).normalize(),.47+(Math.sin(a)*.07),(i*.618)%1)
    }
    for(let i=0;i<700;i++) {
      const a=i/700*Math.PI*2
      add(new T.Vector3(side*(1.43+.17*Math.cos(a)),-.22+.46*Math.sin(a),.27),new T.Vector3(side*.6,0,.8),.55,(i*.618)%1)
    }
  }
  // Swept strand groups add a raised, asymmetric quiff and a textured side profile.
  for(let strand=0;strand<160;strand++) {
    for(let j=0;j<48;j++) {
      const t=j/47, y=1.05+Math.sin(t*Math.PI*.88)*1.17+Math.sin(strand*1.71)*.045
      const angle=-1.45+strand/160*2.9+t*.45
      const point=surface(Math.min(.995,(y-.15)/2.25),angle)
      point.z+=.035;point.y+=.025
      const light=.34+.1*Math.sin(strand*.7+t*4)
      add(point,new T.Vector3(point.x*.25,.5,1).normalize(),light,(strand*.618+j*.31)%1)
    }
  }
  // Solid depth for the distinctive glasses frames, including bridge and temples.
  for (let side=-1;side<=1;side+=2) {
    for(let i=0;i<1100;i++) {
      const a=i/1100*Math.PI*2, c=Math.cos(a), s=Math.sin(a)
      const x=side*.62 + Math.sign(c)*Math.pow(Math.abs(c),.62)*.54
      const y=.09+Math.sign(s)*Math.pow(Math.abs(s),.72)*.31
      const z=1.15-.16*Math.abs(x)+Math.sin(i*2.4)*.012
      add(new T.Vector3(x,y,z),new T.Vector3(0,0,1),.50,(i*.618)%1)
    }
    for(let i=0;i<180;i++) {
      const t=i/180
      add(new T.Vector3(side*(1.15+t*.22),.18-t*.05,1.0-t*.55),new T.Vector3(side,0,1).normalize(),.54,t)
    }
  }
  for(let i=0;i<220;i++){const t=i/220;add(new T.Vector3((t-.5)*.2,.17+Math.sin(t*Math.PI)*.035,1.3),new T.Vector3(0,0,1),.50,t)}
  const geometry=new T.BufferGeometry()
  geometry.setAttribute("position",new T.Float32BufferAttribute(positions,3))
  geometry.setAttribute("normal",new T.Float32BufferAttribute(normals,3))
  geometry.setAttribute("color",new T.Float32BufferAttribute(colors,3))
  geometry.setAttribute("seed",new T.Float32BufferAttribute(seeds,1))
  return geometry
}
