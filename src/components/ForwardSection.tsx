import React, { useEffect, useRef, useState } from "react";
import myImage from "../Assets/myimage1.png";
import bottomImg1 from "../Assets/bottom_img1.png";
import bottomImg3 from "../Assets/bottom_img3.png";
import bottomImg4 from "../Assets/bottom_img4.png";

interface Props {
  indiaTime: string
  onResumeClick: () => void
}

export default function ForwardSection({ indiaTime, onResumeClick }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Parallax state for mouse hover
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [snapPointsCount, setSnapPointsCount] = useState(3);

  useEffect(() => {
    let raf = 0;
    let currentMaxScroll = 0;

    // Use ResizeObserver to reliably get content height
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === contentRef.current && sectionRef.current) {
          const vh = window.innerHeight;
          const contentHeight = entry.contentRect.height;
          // Add some padding to maxScroll to make it scroll a bit slower/longer (1.5x multiplier)
          currentMaxScroll = Math.max(0, contentHeight - vh) * 1.5;
          const totalHeight = vh * 2 + currentMaxScroll;
          sectionRef.current.style.height = `${totalHeight}px`;
          setSnapPointsCount(Math.ceil(totalHeight / vh));
        }
      }
    });

    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    const updateScroll = () => {
      const section = sectionRef.current;
      const container = containerRef.current;
      const content = contentRef.current;
      if (!section || !container || !content) return;

      const vh = window.innerHeight;
      const maxScroll = currentMaxScroll;
      
      const rect = section.getBoundingClientRect();
      const localScroll = Math.max(0, -rect.top);

      // Animation logic
      if (localScroll < vh) {
        // Entrance: scale up smoothly as user scrolls in
        const pos = localScroll / vh;
        // Scale up over the first 80% of the sticky scroll to make it smooth
        const pScale = Math.min(1, pos / 0.8);
        
        const scale = 0.38 + pScale * 0.62;
        const radius = 28 * (1 - pScale);
        
        container.style.transform = `translateY(0vh) scale(${scale})`;
        container.style.borderRadius = `${radius}px`;
        content.style.transform = `translateY(0px)`;
      } else if (localScroll >= vh && localScroll < vh + maxScroll) {
        // Middle: scroll the content
        container.style.transform = 'translateY(0) scale(1)';
        container.style.borderRadius = '0px';
        content.style.transform = `translateY(-${(localScroll - vh) / 1.5}px)`;
      } else {
        // Exit: scale down and move up (exactly like hero section)
        const pos = Math.min(1, (localScroll - (vh + maxScroll)) / vh);
        
        const p1 = Math.min(1, pos / 0.55);
        const p2 = Math.max(0, (pos - 0.55) / 0.45);
        const scale = 1 - p1 * 0.62;
        const radius = p1 * 28;
        const translateY = -p2 * 120;
        
        container.style.transform = `translateY(${translateY}vh) scale(${scale})`;
        container.style.borderRadius = `${radius}px`;
        content.style.transform = `translateY(-${maxScroll / 1.5}px)`;
      }

      // (Fade-in logic removed from here, now handled by IntersectionObserver)
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position between -1 and 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateScroll);
    };

    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousemove", handleMouseMove);
      if (contentRef.current) resizeObserver.unobserve(contentRef.current);
      resizeObserver.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  // Intersection Observer for fade-in effect
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', 'translate-y-12');
          entry.target.classList.add('opacity-100', 'translate-y-0');
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    if (contentRef.current) {
      const els = contentRef.current.querySelectorAll('.fade-in-up');
      els.forEach(el => observer.observe(el));
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="relative bg-transparent w-full" style={{ minHeight: "300vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        <div 
          ref={containerRef} 
          className="w-full h-full bg-[#F1F0EC] origin-center overflow-hidden will-change-transform"
          style={{ zIndex: 2 }}
        >
          {/* Navbar applied to this section as requested */}
          <header className="absolute top-0 left-0 w-full z-50 grid grid-cols-2 items-center px-6 py-4 text-[15px] font-semibold tracking-tight md:grid-cols-5 md:px-8 text-black">
            <div className="md:pr-6">Sahil Sahu</div>
            <a 
              href="#about" 
              onClick={(e) => {
                e.preventDefault()
                document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })
              }}
              className="hidden border-l border-black/85 px-6 text-center transition-opacity hover:opacity-55 md:block"
            >
              About
            </a>
            <a 
              href="#contact" 
              onClick={(e) => {
                e.preventDefault()
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
              }}
              className="hidden border-l border-black/85 px-6 text-center transition-opacity hover:opacity-55 md:block"
            >
              Contact&nbsp;&nbsp;&nbsp;
            </a>
            <button 
              type="button" 
              onClick={onResumeClick} 
              className="hidden border-l border-black/85 px-6 text-center transition-opacity hover:opacity-55 md:block"
            >
              Resume
            </button>
            <div className="flex items-center justify-end gap-2 border-l border-black/85 pl-6 tabular-nums">
               <time dateTime={new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour12: false })}>
                 {indiaTime} IST
               </time>
            </div>
          </header>

          <div className="h-px w-full bg-black/85 absolute top-[60px] left-0 z-50" />

          <div ref={contentRef} className="relative w-full will-change-transform text-black flex flex-col items-center">
            
            {/* HERO TYPOGRAPHY & PARALLAX IMAGE */}
            <div className="relative w-full h-[100vh] md:h-[120vh] min-h-[600px] md:min-h-[900px] flex justify-center overflow-hidden">
              
              {/* Background Text Layers */}
              <div 
                className="absolute top-[18vh] md:top-[22vh] w-full flex flex-col items-center z-10 pointer-events-none"
                style={{ transform: `translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)` }}
              >
                <div className="text-[14vw] md:text-[12vw] font-black leading-[0.85] text-black w-full text-center relative -left-[5%] md:-left-[10%]">
                  I FIND THE
                </div>
                <div className="text-[14vw] md:text-[12vw] font-black leading-[0.85] text-black w-full text-center relative -left-[10%] md:-left-[20%] mt-2 md:mt-4">
                  WAY
                </div>
                <div className="text-[14vw] md:text-[12vw] font-black leading-[0.85] text-transparent w-full text-center relative left-[5%] mt-2 md:mt-4">
                  FORWARD
                </div>
              </div>

              {/* The Subject Image */}
              <img 
                src={myImage}
                alt="Sahil Sahu"
                className="absolute top-[15vh] md:top-[16vh] z-20 w-auto h-[55vh] md:h-[70vh] object-contain drop-shadow-2xl"
                style={{ 
                  transform: `translate(${mousePos.x * 5}px, ${mousePos.y * 5}px)`,
                  transition: 'transform 0.1s ease-out',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
                  maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
                }}
              />

              {/* Foreground Text Layer (Solid Black FORWARD) */}
              <div 
                className="absolute top-[18vh] md:top-[22vh] w-full flex flex-col items-center z-30 pointer-events-none"
                style={{ transform: `translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)` }}
              >
                <div className="text-[14vw] md:text-[12vw] font-black leading-[0.85] w-full text-center relative -left-[5%] md:-left-[10%] opacity-0">
                  I FIND THE
                </div>
                <div className="text-[14vw] md:text-[12vw] font-black leading-[0.85] w-full text-center relative -left-[10%] md:-left-[20%] mt-2 md:mt-4 opacity-0">
                  WAY
                </div>
                <div className="text-[14vw] md:text-[12vw] font-black leading-[0.85] text-black w-full text-center relative left-[5%] mt-2 md:mt-4">
                  FORWARD
                </div>
              </div>

              {/* Gradient to hide any remaining artifacts */}
              <div className="absolute bottom-0 left-0 w-full h-[10vh] bg-gradient-to-t from-[#F1F0EC] via-[#F1F0EC]/90 to-transparent z-30 pointer-events-none" />

              {/* TEXT BLOCK BOTTOM LEFT */}
              <div className="absolute bottom-[10vh] md:bottom-[20vh] left-4 md:left-12 max-w-[80vw] md:max-w-sm z-40 text-left">
                <h3 className="text-sm md:text-xl font-semibold leading-tight mb-1 md:mb-2 text-black/80">
                  SAHIL SAHU -<br/>UX DESIGNER + STRATEGIST
                </h3>
                <p className="text-xs md:text-base font-medium leading-snug text-black/70">
                  Designing products, systems & experiences<br/>from ambiguity to impact.
                </p>
              </div>
            </div>

            {/* HUGE MIDDLE TEXT */}
            <div className="w-full flex justify-center items-center my-32 px-4 fade-in-up opacity-0 translate-y-12 transition-all duration-700 ease-out delay-100">
              <div className="text-[9vw] font-black leading-[0.9] tracking-tighter text-black text-center break-words">
                THINK. SHAPE.<br/>BUILD. GROW.
              </div>
            </div>

            {/* NUMBERS */}
            <div className="w-full max-w-[1600px] flex justify-between items-center px-12 md:px-32 my-12 fade-in-up opacity-0 translate-y-12 transition-all duration-700 ease-out delay-200">
              <span className="text-[10vw] md:text-[8vw] font-black leading-none text-black">01</span>
              <span className="text-[10vw] md:text-[8vw] font-black leading-none text-black">02</span>
              <span className="text-[10vw] md:text-[8vw] font-black leading-none text-black">03</span>
              <span className="text-[10vw] md:text-[8vw] font-black leading-none text-black">04</span>
            </div>

            {/* COLUMNS */}
            <div className="w-full max-w-[1600px] grid grid-cols-1 md:grid-cols-4 gap-12 px-8 mb-12 fade-in-up opacity-0 translate-y-12 transition-all duration-700 ease-out delay-300">
              {/* Col 1 */}
              <div className="flex flex-col items-center text-center">
                <h4 className="text-xl font-black mb-4">THINK</h4>
                <p className="text-lg font-normal leading-relaxed">
                  I start with questions, not answers.<br/>
                  I untangle the noise, challenge assumptions,<br/>
                  and find the problem worth solving.<br/>
                  Clarity comes before creation.
                </p>
              </div>
              {/* Col 2 */}
              <div className="flex flex-col items-center text-center">
                <h4 className="text-xl font-black mb-4">SHAPE</h4>
                <p className="text-lg font-normal leading-relaxed">
                  I turn insight into direction.<br/>
                  Ideas become flows, systems, and experiences—<br/>
                  shaped around what people need<br/>
                  and what the product must become.
                </p>
              </div>
              {/* Col 3 */}
              <div className="flex flex-col items-center text-center">
                <h4 className="text-xl font-black mb-4">BUILD</h4>
                <p className="text-lg font-normal leading-relaxed">
                  I don&apos;t stop at the blueprint.<br/>
                  I bring ideas into the real world,<br/>
                  where design meets technology<br/>
                  and the business of making things work.
                </p>
              </div>
              {/* Col 4 */}
              <div className="flex flex-col items-center text-center">
                <h4 className="text-xl font-black mb-4">GROW</h4>
                <p className="text-lg font-normal leading-relaxed">
                  Nothing is ever truly finished.<br/>
                  I watch, learn, question, and refine<br/>
                  turning what works into what works better,<br/>
                  and products into systems that can grow.
                </p>
              </div>
            </div>

            {/* Bottom images */}
            <div className="w-full max-w-[1600px] flex justify-between items-end px-8 mb-24 opacity-80 fade-in-up opacity-0 translate-y-12 transition-all duration-700 ease-out delay-[400ms]">
                <img src={bottomImg1} alt="illustration" className="w-[15%] object-contain" />
                <img src={bottomImg3} alt="illustration" className="w-[15%] object-contain" />
                <img src={bottomImg4} alt="illustration" className="w-[15%] object-contain" />
                <img src={bottomImg1} alt="illustration" className="w-[15%] object-contain" />
            </div>

          </div>
        </div>
      </div>
      
      {/* Invisible Snap Points */}
      <div className="absolute inset-0 z-0 pointer-events-none flex flex-col">
        {Array.from({ length: snapPointsCount }).map((_, i) => (
          <div key={i} className="h-screen w-full snap-start shrink-0" />
        ))}
      </div>
    </section>
  );
}
