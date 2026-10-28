// Pre-render the installed Anatomy artwork as SVG masters. The portfolio uses
// the accompanying WebP exports, never nested React roots or idle simulations.
import { registerHooks } from "node:module"
import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs"
import { renderToStaticMarkup } from "react-dom/server"
import { resolveTheme } from "anatomy-figures/themes"

const version = JSON.parse(readFileSync("node_modules/anatomy-figures/package.json", "utf8")).version
if (version !== "0.1.0") throw new Error("Recheck the Anatomy definition adapter before upgrading.")
globalThis.portfolioAnatomyDefinitions = []
const hook = registerHooks({ load(url, context, next) {
  const result = next(url, context)
  if (url.includes("anatomy-figures/dist/chunks/chunk-NPSIX42M.js")) {
    const source = String(result.source)
    if (!source.includes("function ve(e){")) throw new Error("Anatomy definition adapter changed")
    return { ...result, source: source.replace("function ve(e){", "function ve(e){globalThis.portfolioAnatomyDefinitions.push(e);") }
  }
  if (url.includes("anatomy-figures/dist/chunks/chunk-QUYXL3AP.js")) {
    return { ...result, source: String(result.source).replace("function E(t){", "function E(t){globalThis.portfolioAnatomyDefinitions.push(t);") }
  }
  return result
}})
const names = ["lens-bench", "binary-search", "hash-map", "computer", "press-and-pull", "profile", "afterburner"]
const directory = "public/workflow-models"
mkdirSync(directory, { recursive: true })
const tokens = { ...resolveTheme("dark").tokens, "--anatomy-card": "#000", "--anatomy-paper": "#000", "--anatomy-hi": "#d6e4e4", "--anatomy-lit": "#a2def1" }
for (const name of names) {
  await import(`anatomy-figures/${name}`)
  const definition = globalThis.portfolioAnatomyDefinitions.find(d => d.tag === `anatomy-${name}`)
  if (!definition) throw new Error(`Missing definition for ${name}`)
  const html = definition.art ? renderToStaticMarkup(definition.art("")) : definition.svg
  const fragments = []; let depth = 0, start = 0
  for (const match of html.matchAll(/<svg\b[^>]*>|<\/svg>/g)) {
    if (match[0].startsWith("</")) { if (--depth === 0) fragments.push(html.slice(start, match.index + match[0].length)) }
    else { if (depth++ === 0) start = match.index }
  }
  const art = [...fragments].sort((a, b) => b.length - a.length)[0]
  if (!art) throw new Error(`No SVG for ${name}`)
  const viewBox = art.match(/viewBox="([^"]+)"/)[1]
  const layers = fragments.filter(fragment=>fragment.includes(`viewBox="${viewBox}"`)).join("").replace(/<[a-zA-Z][^>]*>/g, tag=>tag.replace(/(\s+)([\w:-]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g,(_all,space,key,value)=>`${space}${key}=${value??'""'}`))
  const css = `${typeof definition.css === "string" ? definition.css : definition.css.dark}\n.gk,.iso{${Object.entries(tokens).map(([k,v])=>`${k}:${v}`).join(";")};--bg:#000}.gk-svg{width:100%;height:100%;overflow:visible}*{animation:none!important;transition:none!important}`
  const variables={...tokens,"--bg":"#000","--ink":"#d6e4e4"}
  for(const match of css.matchAll(/(--[\w-]+)\s*:\s*([^;}]+)/g))if(!(match[1] in variables))variables[match[1]]=match[2].trim()
  const resolveVariables=input=>{let result=input;for(let i=0;i<12;i++){const next=result.replace(/var\((--[\w-]+)(?:,\s*([^()]*))?\)/g,(_all,key,fallback)=>variables[key]??fallback??"#89969c");if(next===result)break;result=next}return result}
  const svg = resolveVariables(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" class="gk gk-embed iso iso-dark" data-theme="dark"><style>${css.replace(/</g,"&lt;")}</style>${layers}</svg>`)
  writeFileSync(`${directory}/${name}.svg`, svg)
  console.log(`${name}: ${(Buffer.byteLength(svg)/1024).toFixed(0)} KB, static SVG`)
}
copyFileSync("node_modules/anatomy-figures/LICENSE", `${directory}/LICENSE.txt`)
hook.deregister()
