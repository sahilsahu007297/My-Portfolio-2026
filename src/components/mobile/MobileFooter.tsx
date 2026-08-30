import { useEffect, useRef, useState } from "react"

// Closing footer: a near-black slab that answers the white work list above.
// A big "let's talk" lockup, a rotating asterisk that nods to the hero mark, a
// scrolling contact marquee, tidy link columns and an oversized name wordmark.
// The live IST clock from the header reappears so the page closes on the same
// detail it opened with.

const LINKS = {
  menu: [
    { label: "Work", href: "#work" },
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Resume", href: "#resume" },
  ],
  social: [
    { label: "LinkedIn", href: "https://linkedin.com" },
    { label: "Dribbble", href: "https://dribbble.com" },
    { label: "GitHub", href: "https://github.com" },
    { label: "Instagram", href: "https://instagram.com" },
  ],
}

const EMAIL = "sahusahil500@gmail.com"

function FooterMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <rect
          key={i}
          x="42"
          y="6"
          width="16"
          height="88"
          rx="8"
          fill="#DFDFD9"
          transform={`rotate(${i * 30} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="10" fill="#0e0e10" />
    </svg>
  )
}

function formatIndiaTime(date = new Date()) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(date)
}

export default function MobileFooter() {
  const [indiaTime, setIndiaTime] = useState(() => formatIndiaTime())

  useEffect(() => {
    const timer = window.setInterval(() => setIndiaTime(formatIndiaTime()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const year = new Date().getFullYear()

  const toTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" })

  return (
    <footer
      id="contact"
      className="relative z-10 overflow-hidden bg-[#0e0e10] text-[#f5f4f0] snap-start"
      aria-label="Footer"
    >
      {/* Big call-to-action lockup */}
      <div className="px-6 pt-16 md:px-12 md:pt-24">
        <div className="flex items-start gap-4 md:gap-7">
          <FooterMark className="footer-mark mt-2 h-10 w-10 shrink-0 md:mt-4 md:h-16 md:w-16" />
          <div>
            <p className="max-w-xl text-[13px] font-medium uppercase tracking-[0.22em] text-white/45">
            </p>
            <h2 className="mt-4 text-[clamp(2.6rem,10vw,9rem)] font-semibold leading-[0.9] tracking-[-0.04em]">
              Let&rsquo;s make
              <br />
              <span className="text-[#DFDFD9]">something good.</span>
            </h2>
          </div>
        </div>

        <a
          href={`mailto:${EMAIL}`}
          data-cursor-hover
          className="group mt-10 inline-flex items-center gap-4 rounded-full border border-white/15 py-3 pl-6 pr-3 text-lg font-medium tracking-tight transition-colors hover:border-[#DFDFD9] md:mt-14 md:text-xl"
        >
          {EMAIL}
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DFDFD9] text-[#0e0e10] transition-transform duration-300 group-hover:rotate-45 md:h-11 md:w-11">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M7 17L17 7" />
              <path d="M8 7h9v9" />
            </svg>
          </span>
        </a>
      </div>

      {/* Scrolling contact marquee */}
      <div className="mt-16 overflow-hidden border-y border-white/10 py-4 md:mt-24">
        <div className="marquee-track mq-x">
          {[0, 1].map((copy) => (
            <span
              key={copy}
              className="flex items-center whitespace-nowrap text-[13px] font-medium uppercase tracking-[0.2em] text-white/40"
              aria-hidden={copy === 1}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="flex items-center">
                  <span className="px-6">Open to work</span>
                  <span className="text-[#DFDFD9]">✦</span>
                  <span className="px-6">Design &amp; Development</span>
                  <span className="text-[#DFDFD9]">✦</span>
                  <span className="px-6">Say hello</span>
                  <span className="text-[#DFDFD9]">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* Link columns */}
      <div className="grid grid-cols-2 gap-8 px-6 py-14 md:grid-cols-4 md:px-12 md:py-16">
        <div className="col-span-2 md:col-span-2">
          <p className="text-[13px] font-medium uppercase tracking-[0.22em] text-white/45">
            Based in India
          </p>
          <p className="mt-3 max-w-sm text-base leading-relaxed text-white/70 md:text-lg">
            Designing and building considered digital products — working with
            teams and founders who care about the details.
          </p>
          <div className="mt-5 flex items-center gap-2 text-sm tabular-nums text-white/55">
            <FooterMark className="h-3.5 w-3.5" />
            <time>{indiaTime} IST</time>
          </div>
        </div>

        <nav aria-label="Site">
          <p className="text-[13px] font-medium uppercase tracking-[0.22em] text-white/45">
            Menu
          </p>
          <ul className="mt-4 space-y-2.5">
            {LINKS.menu.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  data-cursor-hover
                  className="inline-block text-lg tracking-tight text-white/80 transition-colors hover:text-[#DFDFD9]"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Social">
          <p className="text-[13px] font-medium uppercase tracking-[0.22em] text-white/45">
            Elsewhere
          </p>
          <ul className="mt-4 space-y-2.5">
            {LINKS.social.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor-hover
                  className="inline-block text-lg tracking-tight text-white/80 transition-colors hover:text-[#DFDFD9]"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Oversized name wordmark */}
      <div className="px-6 md:px-12">
        <h3 className="select-none text-[clamp(3.5rem,20vw,18rem)] font-semibold leading-[0.8] tracking-[-0.05em] text-white/[0.08]">
          Sahil Sahu
        </h3>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col gap-4 border-t border-white/10 px-6 py-6 text-[13px] text-white/45 md:flex-row md:items-center md:justify-between md:px-12">
        <span>© {year} Sahil Sahu — All rights reserved.</span>
        <span className="hidden md:inline">Built with care.</span>
        <button
          type="button"
          data-cursor-hover
          onClick={toTop}
          className="inline-flex items-center gap-2 self-start tracking-tight text-white/70 transition-colors hover:text-[#DFDFD9] md:self-auto"
        >
          Back to top
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 19V5" />
            <path d="M6 11l6-6 6 6" />
          </svg>
        </button>
      </div>
    </footer>
  )
}
