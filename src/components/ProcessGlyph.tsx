export default function ProcessGlyph({ index }: { index: number }) {
  return <svg className={`process-glyph process-glyph--${index}`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
    {index===0 ? <>{[0,1,2].map(i=><ellipse pathLength="1" key={i} cx="50" cy="50" rx="35" ry="16" transform={`rotate(${i*60} 50 50)`}/>)}<circle pathLength="1" cx="50" cy="50" r="3" fill="currentColor"/></> :
      index===1 ? <>{[0,1,2,3].map(i=><rect pathLength="1" key={i} x={18+i*7} y={18+i*7} width={64-i*14} height={64-i*14} rx="3" transform={`rotate(${i*12} 50 50)`}/>)}</> :
      index===2 ? <>{[0,1,2].map(i=><path pathLength="1" key={i} d={`M18 ${35+i*15} L50 ${17+i*15} L82 ${35+i*15} L50 ${53+i*15} Z`}/>)}</> :
      <>{[0,1,2,3,4,5].map(i=><ellipse pathLength="1" key={i} cx="50" cy="32" rx="10" ry="23" transform={`rotate(${i*60} 50 50)`}/>)}</>}
  </svg>
}
