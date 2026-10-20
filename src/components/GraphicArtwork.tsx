import { useId } from "react"

export const graphicStudies = [
  { id: "feel", name: "Form follows feeling", kind: "Poster / typography", tag: "01", color: "#e75034" },
  { id: "orbit", name: "A different orbit", kind: "Art / experiment", tag: "02", color: "#d5ef64" },
  { id: "grow", name: "Room to grow", kind: "Identity / visual study", tag: "03", color: "#d3c4ed" },
]

export default function GraphicArtwork({ variant }: { variant: string }) {
  const id = useId().replace(/:/g, "")
  return <svg viewBox="0 0 600 800" className="graphic-artwork" aria-hidden="true">
    <defs><radialGradient id={`${id}-metal`} cx="30%" cy="20%" r="85%"><stop stopColor="#fff"/><stop offset=".2" stopColor="#cbd5bb"/><stop offset=".43" stopColor="#314333"/><stop offset=".56" stopColor="#dce7ce"/><stop offset=".7" stopColor="#91a082"/><stop offset="1" stopColor="#162b1d"/></radialGradient></defs>
    <rect width="600" height="800" fill={variant === "feel" ? "#e75034" : variant === "orbit" ? "#d5ef64" : "#d3c4ed"}/>
    <g fill={variant === "feel" ? "#f4e9d5" : "#203027"} fontFamily="Arial,sans-serif">
      <text x="35" y="44" fontSize="12" letterSpacing="2">SAHIL SAHU / VISUAL STUDY</text><text x="560" y="44" textAnchor="end" fontSize="12">{variant === "feel" ? "01" : variant === "orbit" ? "02" : "03"}</text>
      <path d="M35 64H565" stroke={variant === "feel" ? "#f4e9d5" : "#203027"} opacity=".3"/>
      {variant === "feel" ? <>
        <text x="25" y="212" fontWeight="900" fontSize="162" letterSpacing="-12">FEEL</text><text x="33" y="263" fontSize="21" letterSpacing="8">BEFORE YOU EXPLAIN.</text>
        <g transform="translate(300 485)">{Array.from({length:28},(_,i)=><ellipse key={i} rx={205-i*5.5} ry={165-i*3.3} fill="none" stroke="#f4e9d5" strokeWidth="2.2" transform={`rotate(${i*6})`}/>)}<circle r="26" fill="#233d31"/></g>
        <text x="35" y="733" fontSize="12" letterSpacing="2">FORM IS A LANGUAGE.</text><text x="35" y="755" fontSize="12" letterSpacing="2">FEELING IS THE MESSAGE.</text><path d="M490 719h65v40m-65 0 65-40" fill="none" stroke="#f4e9d5" strokeWidth="3"/>
      </> : variant === "orbit" ? <>
        <text x="32" y="165" fontFamily="Georgia,serif" fontStyle="italic" fontSize="94" letterSpacing="-5">a different</text><text x="24" y="297" fontWeight="900" fontSize="148" letterSpacing="-11">ORBIT.</text>
        <g transform="translate(300 493) rotate(-28)"><ellipse rx="190" ry="143" fill={`url(#${id}-metal)`}/><ellipse rx="108" ry="66" fill="#d5ef64"/><ellipse rx="237" ry="83" fill="none" stroke="#24352b" strokeWidth="1.2" transform="rotate(40)"/><circle cx="-199" cy="-84" r="17" fill="#233d31"/></g>
        <text x="35" y="741" fontSize="12" letterSpacing="2">IDEAS DON'T TRAVEL</text><text x="35" y="763" fontSize="12" letterSpacing="2">IN STRAIGHT LINES.</text><text x="548" y="759" textAnchor="end" fontSize="35">↗</text>
      </> : <>
        <text x="35" y="125" fontSize="13" letterSpacing="3">AN IDENTITY WITH</text><text x="30" y="224" fontFamily="Georgia,serif" fontSize="99" letterSpacing="-6">room to grow.</text>
        <g transform="translate(300 446)">{Array.from({length:8},(_,i)=><ellipse key={i} cx="0" cy="-89" rx="50" ry="114" fill={i%2 ? "#20392f" : "#eeeadd"} transform={`rotate(${i*45})`}/>)}<circle r="45" fill="#d3c4ed"/></g>
        <path d="M35 694H565" stroke="#203027" opacity=".35"/><text x="35" y="743" fontSize="14" letterSpacing="2">SMALL BEGINNINGS.</text><text x="35" y="766" fontSize="14" letterSpacing="2">BIG POSSIBILITIES.</text><text x="560" y="760" fontWeight="700" fontSize="40" textAnchor="end">g.</text>
      </>}
    </g>
  </svg>
}
