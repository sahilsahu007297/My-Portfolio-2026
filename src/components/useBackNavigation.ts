import { useNavigate } from "react-router"

export default function useBackNavigation(fallback = "/") {
  const navigate = useNavigate()
  return () => {
    window.dispatchEvent(new Event("portfolio:before-navigation"))
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1)
    else navigate(fallback, { replace: true })
  }
}
