// Draw the existing DOM typography into a viewport-sized surface. Keeping the
// backing surface bounded avoids compositor texture clipping at very large zoom.
export default function mountainHeadingPainter(container:HTMLElement, headings:HTMLElement[]) {
  const canvas=document.createElement("canvas"),ctx=canvas.getContext("2d")
  if(!ctx)return null
  canvas.className="flight-heading-canvas";canvas.setAttribute("aria-hidden","true")
  container.appendChild(canvas)
  type Glyph={text:string;x:number;y:number;width:number;ascent:number;descent:number;font:string;color:string}
  let layouts:{width:number;height:number;glyphs:Glyph[];cloth:HTMLCanvasElement}[]=[],width=0,height=0,dpr=1,disposed=false
  const measure=()=>{
    if(disposed)return
    width=container.clientWidth;height=container.clientHeight;dpr=Math.min(devicePixelRatio,1.5)
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr)
    layouts=headings.map(heading=>{
      const transform=heading.style.transform;heading.style.transform="none"
      const box=heading.getBoundingClientRect(),glyphs:Glyph[]=[]
      for(const element of heading.querySelectorAll<HTMLElement>("h2,p")){
        const style=getComputedStyle(element),font=`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
        ctx.font=font
        const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT)
        while(walker.nextNode()){
          const node=walker.currentNode,text=node.textContent??"",range=document.createRange()
          for(let index=0;index<text.length;){
            const char=String.fromCodePoint(text.codePointAt(index)!),end=index+char.length
            range.setStart(node,index);range.setEnd(node,end)
            const rect=range.getBoundingClientRect(),metrics=ctx.measureText(char)
            const ascent=metrics.fontBoundingBoxAscent??parseFloat(style.fontSize)*.9
            const descent=metrics.fontBoundingBoxDescent??parseFloat(style.fontSize)*.25
            if(char.trim())glyphs.push({text:char,x:rect.left-box.left,y:rect.top-box.top+ascent,width:rect.width,ascent,descent,font,color:style.color})
            index=end
          }
        }
      }
      const cloth=document.createElement("canvas")
      cloth.width=Math.ceil((box.width+40)*dpr);cloth.height=Math.ceil((box.height+48)*dpr)
      const ink=cloth.getContext("2d")!
      ink.scale(dpr,dpr)
      const silk=ink.createLinearGradient(0,0,0,box.height+48)
      silk.addColorStop(0,"#385360");silk.addColorStop(.45,"#182e3b");silk.addColorStop(1,"#0c1b27")
      ink.fillStyle=silk;ink.fillRect(0,0,box.width+40,box.height+48)
      ink.strokeStyle="#9cc3cc88";ink.strokeRect(5,5,box.width+30,box.height+38)
      ink.textBaseline="alphabetic"
      for(const glyph of glyphs){ink.font=glyph.font;ink.fillStyle=glyph.color;ink.fillText(glyph.text,glyph.x+20,glyph.y+24)}
      const layout={width:box.width,height:box.height,glyphs,cloth};heading.style.transform=transform;return layout
    })
    container.classList.add("has-heading-canvas")
  }
  measure()
  return {
    measure,
    clear(){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height)},
    draw(index:number,scale:number,opacity:number,anchorX=width/2,anchorY=height/2,time=0,reduced=false){
      const layout=layouts[index];if(!layout||opacity<=0)return
      const w=layout.width+40,h=layout.height+48
      const left=anchorX-w/2,top=anchorY-h/2
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.globalAlpha=opacity
      // The entire printed cloth deforms together, with tension at the tow edge.
      for(let x=0;x<w;x+=3){
        const loose=1-x/w
        const wave=reduced?0:Math.sin(x*.023-time*4.5)*loose*5+Math.sin(x*.045-time*6)*loose*1.5
        const strip=Math.min(3,w-x)
        ctx.drawImage(layout.cloth,x*dpr,0,strip*dpr,layout.cloth.height,left+x,top+wave,strip+.35,h)
        ctx.fillStyle=`rgba(190,225,235,${reduced?0:(Math.sin(x*.023-time*4.5)+1)*.025})`
        ctx.fillRect(left+x,top+wave,strip,h)
      }
      const unit=Math.min(1,width/1100),tailX=left+w+60*unit,tailY=anchorY-8*unit
      ctx.strokeStyle="#b9dbe1aa";ctx.lineWidth=.8
      ctx.beginPath();ctx.moveTo(left+w,top+8);ctx.quadraticCurveTo(left+w+30*unit,anchorY+4,tailX,tailY)
      ctx.moveTo(left+w,top+h-8);ctx.quadraticCurveTo(left+w+30*unit,anchorY+12,tailX,tailY);ctx.stroke()
      ctx.save();ctx.translate(tailX,tailY);ctx.scale(unit,unit)
      ctx.rotate(reduced?0:Math.sin(time*1.7+index)*.025)
      ctx.shadowColor="#abd9e8";ctx.shadowBlur=9
      const metal=ctx.createLinearGradient(0,-40,0,30);metal.addColorStop(0,"#b9d7de");metal.addColorStop(.4,"#587785");metal.addColorStop(1,"#172f3c")
      ctx.fillStyle=metal;ctx.strokeStyle="#bbdae5";ctx.lineWidth=1
      const shape=(points:number[][])=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();ctx.stroke()}
      // Two wings, interplane struts, tail, open cockpit and spinning propeller.
      shape([[0,0],[-8,-22],[6,-24],[20,-5],[84,-9],[104,-2],[101,9],[20,8]])
      shape([[29,-30],[86,-32],[99,-25],[29,-22]])
      shape([[23,14],[91,12],[104,19],[28,23]])
      ctx.shadowBlur=0;ctx.beginPath();ctx.moveTo(40,-23);ctx.lineTo(47,15);ctx.lineTo(75,-25);ctx.lineTo(83,15);ctx.moveTo(40,-23);ctx.lineTo(83,15);ctx.stroke()
      ctx.fillStyle="#07131f";ctx.beginPath();ctx.ellipse(62,-8,10,5,0,0,Math.PI*2);ctx.fill()
      ctx.strokeStyle="#c4e8ef88";ctx.beginPath();ctx.ellipse(107,0,3,reduced?26:26+Math.sin(time*65)*5,0,0,Math.PI*2);ctx.stroke()
      ctx.beginPath();ctx.moveTo(64,21);ctx.lineTo(69,30);ctx.stroke();ctx.fillStyle="#78939f";ctx.beginPath();ctx.arc(70,31,4,0,Math.PI*2);ctx.fill()
      ctx.restore();ctx.globalAlpha=1
    },
    dispose(){disposed=true;canvas.remove();container.classList.remove("has-heading-canvas")},
  }
}
