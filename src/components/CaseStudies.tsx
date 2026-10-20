import { Link } from "react-router"
import type { CSSProperties } from "react"
import studyCollection from "../data/caseStudies.json"
import "./CaseStudies.css"

export const caseStudies = studyCollection

export default function CaseStudies() {
  return <section id="case-studies" className="case-studies">
    <div className="case-studies__eyebrow"><span><i aria-hidden="true" /> Beyond the finished screen</span><span>Field notes / 01&ndash;05</span></div>
    <div className="case-studies__heading"><h2>Here are some<br />case studies<span>.</span></h2><p>Problems I explored. Ideas I questioned.<br />A closer look at the thinking behind the work.</p></div>
    <div className="case-studies__list">{caseStudies.map((study,index) => <Link key={study.id} to={`/case-studies/${study.id}`} className="case-study-row" style={{ "--study-color": study.color } as CSSProperties} data-cursor-hover>
      <span className="case-study-row__number">/0{index + 1}</span>
      <span className="case-study-row__figure" aria-hidden="true">
        <svg viewBox="0 0 160 100" fill="none">
          {Array.from({length:7},(_,i)=>index===0
            ? <ellipse key={i} cx="80" cy="50" rx={12+i*8} ry={8+i*5} transform={`rotate(${i*8-24} 80 50)`}/>
            : index===1
              ? <path key={i} d={`M10 ${23+i*8} C45 ${-16+i*8} 60 ${105-i*4} 92 ${50+i*3} S130 ${12+i*8} 151 ${27+i*8}`}/>
              : <rect key={i} x={49-i*3} y={19+i*3} width="62" height="62" transform={`rotate(${i*9-27} 80 50)`}/>)}
          <circle className="case-study-row__point" cx="80" cy="50" r="3"/>
        </svg>
      </span>
      <span className="case-study-row__title"><small>{study.category}</small>{study.title}</span>
      <span className="case-study-row__status"><span>{study.minutes} min read</span><small>Read the study / Download PDF</small></span>
      <span className="case-study-row__arrow" aria-hidden="true">&#8599;</span>
    </Link>)}</div>
    <div className="case-studies__closing"><p className="case-studies__note">Five studies. From the first question to the next decision.<br/>Open a chapter, or take a copy with you.</p><span aria-hidden="true">Observe. Question. Discover.</span></div>
  </section>
}
