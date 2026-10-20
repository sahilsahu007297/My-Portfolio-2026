import { createBrowserRouter } from "react-router"
import ProjectDetail from "./components/ProjectDetail"
import CaseStudyDetail from "./components/CaseStudyDetail"
import GraphicsGallery from "./components/GraphicsGallery"
import PortfolioPages from "./components/PortfolioPages"

export const router = createBrowserRouter([
  {
    path: "/",
    HydrateFallback: () => null,
    lazy: async () => {
      const module = await import("./App")
      return { Component: module.Home }
    },
  },
  { path: "/projects/:projectId", Component: ProjectDetail },
  { path: "/projects", Component: PortfolioPages },
  { path: "/contact", element: <PortfolioPages contact /> },
  { path: "/case-studies/:studyId", Component: CaseStudyDetail },
  { path: "/graphics", Component: GraphicsGallery },
  { path: "/graphic-design", Component: GraphicsGallery },
])
