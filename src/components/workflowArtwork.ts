export type WorkflowTimeline = { index: number; local: number; finale: number }
export type ModelArtwork = { image: HTMLImageElement; points: [number,number,number][] }
const cache=new Map<string,Promise<ModelArtwork>>()
export function loadModelArtwork(name:string){
  let promise=cache.get(name)
  if(!promise){
    promise=Promise.all([
      new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.decoding="async";image.onload=()=>resolve(image);image.onerror=reject;image.src=`/workflow-models/${name}.webp`}),
      fetch(`/workflow-models/${name}.points.json`).then(async response=>{if(!response.ok)throw new Error("Missing model particles");return response.json() as Promise<{points:[number,number,number][]}>}),
    ]).then(([image,data])=>({image,points:data.points})).catch(error=>{cache.delete(name);throw error})
    cache.set(name,promise)
    if(cache.size>3)cache.delete(cache.keys().next().value!)
  }
  return promise
}
export const clamp=(n:number)=>Math.max(0,Math.min(1,n))
export const smooth=(start:number,end:number,value:number)=>{const p=clamp((value-start)/(end-start));return p*p*(3-2*p)}
export function contain(image:HTMLImageElement,w:number,h:number){const scale=Math.min(w/image.naturalWidth,h/image.naturalHeight);const width=image.naturalWidth*scale,height=image.naturalHeight*scale;return{x:(w-width)/2,y:(h-height)/2,width,height}}
export function lightSprite(){const cv=document.createElement("canvas");cv.width=cv.height=24;const ctx=cv.getContext("2d")!,g=ctx.createRadialGradient(12,12,0,12,12,12);g.addColorStop(0,"#fff");g.addColorStop(.22,"#ebfcff");g.addColorStop(.42,"#80d8ffb0");g.addColorStop(1,"#279cff00");ctx.fillStyle=g;ctx.fillRect(0,0,24,24);return cv}
