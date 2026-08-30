import { useEffect, useState } from "react"
import resumePdf from "../assets/Sahil-Sahu-Resume.pdf"

interface ResumeModalProps {
  onClose: () => void
}

/** Faithful, responsive adaptation of the supplied Figma resume card. */
export default function ResumeModal({ onClose }: ResumeModalProps) {
  const [showViewer, setShowViewer] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/35 p-5 backdrop-blur-sm md:p-8"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className={`resume-modal relative w-full max-w-[796px] overflow-hidden bg-white shadow-2xl transition-all duration-300 ${
          showViewer ? "h-[85vh] max-w-[1000px]" : ""
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-heading"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          data-cursor-hover
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full text-xl leading-none text-[#3f472c] transition-colors hover:bg-[#e3f5b8]"
          aria-label="Close resume dialog"
        >
          ×
        </button>

        {!showViewer && (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-[7.06%] border-t border-[#707070]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-[7.06%] border-t border-[#707070]" />
            <div className="pointer-events-none absolute left-0 top-0 h-[7.06%] border-l border-[#707070]" />
            <div className="pointer-events-none absolute right-0 top-0 h-[7.06%] border-r border-[#707070]" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-[7.06%] border-l border-[#707070]" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-[7.06%] border-r border-[#707070]" />
          </>
        )}

        {showViewer ? (
          <div className="h-full w-full bg-[#f4f4f4] pt-14">
            <iframe 
              src={`${resumePdf}#view=FitH`} 
              className="h-full w-full border-none" 
              title="Resume PDF" 
            />
          </div>
        ) : (
          <div className="flex aspect-[796/496] flex-col items-center justify-center px-[16%] py-[15%] text-center font-imported-space-grotesk text-[#3f472c]">
            <h2 id="resume-heading" className="max-w-[520px] text-[clamp(2rem,6.35vw,3.2rem)] leading-[0.98] tracking-[-0.05em]">
              Want to know more about me?
            </h2>
            <p className="mt-6 text-[clamp(0.85rem,2.25vw,1.125rem)] leading-none">
              Here is my resume!
            </p>

            <div className="mt-8 w-[59%] rounded-[6px] border border-[#d3d8c7] p-[5px]">
              <button
                type="button"
                data-cursor-hover
                onClick={() => setShowViewer(true)}
                className="w-full rounded-[6px] bg-[#e3f5b8] py-[clamp(0.55rem,1.4vw,0.95rem)] text-[clamp(1.1rem,3.5vw,1.75rem)] leading-none transition-transform hover:scale-[0.985]"
              >
                View here
              </button>
            </div>

            <div className="mt-5 w-[59%] rounded-[6px] border border-[#d3d8c7] p-[5px]">
              <a
                href={resumePdf}
                download="Sahil_Sahu_Resume.pdf"
                data-cursor-hover
                className="flex w-full items-center justify-center rounded-[6px] bg-[#e3f5b8] py-[clamp(0.55rem,1.4vw,0.95rem)] text-[clamp(1.1rem,3.5vw,1.75rem)] leading-none transition-transform hover:scale-[0.985]"
              >
                Download
              </a>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
