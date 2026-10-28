import * as T from "three"
type V=[number,number,number]
type Part={g:T.BufferGeometry;kind:number;weight:number}
export type WorkScene={positions:Float32Array;normals:Float32Array;kinds:Float32Array}

// Original physical workplace miniatures. Closed surfaces, real thickness and
// purpose-built furniture replace the old flat symbols. Generated once on entry.
export function storyParticles():WorkScene[]{
  const scenes:WorkScene[]=[]
  for(let scene=0;scene<6;scene++){
    const parts:Part[]=[]
    const add=(g:T.BufferGeometry,x:number,y:number,z:number,kind=1,weight=1)=>{g.translate(x,y,z);parts.push({g,kind,weight})}
    const box=(x:number,y:number,z:number,w:number,h:number,d:number,kind=1,weight=1)=>add(new T.BoxGeometry(w,h,d),x,y,z,kind,weight)
    const ellipsoid=(x:number,y:number,z:number,rx:number,ry:number,rz:number,kind=0)=>{const g=new T.SphereGeometry(1,16,12);g.scale(rx,ry,rz);add(g,x,y,z,kind,1)}
    const rod=(a:V,b:V,r=.028,kind=1,weight=1.4)=>{const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start),g=new T.CylinderGeometry(r,r,delta.length(),8,1);g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize()));const c=start.add(end).multiplyScalar(.5);add(g,c.x,c.y,c.z,kind,weight)}
    const rim=(x:number,y:number,z:number,w:number,h:number,kind=2)=>{rod([x-w/2,y-h/2,z],[x+w/2,y-h/2,z],.012,kind,2);rod([x+w/2,y-h/2,z],[x+w/2,y+h/2,z],.012,kind,2);rod([x+w/2,y+h/2,z],[x-w/2,y+h/2,z],.012,kind,2);rod([x-w/2,y+h/2,z],[x-w/2,y-h/2,z],.012,kind,2)}
    const chair=(x:number,z:number,turn=0)=>{
      box(x,-.98,z,.46,.10,.43);box(x,-.62,z-.19,.46,.65,.07)
      rod([x,-1,z],[x,-1.5,z],.04);for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const dx=Math.cos(a+turn)*.28,dz=Math.sin(a+turn)*.28;rod([x,-1.5,z],[x+dx,-1.52,z+dz],.023);ellipsoid(x+dx,-1.54,z+dz,.06,.045,.04,1)}
    }
    const person=(x:number,z:number,scale=1,seated=false,gesture: "rest"|"point"|"type"|"talk"="rest",facing=1)=>{
      const baseY=seated?-.30:0
      const p=(a:number,b:number,c=0):V=>[x+a*scale*facing,b*scale+baseY,z+c*scale]
      const head=p(0,1.03);ellipsoid(...head,.175*scale,.23*scale,.18*scale)
      const neck=p(0,.77);rod(neck,p(0,.64),.06*scale,0)
      const chest=p(0,.34);ellipsoid(...chest,.23*scale,.37*scale,.13*scale)
      const hip=p(0,-.12);ellipsoid(...hip,.18*scale,.16*scale,.12*scale)
      for(const side of [-1,1]){
        const shoulder=p(side*.2,.56),elbow=p(side*.31,.11,.01),hand=p(side*.31,-.18,.06)
        if(side===1&&gesture==="point"){elbow.splice(0,3,...p(.5,.47,.02));hand.splice(0,3,...p(.85,.62,.02))}
        if(gesture==="type"){elbow.splice(0,3,...p(side*.31,.15,.16));hand.splice(0,3,...p(side*.25,.10,.43))}
        if(gesture==="talk"&&side===1){elbow.splice(0,3,...p(.4,.35,.15));hand.splice(0,3,...p(.54,.55,.22))}
        rod(shoulder,elbow,.065*scale,0);rod(elbow,hand,.047*scale,0);ellipsoid(...hand,.05*scale,.075*scale,.035*scale)
        const knee=seated?p(side*.15,-.54,.35):p(side*.17,-.76,.02),ankle=seated?p(side*.16,-1.18,.38):p(side*.2,-1.45,.04)
        rod(p(side*.12,-.19),knee,.085*scale,0);rod(knee,ankle,.06*scale,0);ellipsoid(ankle[0],ankle[1]-.02,ankle[2]+.07,.08*scale,.05*scale,.16*scale)
      }
      // Collar, jacket seam and cuffs make the silhouette read as a person.
      rod(p(-.14,.6,.12),p(0,.38,.15),.012*scale,2);rod(p(.14,.6,.12),p(0,.38,.15),.012*scale,2)
    }
    const desk=(x:number,z:number,w=2,d=.85,y=-.30)=>{
      box(x,y,z,w,.10,d,1,.6);box(x,y-.08,z,w-.06,.025,d-.06,2,.5)
      for(const dx of [-w*.43,w*.43])for(const dz of [-d*.36,d*.36]){rod([x+dx,y-.08,z+dz],[x+dx,-1.55,z+dz],.033);box(x+dx,-1.55,z+dz,.14,.025,.13)}
      rod([x-w*.43,-1.25,z-d*.36],[x+w*.43,-1.25,z-d*.36],.025)
    }
    const monitor=(x:number,y:number,z:number,w=.95,h=.65)=>{
      box(x,y,z,w,h,.075,1,.7);box(x,y,z+.043,w-.065,h-.065,.012,2,.22);rim(x,y,z+.06,w-.04,h-.04)
      rod([x,y-h/2,z],[x,y-h/2-.28,z],.035);box(x,y-h/2-.28,z,.36,.035,.24)
      rim(x-w*.26,y,z+.065,w*.25,h*.7,1)
      for(let j=0;j<3;j++){box(x+w*.14,y+h*.25-j*h*.22,z+.065,w*.42,.035,.012,2,2)}
      for(let j=0;j<4;j++)box(x-w*.08+j*w*.12,y-h*.28,z+.065,.045,.04+j*.023,.012,2,2)
    }
    const keyboard=(x:number,y:number,z:number,w=.7)=>{box(x,y,z,w,.035,.24);for(let row=0;row<4;row++)for(let col=0;col<11;col++)box(x-w*.45+col*w*.09,y+.025,z-.09+row*.05,w*.065,.012,.032,2,2)}
    const notebook=(x:number,y:number,z:number)=>{box(x,y,z,.32,.025,.4,1,.6);for(let i=0;i<7;i++)rod([x-.12,y+.02,z-.14+i*.045],[x+.12,y+.02,z-.14+i*.045],.006,2,2)}
    const board=(x:number,y:number,z:number,w=1.65,h=1.15)=>{
      box(x,y,z,w,h,.08,1,.6);rim(x,y,z+.05,w,h)
      for(const dx of [-w*.4,w*.4]){rod([x+dx,y-h/2,z],[x+dx,-1.55,z-.12],.033);rod([x+dx,-1.55,z-.12],[x+dx,-1.55,z+.3],.035)}
      box(x,y-h/2-.035,z+.08,w,.035,.14)
    }
    if(scene===0){person(0,0,1,false,"talk");}
    if(scene===1){
      desk(.20,.15,2.5,1.0,-.38);person(-1.45,.15,.92,false,"talk");chair(.1,-.48);person(.1,-.46,.86,true,"type");chair(1.12,-.48);person(1.12,-.46,.86,true,"talk",-1)
      notebook(-.45,-.30,.25);notebook(.7,-.30,.3);box(.20,-.30,.2,.5,.025,.32,2)
      board(-.55,.6,-.85,1.2,.85);for(let j=0;j<3;j++){rim(-.9+j*.35,.7,-.8,.25,.35);rod([-.99+j*.35,.38,-.79],[-.8+j*.35,.38,-.79],.012,2)}
    }
    if(scene===2){
      desk(.2,.2,2.9,1.05);chair(-1.32,.48);person(-1.32,.48,.91,true,"type")
      monitor(.45,.48,-.04,1.25,.85);monitor(1.43,.48,-.16,.55,.9);keyboard(.25,-.225,.52,.8);ellipsoid(.88,-.21,.5,.075,.035,.10,1)
      notebook(-.5,-.22,.35);rod([-1,-.25,-.05],[-1,.65,-.05],.025);rod([-1,.65,-.05],[-.7,.8,.0],.025);ellipsoid(-.68,.76,.0,.14,.06,.10,1)
      for(let j=0;j<3;j++)box(.5,-.45-j*.05,-.25,.5,.025,.36,1)
    }
    if(scene===3){
      board(.2,.42,-.25,2.65,1.5);person(-1.7,.15,.96,false,"point");person(1.8,.25,.78,false,"rest",-1)
      for(let col=0;col<3;col++){
        const x=-.66+col*.85;box(x,1,-.19,.55,.045,.012,2,3)
        if(col<2)rod([x+.4,.95,-.19],[x+.4,-.23,-.19],.009,1)
        for(let row=0;row<3;row++){const y=.72-row*.32;box(x,y,-.18,.66,.23,.022,1,.3);rim(x,y,-.16,.66,.23,1);box(x-.18,y+.04,-.14,.2,.018,.009,2,3);box(x,y-.05,-.14,.48,.012,.009,2,3)}
      }
      desk(.1,.83,1.7,.48,-.7);notebook(-.35,-.62,.83)
    }
    if(scene===4){
      desk(0,.16,2.4,1.1);chair(-1.35,.30);person(-1.35,.3,.9,true,"point");chair(1.35,.3);person(1.35,.3,.9,true,"type",-1)
      monitor(-.25,.40,-.13,.9,.68);keyboard(-.25,-.23,.45,.66)
      box(.72,.13,.37,.40,.7,.07,1);box(.72,.13,.415,.34,.62,.009,2,.4);rim(.72,.13,.43,.34,.62)
      for(let j=0;j<3;j++)box(.72,.30-j*.15,.44,.25,.06,.008,2,2)
      rod([.72,-.23,.28],[.72,-.14,.36],.025);box(.72,-.23,.3,.45,.025,.22);notebook(.3,-.23,.5)
      box(-.9,-.23,-.1,.18,.08,.12);ellipsoid(-.9,-.18,-.05,.025,.025,.015,2)
    }
    if(scene===5){
      desk(.1,.18,2.65,1.25,-.42);person(-1.5,.2,.95,false,"point");person(1.5,-.2,.90,false,"talk",-1)
      box(0,-.35,.2,1.55,.015,.85,2,.25)
      for(let col=0;col<3;col++)for(let row=0;row<2;row++){
        const x=-.48+col*.47,z=-.02+row*.39;box(x,-.33,z,.32,.012,.27,1,.4)
        rod([x-.12,-.31,z-.09],[x+.12,-.31,z-.09],.009,2,3);rod([x-.12,-.31,z],[x+.06,-.31,z],.009,2,3)
      }
      board(.1,.58,-.80,1.65,.8);for(let j=0;j<5;j++){box(-.5+j*.30,.4+j*.06,-.74,.14,.2+j*.10,.02,2,.8)}
      notebook(.93,-.34,.4);keyboard(-.82,-.34,-.1,.4)
    }
    // A single scene camera: slight elevation and depth, with all parts grounded.
    for(const part of parts){part.g.rotateY(-.25);part.g.rotateX(.16);part.g.computeVertexNormals()}
    const triangles:{part:Part;a:number;b:number;c:number;sum:number}[]=[];let total=0,seed=7301
    const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
    const a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),u=new T.Vector3(),v=new T.Vector3()
    for(const part of parts){const p=part.g.getAttribute("position"),idx=part.g.index
      for(let j=0;j<(idx?.count??p.count);j+=3){const ai=idx?idx.getX(j):j,bi=idx?idx.getX(j+1):j+1,ci=idx?idx.getX(j+2):j+2;a.fromBufferAttribute(p,ai);b.fromBufferAttribute(p,bi);c.fromBufferAttribute(p,ci);total+=u.subVectors(b,a).cross(v.subVectors(c,a)).length()*.5*part.weight;triangles.push({part,a:ai,b:bi,c:ci,sum:total})}
    }
    const count=9600,positions=new Float32Array(count*3),normals=new Float32Array(count*3),kinds=new Float32Array(count)
    for(let i=0;i<count;i++){const target=random()*total;let lo=0,hi=triangles.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(triangles[mid].sum<target)lo=mid+1;else hi=mid}
      const tri=triangles[lo],p=tri.part.g.getAttribute("position").array,n=tri.part.g.getAttribute("normal").array,r=Math.sqrt(random()),s=random(),wa=1-r,wb=r*s,wc=r*(1-s)
      for(let k=0;k<3;k++){positions[i*3+k]=p[tri.a*3+k]*wa+p[tri.b*3+k]*wb+p[tri.c*3+k]*wc;normals[i*3+k]=n[tri.a*3+k]*wa+n[tri.b*3+k]*wb+n[tri.c*3+k]*wc}kinds[i]=tri.part.kind
    }
    parts.forEach(part=>part.g.dispose());scenes.push({positions,normals,kinds})
  }
  return scenes
}
