import { Link } from "react-router"
import PosterCylinder from "./PosterCylinder"
import "./Graphics.css"

export default function Graphics() {
  return <section id="graphic-design" className="graphics-playground" aria-label="Graphic design and visual experiments">
    <header className="graphics-playground__masthead"><span>Outside the wireframe</span><span>78 works / One curious mind</span></header>
    <div className="graphics-playground__intro">
      <span className="graphics-playground__edition"><i aria-hidden="true" /> A different side of the same mind.</span>
      <h2>A world of<br /><em>visual possibility.</em></h2>
      <p>Type gets loud. Colour takes the lead.<br />A collection made to move you.</p>
    </div>
    <div className="graphics-playground__collection">
      <span className="graphics-playground__orbit-label" aria-hidden="true">THE VISUAL PLAYGROUND</span>
      <PosterCylinder />
    </div>
    <div className="graphics-playground__invitation">
      <p>Car posters. Brand identities. Flavours. Feelings.</p>
      <Link to="/graphic-design" className="graphics-playground__link" data-cursor-hover><span>Explore all graphic work</span><span aria-hidden="true">↗</span></Link>
    </div>
    <footer className="graphics-playground__footer"><span>TYPE / COLOUR / COMPOSITION</span><span>Good design has a playful side.</span></footer>
  </section>
}
