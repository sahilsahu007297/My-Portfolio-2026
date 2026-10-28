export type MapPoint={x:number;y:number}
export const waypoint=(i:number):MapPoint=>({x:Math.sin(i*1.37+.4)*300+Math.sin(i*.73)*80,y:i*540})
// Catmull–Rom keeps the direction continuous across each waypoint.
export function flightRoute(t:number):MapPoint{
  const i=Math.floor(t),u=t-i,a=waypoint(i-1),b=waypoint(i),c=waypoint(i+1),d=waypoint(i+2)
  const value=(k:"x"|"y")=>.5*((2*b[k])+(-a[k]+c[k])*u+(2*a[k]-5*b[k]+4*c[k]-d[k])*u*u+(-a[k]+3*b[k]-3*c[k]+d[k])*u*u*u)
  return{x:value("x"),y:value("y")}
}
export const MAP_TILE=768
export function makeMapTile(tx:number,ty:number){
  const canvas=document.createElement("canvas");canvas.width=canvas.height=MAP_TILE
  const ctx=canvas.getContext("2d")!,ox=tx*MAP_TILE,oy=ty*MAP_TILE
  ctx.fillStyle="#131719";ctx.fillRect(0,0,MAP_TILE,MAP_TILE);ctx.translate(-ox,-oy)
  // Local streets and built plots, on a stable world grid so tiles join seamlessly.
  const gx=Math.floor(ox/96),gy=Math.floor(oy/90)
  for(let j=gy-1;j<gy+11;j++)for(let i=gx-1;i<gx+10;i++){
    const x=i*96,y=j*90,n=Math.abs(Math.sin(i*21.27+j*63.91))
    ctx.fillStyle=n>.72?"#192420":"#191e20";ctx.fillRect(x+7,y+7,81,75)
    ctx.strokeStyle="#242b2e";ctx.lineWidth=1;ctx.strokeRect(x+10,y+10,75,69)
    if(n<.7){ctx.fillStyle="#1d2325";ctx.fillRect(x+17,y+17,24,21);ctx.fillRect(x+48,y+17,29,21);ctx.fillRect(x+17,y+46,60,23)}
  }
  ctx.strokeStyle="#30373a";ctx.lineWidth=1.4
  for(let i=gx-1;i<gx+11;i++){ctx.beginPath();ctx.moveTo(i*96,oy-1);ctx.lineTo(i*96,oy+MAP_TILE+1);ctx.stroke()}
  for(let j=gy-1;j<gy+12;j++){ctx.beginPath();ctx.moveTo(ox-1,j*90);ctx.lineTo(ox+MAP_TILE+1,j*90);ctx.stroke()}
  // A quiet watercourse gives the map a natural landmark without adding labels.
  ctx.strokeStyle="#142631";ctx.lineWidth=32;ctx.beginPath()
  for(let y=oy-40;y<oy+MAP_TILE+60;y+=12){const x=480+Math.sin(y*.0023)*180;y===oy-40?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.stroke()
  // Larger roads curve through the same space as the flight route.
  for(let j=Math.floor(oy/620)-1;j<=Math.floor((oy+MAP_TILE)/620)+1;j++){
    for(const [color,width] of [["#0d1113",13],["#394044",7],["#4b4a35",1]] as const){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath()
      for(let x=ox-20;x<=ox+MAP_TILE+20;x+=12){const y=j*620+Math.sin(x*.002+j)*135;x===ox-20?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.stroke()}
  }
  // Fine contour rings supply the relief of a radar terrain map.
  ctx.strokeStyle="#50646b35";ctx.lineWidth=.8
  for(let gy2=Math.floor(oy/700)-1;gy2<=Math.floor((oy+MAP_TILE)/700)+1;gy2++)for(let gx2=Math.floor(ox/650)-1;gx2<=Math.floor((ox+MAP_TILE)/650)+1;gx2++){
    const cx=gx2*650+200,cy=gy2*700+330
    for(let r=35;r<230;r+=21){ctx.beginPath();for(let j=0;j<=100;j++){const a=j/100*Math.PI*2,rr=r*(1+.14*Math.sin(a*3+gx2)+.07*Math.cos(a*5+gy2)),x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr*.7;j?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}
  }
  return canvas
}
