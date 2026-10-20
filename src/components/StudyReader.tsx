import { useEffect, useState } from "react"
import { Link, useParams } from "react-router"
import studies from "../data/caseStudies.json"
import useBackNavigation from "./useBackNavigation"
import "./CaseStudyReader.css"

type Block = { type: "paragraph"; style: string; text: string } | { type: "table"; rows: string[][] }

export default function StudyReader() {
  const { studyId } = useParams()
  const goBack = useBackNavigation("/#case-studies")
  const study = studies.find(item => item.id === studyId || item.legacyId === studyId)
  const [content, setContent] = useState<{ id: string; blocks: Block[] } | null>(null)
  const [error, setError] = useState(false)
  const blocks = content?.id === study?.id ? content?.blocks : undefined
  useEffect(() => {
    setError(false)
    if (!study) return
    const controller = new AbortController()
    const previousTitle = document.title
    document.title = `${study.title} — Sahil Sahu`
    fetch(`/case-studies/${study.id}.json`, { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error("Study unavailable"); return response.json() })
      .then(data => { if (!controller.signal.aborted) setContent({ id: study.id, blocks: data.blocks }) })
      .catch(err => { if (err.name !== "AbortError") setError(true) })
    return () => { controller.abort(); document.title = previousTitle }
  }, [study?.id])
  const chapters = blocks?.flatMap((block, index) => block.type === "paragraph" && block.style === "Heading1"
    ? [{ title: block.text, id: `chapter-${index}` }] : []) ?? []
  const next = study ? studies[(studies.indexOf(study) + 1) % studies.length] : undefined
  return <main className="study-reader">
    <a className="reader-skip" href="#study-text">Skip to the text</a>
    <nav className="reader-nav" aria-label="Case study navigation">
      <button type="button" onClick={goBack}>← Back</button>
      <span>Sahil Sahu / Selected thinking</span>
      {study && <a className="reader-download" href={`/case-studies/${study.id}.pdf`} download={`${study.id}-sahil-sahu.pdf`}>Download PDF <span aria-hidden="true">↓</span></a>}
    </nav>
    {study ? <>
      <header className="reader-cover">
        <p className="reader-kicker">Field note / {String(studies.indexOf(study) + 1).padStart(2, "0")} · {study.category}</p>
        <h1>{study.title}</h1>
        <p className="reader-deck">{study.overview}</p>
        <div className="reader-byline"><span>Words & work by Sahil Sahu</span><span>{study.minutes} minute read</span>{study.app && <a href={study.app} target="_blank" rel="noopener noreferrer">Explore the prototype ↗</a>}</div>
      </header>
      <div className="reader-layout">
        <aside className="reader-contents">
          <details open>
            <summary>Inside this study</summary>
            <ol>{chapters.map(chapter => <li key={chapter.id}><a href={`#${chapter.id}`}>{chapter.title}</a></li>)}</ol>
          </details>
          <a className="reader-top" href="#">Back to the beginning ↑</a>
        </aside>
        <article id="study-text" className="reader-text" tabIndex={-1}>
          <p className="reader-note"><strong>A note on this study</strong>{study.note}</p>
          {error ? <p role="alert">This study could not be loaded. <button onClick={() => window.location.reload()}>Try again</button> or use the PDF above.</p> : !blocks ? <p role="status">Opening the study…</p> : blocks.map((block, index) => {
            if (block.type === "table") return <div className="reader-table" key={index} tabIndex={0} role="region" aria-label="Case study table, scroll horizontally for more columns"><table><thead><tr>{block.rows[0]?.map((cell, i) => <th key={i} scope="col">{cell}</th>)}</tr></thead><tbody>{block.rows.slice(1).map((row, r) => <tr key={r}>{row.map((cell, c) => <td key={c}>{cell}</td>)}</tr>)}</tbody></table></div>
            if (!block.text.trim()) return null
            const id = `chapter-${index}`
            if (block.style === "Heading1") return <h2 id={id} key={index}>{block.text}</h2>
            if (block.style === "Heading2") return <h3 id={id} key={index}>{block.text}</h3>
            if (block.style === "Heading3") return <h4 id={id} key={index}>{block.text}</h4>
            return <p className={block.style === "ListParagraph" ? "reader-list-item" : block.style === "Title" ? "reader-original-title" : undefined} key={index}>{block.text}</p>
          })}
          {blocks && <footer className="reader-end"><span>End of field note / Sahil Sahu</span><a href={`/case-studies/${study.id}.pdf`} download>Keep a PDF copy ↓</a></footer>}
        </article>
      </div>
      {next && <Link className="reader-next" to={`/case-studies/${next.id}`}><span>Next study →</span><h2>{next.title}</h2></Link>}
    </> : <header className="reader-cover"><h1>That chapter isn’t here.</h1><p><Link to="/#case-studies">Return to the case studies</Link></p></header>}
  </main>
}
