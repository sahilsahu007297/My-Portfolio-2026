import type { GraphicWork } from "./graphicWorks"

export const graphicThumbnail = (work: GraphicWork, width: 480 | 800 = 480) => `/graphic-work/thumbs/${work.id}-${width}.webp`
export const graphicSrcSet = (work: GraphicWork) => `${graphicThumbnail(work, 480)} 480w, ${graphicThumbnail(work, 800)} 800w, ${work.src} ${work.width}w`
