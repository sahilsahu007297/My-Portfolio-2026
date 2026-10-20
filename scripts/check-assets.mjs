import fs from "node:fs"
import path from "node:path"

const required = new Set(["/favicon.png", "/portfolio-sky-4k.webp", "/project-posters/canact-mockup.webp"])
const graphics = fs.readFileSync("src/components/graphicWorks.ts", "utf8")
for (const match of graphics.matchAll(/"src":\s*"([^"]+)"/g)) {
  required.add(match[1])
  const id = path.basename(match[1], ".webp")
  required.add(`/graphic-work/thumbs/${id}-480.webp`)
  required.add(`/graphic-work/thumbs/${id}-800.webp`)
}
const projects = fs.readFileSync("src/components/projectUpdates.ts", "utf8")
for (const match of projects.matchAll(/poster:\s*"([^"]+)"/g)) required.add(match[1])
for (const name of ["retention-cliff", "bhopal-clothing", "aarthik", "aangan", "teamio"]) {
  required.add(`/case-studies/${name}.json`)
  required.add(`/case-studies/${name}.pdf`)
}
const missing = [...required].filter(file => !fs.existsSync(path.join("public", file)) || fs.statSync(path.join("public", file)).size === 0)
if (missing.length) throw new Error(`Missing portfolio assets:\n${missing.join("\n")}`)
console.log(`Verified ${required.size} required images and case-study downloads.`)
