// A small incompressible fluid field: advect velocity and dye, solve pressure,
// then project the flow. The cursor injects momentum, not a painted ribbon.
export default function fluidCursor() {
  const canvas = document.getElementById("fluid") as HTMLCanvasElement | null
  const ctx = canvas?.getContext("2d", { alpha: true })
  if (!canvas || !ctx) return () => {}
  const reduced = matchMedia("(prefers-reduced-motion: reduce)")
  let width=0, height=0, size=0, frame=0, last=0, activeUntil=0
  let vx=new Float32Array(), vy=new Float32Array(), dye=new Float32Array()
  let tx=new Float32Array(), ty=new Float32Array(), td=new Float32Array()
  let pressure=new Float32Array(), nextPressure=new Float32Array(), divergence=new Float32Array(), curl=new Float32Array()
  let pixels: ImageData
  let previous: {x:number;y:number;time:number}|null=null
  const resize=()=>{
    height=100; width=Math.max(60,Math.min(240,Math.round(height*innerWidth/innerHeight)))
    size=width*height;canvas.width=width;canvas.height=height
    vx=new Float32Array(size);vy=new Float32Array(size);dye=new Float32Array(size)
    tx=new Float32Array(size);ty=new Float32Array(size);td=new Float32Array(size)
    pressure=new Float32Array(size);nextPressure=new Float32Array(size);divergence=new Float32Array(size);curl=new Float32Array(size)
    pixels=ctx.createImageData(width,height)
  }
  const sample=(field:Float32Array,x:number,y:number)=>{
    x=Math.max(.5,Math.min(width-1.5,x));y=Math.max(.5,Math.min(height-1.5,y))
    const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,i=iy*width+ix
    return (field[i]*(1-fx)+field[i+1]*fx)*(1-fy)+(field[i+width]*(1-fx)+field[i+width+1]*fx)*fy
  }
  const render=(time:number)=>{
    frame=0
    if(document.hidden||reduced.matches)return
    const dt=Math.min((time-(last||time-16))/1000,.025);last=time
    // Semi-Lagrangian velocity advection remains stable at irregular frame rates.
    for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
      const i=y*width+x,px=x-vx[i]*dt,py=y-vy[i]*dt
      tx[i]=sample(vx,px,py)*.992;ty[i]=sample(vy,px,py)*.992
    }
    ;[vx,tx]=[tx,vx];[vy,ty]=[ty,vy]
    for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
      const i=y*width+x
      curl[i]=(vy[i+1]-vy[i-1]-vx[i+width]+vx[i-width])*.5
    }
    // Vorticity confinement preserves small rolling eddies behind the pointer.
    for(let y=2;y<height-2;y++)for(let x=2;x<width-2;x++){
      const i=y*width+x,gx=Math.abs(curl[i+1])-Math.abs(curl[i-1]),gy=Math.abs(curl[i+width])-Math.abs(curl[i-width])
      const length=Math.hypot(gx,gy)+.0001
      vx[i]+=gy/length*curl[i]*dt*9;vy[i]-=gx/length*curl[i]*dt*9
    }
    for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
      const i=y*width+x;divergence[i]=(vx[i+1]-vx[i-1]+vy[i+width]-vy[i-width])*.5;pressure[i]=0
    }
    for(let pass=0;pass<14;pass++){
      for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
        const i=y*width+x;nextPressure[i]=(pressure[i-1]+pressure[i+1]+pressure[i-width]+pressure[i+width]-divergence[i])*.25
      }
      ;[pressure,nextPressure]=[nextPressure,pressure]
    }
    for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
      const i=y*width+x;vx[i]-=(pressure[i+1]-pressure[i-1])*.5;vy[i]-=(pressure[i+width]-pressure[i-width])*.5
    }
    const fade=Math.exp(-dt*1.65)
    for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
      const i=y*width+x;td[i]=sample(dye,x-vx[i]*dt,y-vy[i]*dt)*fade
    }
    ;[dye,td]=[td,dye]
    for(let i=0;i<size;i++){
      pixels.data[i*4]=225;pixels.data[i*4+1]=225;pixels.data[i*4+2]=225
      pixels.data[i*4+3]=Math.min(.3,1-Math.exp(-dye[i]*.22))*255
    }
    ctx.putImageData(pixels,0,0)
    if(time<activeUntil)frame=requestAnimationFrame(render)
    else ctx.clearRect(0,0,width,height)
  }
  const move=(event:PointerEvent)=>{
    if(event.pointerType!=="mouse"||reduced.matches)return
    const time=performance.now(),x=event.clientX/innerWidth*width,y=event.clientY/innerHeight*height
    const old=previous&&time-previous.time<100?previous:{x,y,time}
    const dx=Math.max(-12,Math.min(12,x-old.x)),dy=Math.max(-12,Math.min(12,y-old.y))
    const steps=Math.min(12,Math.max(1,Math.ceil(Math.hypot(dx,dy))))
    for(let step=1;step<=steps;step++){
      const px=old.x+dx*step/steps,py=old.y+dy*step/steps
      for(let yy=Math.max(1,Math.floor(py-5));yy<Math.min(height-1,py+5);yy++)for(let xx=Math.max(1,Math.floor(px-5));xx<Math.min(width-1,px+5);xx++){
        const i=yy*width+xx,weight=Math.exp(-((xx-px)**2+(yy-py)**2)/3.5)
        vx[i]+=dx*weight*22/steps;vy[i]+=dy*weight*22/steps;dye[i]=Math.min(5,dye[i]+weight*.65/steps)
      }
    }
    previous={x,y,time};activeUntil=time+3500
    if(!frame){last=0;frame=requestAnimationFrame(render)}
  }
  const reset=()=>{cancelAnimationFrame(frame);frame=0;previous=null;vx.fill(0);vy.fill(0);dye.fill(0);ctx.clearRect(0,0,width,height)}
  resize();window.addEventListener("resize",resize);window.addEventListener("pointermove",move,{passive:true})
  document.addEventListener("visibilitychange",reset);reduced.addEventListener("change",reset)
  return()=>{reset();window.removeEventListener("resize",resize);window.removeEventListener("pointermove",move);document.removeEventListener("visibilitychange",reset);reduced.removeEventListener("change",reset)}
}
