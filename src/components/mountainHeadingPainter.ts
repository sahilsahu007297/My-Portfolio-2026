// Draw the existing DOM typography into a viewport-sized surface. Keeping the
// backing surface bounded avoids compositor texture clipping at very large zoom.
export default function mountainHeadingPainter(container:HTMLElement, headings:HTMLElement[]) {
  const canvas=document.createElement("canvas"),ctx=canvas.getContext("2d")
  if(!ctx)return null
  canvas.className="flight-heading-canvas";canvas.setAttribute("aria-hidden","true")
  container.appendChild(canvas)
  type Glyph={text:string;x:number;y:number;width:number;ascent:number;descent:number;font:string;color:string}
  let layouts:{width:number;height:number;glyphs:Glyph[]}[]=[],width=0,height=0,dpr=1,disposed=false
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
      const layout={width:box.width,height:box.height,glyphs};heading.style.transform=transform;return layout
    })
    container.classList.add("has-heading-canvas")
  }
  measure()
  return {
    measure,
    clear(){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height)},
    draw(index:number,scale:number,opacity:number){
      const layout=layouts[index];if(!layout||opacity<=0)return
      const left=(width-layout.width*scale)/2,top=(height-layout.height*scale)/2
      ctx.setTransform(dpr*scale,0,0,dpr*scale,dpr*left,dpr*top)
      ctx.globalAlpha=opacity;ctx.textBaseline="alphabetic";ctx.textAlign="left"
      for(const glyph of layout.glyphs){
        const x=left+glyph.x*scale,y=top+glyph.y*scale
        if(x+glyph.width*scale<0||x>width||y+glyph.descent*scale<0||y-glyph.ascent*scale>height)continue
        ctx.font=glyph.font;ctx.fillStyle=glyph.color
        ctx.fillText(glyph.text,glyph.x,glyph.y)
      }
      ctx.globalAlpha=1
    },
    dispose(){disposed=true;canvas.remove();container.classList.remove("has-heading-canvas")},
  }
}
