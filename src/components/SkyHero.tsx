import { useEffect, useState } from "react"
import { Link } from "react-router"
import resume from "../Sahil-Sahu-Resume-2026.pdf"
import "./SkyHero.css"

export default function SkyHero() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setReady(true)
    }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1400)
    return () => clearTimeout(timer)
  }, [])
  return <section className={`sky-hero ${ready ? "is-ready" : ""}`} aria-label="Graphic design portfolio introduction" data-image-trail>
    <img className="sky-hero__background" src="/portfolio-sky-4k.webp" alt="" fetchPriority="high" width="3840" height="2160" />
    <header className="sky-nav">
      <Link to="/" className="sky-nav__brand" aria-label="Sahil Sahu home">ss.</Link>
      <nav aria-label="Graphic portfolio navigation"><Link to="/">Home</Link><a href="#graphic-work">Projects</a><a href="#graphic-contact">Contact</a></nav>
      <a className="sky-nav__resume" href={resume} download="Sahil_Sahu_Resume_2026.pdf">Résumé ↗</a>
    </header>
    <div className="sky-hero__identity">
      <p>Graphic design. Art direction. Visual curiosity.</p>
      <h1>Sahil Sahu<span>.</span></h1>
      <p className="sky-hero__description">Type, colour and images with a point of view.<br />A collection of posters, identities and visual stories.</p>
      <div className="sky-hero__links"><a href="#graphic-work">Explore graphic work ↗</a><a href="#graphic-contact">Let’s talk ↗</a></div>
    </div>
    <footer className="sky-hero__footer"><span>78 works / Sahil Sahu</span><span>Independent designer / India</span><a href="#graphic-work">Follow your curiosity ↓</a></footer>
  </section>
}
