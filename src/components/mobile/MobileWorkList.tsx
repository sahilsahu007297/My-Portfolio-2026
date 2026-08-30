import { useNavigate } from "react-router"

type Project = {
  num: string
  title: string
  kind: string
  year: string
  blurb: string
  image: string
  top: string
  bottom: string
  action: string
  fg: string
  mutedFg: string
  actionFg: string
}

const PROJECTS: Project[] = [
  {
    num: "01",
    title: "CANACT",
    kind: "Social Connection",
    year: "2024",
    blurb:
      "A modern social platform enabling people in close proximity to discover, connect, and interact with intuitive interactions and community-driven engagement.",
    image: "photo-1738676524296-364cf18900a8",
    top: "#36353B",
    bottom: "#5C6667",
    action: "#8E9C8F",
    fg: "#DFDFD9",
    mutedFg: "#DFDFD9",
    actionFg: "#36353B",
  },
  {
    num: "02",
    title: "Meridian",
    kind: "Fintech Platform",
    year: "2024",
    blurb:
      "A next-generation fintech experience focused on helping users understand, manage, and use their money better through intelligent, action-oriented design.",
    image: "photo-1765371513276-a74f1ecbcf7d",
    top: "#5C6667",
    bottom: "#8E9C8F",
    action: "#DFDFD9",
    fg: "#DFDFD9",
    mutedFg: "#36353B",
    actionFg: "#36353B",
  },
  {
    num: "03",
    title: "LogiFlow",
    kind: "Logistics SaaS",
    year: "2024",
    blurb:
      "An India-focused enterprise logistics platform spanning 20+ operational modules across fleet, shipments, warehouses, billing, and compliance.",
    image: "photo-1690321607902-2799a1e8eaaa",
    top: "#8E9C8F",
    bottom: "#DFDFD9",
    action: "#36353B",
    fg: "#36353B",
    mutedFg: "#36353B",
    actionFg: "#DFDFD9",
  },
  {
    num: "04",
    title: "Teamio",
    kind: "HRMS Platform",
    year: "2024",
    blurb:
      "A cohesive HRMS platform that brings essential employee and workforce operations into one streamlined, scalable, and enterprise-ready system.",
    image: "photo-1653511442060-00c7b10827c4",
    top: "#DFDFD9",
    bottom: "#36353B",
    action: "#5C6667",
    fg: "#36353B",
    mutedFg: "#DFDFD9",
    actionFg: "#DFDFD9",
  },
  {
    num: "05",
    title: "NorthStar",
    kind: "BI & Finance",
    year: "2024",
    blurb:
      "An enterprise-grade financial command centre for real-time business intelligence, interactive dashboards, and executive decision-making.",
    image: "photo-1784986717568-a19e6575ad91",
    top: "#5C6667",
    bottom: "#8E9C8F",
    action: "#DFDFD9",
    fg: "#DFDFD9",
    mutedFg: "#36353B",
    actionFg: "#36353B",
  },
]

export default function MobileWorkList() {
  const navigate = useNavigate()

  return (
    <section id="projects" className="relative z-10 bg-white py-16" aria-label="Selected work">
      <div className="flex flex-col gap-8 px-4">
        {PROJECTS.map((p) => (
          <article key={p.num} className="flex flex-col gap-3">
            <div
              className="flex flex-col justify-between overflow-hidden rounded-[1.6rem] px-6 py-6 min-h-[300px]"
              style={{ backgroundColor: p.top, color: p.fg }}
            >
              <div
                className="flex items-center justify-between text-[12px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: p.fg, opacity: 0.68 }}
              >
                <span>{p.kind}</span>
                <span className="tabular-nums">
                  {p.num} / {p.year}
                </span>
              </div>
              <h3 className="text-5xl font-black uppercase leading-[0.88] tracking-[-0.03em] mt-8">
                {p.title}
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              <div
                className="flex flex-col justify-center overflow-hidden rounded-[1.6rem] px-6 py-8"
                style={{ backgroundColor: p.bottom, color: p.mutedFg }}
              >
                <p className="text-base leading-snug">
                  {p.blurb}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/projects/${p.num}`)}
                className="flex w-full h-20 items-center justify-center rounded-[1.6rem]"
                style={{ backgroundColor: p.action, color: p.actionFg }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
