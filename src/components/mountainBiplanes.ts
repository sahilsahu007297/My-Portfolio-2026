import type * as Three from "three"

// A small flock cruises independently of the scroll-driven typography.
export default function mountainBiplanes(T:typeof Three, camera:Three.PerspectiveCamera, pixel:number) {
  const resources:{dispose:()=>void}[]=[]
  const parts:Three.BufferGeometry[]=[]
  const add=(g:Three.BufferGeometry,x=0,y=0,z=0)=>{g.translate(x,y,z);parts.push(g)}
  const body=new T.SphereGeometry(1,32,20);body.scale(.5,.5,2.5);add(body)
  for(const y of [-.55,.95]) {
    const wing=new T.SphereGeometry(1,40,12);wing.scale(4.4,.12,.75);add(wing,0,y,-.35)
  }
  for(const x of [-3,3])for(const z of [-.75,.15])add(new T.CylinderGeometry(.045,.045,1.5,8),x,.2,z)
  const tail=new T.SphereGeometry(1,24,12);tail.scale(1.5,.08,.5);add(tail,0,0,1.9)
  const fin=new T.SphereGeometry(1,20,12);fin.scale(.08,.75,.55);add(fin,0,.4,1.85)
  const nose=new T.CylinderGeometry(.37,.37,.25,24);nose.rotateX(Math.PI/2);add(nose,0,0,-2.35)
  const vertices:number[]=[],normals:number[]=[]
  let seed=71
  const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
  for(const source of parts){
    const g=source.index?source.toNonIndexed():source,p=g.attributes.position,n=g.attributes.normal
    for(let i=0;i<p.count;i+=3){
      const a=new T.Vector3().fromBufferAttribute(p,i),b=new T.Vector3().fromBufferAttribute(p,i+1),c=new T.Vector3().fromBufferAttribute(p,i+2)
      const area=new T.Vector3().subVectors(b,a).cross(new T.Vector3().subVectors(c,a)).length()/2
      for(let j=0;j<Math.ceil(area*110);j++){
        const u=Math.sqrt(rand()),v=rand(),wa=1-u,wb=u*(1-v),wc=u*v
        for(let axis=0;axis<3;axis++){vertices.push(p.array[i*3+axis]*wa+p.array[(i+1)*3+axis]*wb+p.array[(i+2)*3+axis]*wc);normals.push(n.array[i*3+axis]*wa+n.array[(i+1)*3+axis]*wb+n.array[(i+2)*3+axis]*wc)}
      }
    }
    if(g!==source)g.dispose();source.dispose()
  }
  const geometry=new T.BufferGeometry();geometry.setAttribute("position",new T.Float32BufferAttribute(vertices,3));geometry.setAttribute("normal",new T.Float32BufferAttribute(normals,3));resources.push(geometry)
  const material=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{alpha:{value:1},pixel:{value:pixel}},vertexShader:`uniform float pixel;varying float light;void main(){vec3 n=normalize(normalMatrix*normal);light=.35+.65*max(dot(n,normalize(vec3(-.5,.8,1.))),0.);vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(55.*pixel/max(1.,-p.z),1.,3.5);}`,fragmentShader:`uniform float alpha;varying float light;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(vec3(.55,.77,.81)*light,alpha*(1.-smoothstep(.15,.5,d)));}`});resources.push(material)
  const propGeometry=new T.BufferGeometry(),propPositions=[]
  for(let i=0;i<150;i++){const a=i/150*Math.PI*2;propPositions.push(Math.cos(a)*1.3,Math.sin(a)*1.3,-2.6)}
  propGeometry.setAttribute("position",new T.Float32BufferAttribute(propPositions,3))
  const propMaterial=new T.PointsMaterial({color:0xbce3e9,size:.045,transparent:true,opacity:.28})
  resources.push(propGeometry,propMaterial)
  const flights=Array.from({length:3},()=>{
    const aircraft=new T.Group();camera.add(aircraft)
    aircraft.add(new T.Points(geometry,material))
    const propeller=new T.Points(propGeometry,propMaterial);aircraft.add(propeller)
    return {aircraft,propeller}
  })
  const direction=new T.Vector3(),forward=new T.Vector3(0,0,-1)
  const path=(time:number,i:number)=>{
    const t=time*.72+i*2.1,depth=75+Math.sin(t*.7+i)*16
    const height=2*Math.tan(T.MathUtils.degToRad(camera.fov/2))*depth,width=height*camera.aspect
    return new T.Vector3(Math.sin(t)*width*.72,(i===1?-.26:.30)*height+Math.sin(t*1.3+i)*height*.055,-depth)
  }
  return {
    update(p:number,time:number,entry:number,reduced:boolean){
      flights.forEach(({aircraft,propeller},i)=>{
        aircraft.visible=!reduced&&entry>.9&&p<.95
        if(!aircraft.visible)return
        const position=path(time,i),ahead=path(time+.045,i)
        direction.subVectors(ahead,position).normalize()
        aircraft.position.copy(position)
        aircraft.quaternion.setFromUnitVectors(forward,direction)
        aircraft.rotateZ(Math.sin(time*.8+i)*.25)
        aircraft.scale.setScalar(i===1?.65:.8)
        propeller.rotation.z=time*23
      })
    },
    dispose(){flights.forEach(f=>camera.remove(f.aircraft));resources.forEach(r=>r.dispose())},
  }
}
