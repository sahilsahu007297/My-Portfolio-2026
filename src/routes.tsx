import { createBrowserRouter } from "react-router"
import ProjectDetail from "./components/ProjectDetail"

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
])
