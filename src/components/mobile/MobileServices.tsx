import { useRef } from "react"

type Service = {
  num: string
  color: string
  fg: string
  title: string
  intro: string
}

const SERVICES: Service[] = [
  {
    num: "01",
    color: "#524646",
    fg: "#FCF2E5",
    title: "I Design",
    intro:
      "Turning problems into purposeful products — from research, flows and UI to design systems and high-fidelity, accessible interfaces people understand, enjoy and return to.",
  },
  {
    num: "02",
    color: "#A8A492",
    fg: "#111111",
    title: "I Build",
    intro:
      "Taking ideas beyond the canvas — front-end implementation, interactive prototypes, motion and component thinking that turn design decisions into functional experiences.",
  },
  {
    num: "03",
    color: "#FCF2E5",
    fg: "#111111",
    title: "I Improve",
    intro:
      "Designing for what happens after users arrive — activation, conversion and retention, experimentation and journey optimization. Experiences that don't just work, they grow.",
  },
  {
    num: "04",
    color: "#524646",
    fg: "#FCF2E5",
    title: "I Strategize",
    intro:
      "Connecting user needs, business goals and product direction — problem framing, positioning, journey mapping and roadmaps. Deciding why it deserves to exist before building it.",
  },
  {
    num: "05",
    color: "#A8A492",
    fg: "#111111",
    title: "I Design Systems",
    intro:
      "Designing the structure behind the experience — design systems, information architecture, tokens and scalable patterns. Consistency across products without killing flexibility.",
  },
]

export default function MobileServices() {
  const wrapperRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={wrapperRef} className="relative z-10 bg-black px-4 py-16 flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        {SERVICES.map((s) => (
          <div key={s.num} className="flex flex-col rounded-[1.75rem] overflow-hidden" style={{ background: s.color, color: s.fg }}>
            <div className="p-8">
              <span className="font-['Impact',sans-serif] text-[11rem] leading-none opacity-30">{s.num}</span>
              <h3 className="font-['Impact',sans-serif] text-5xl tracking-normal mt-2">
                {s.title}
              </h3>
              <p className="mt-4 text-lg font-medium leading-snug" style={{ color: s.fg, opacity: 0.9 }}>
                {s.intro}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
