import { useEffect, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { api, getUserSession } from "../client"

function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const params = Object.fromEntries(searchParams.entries())

    const savedState = sessionStorage.getItem("oauth_state")
    sessionStorage.removeItem("oauth_state")

    if (!params.state || params.state !== savedState) {
      console.error("Missing or invalid OAuth state")
      navigate("/")
      return
    }

    if (params.error) {
      console.error("Connexion refused: ", params.error)
      navigate("/")
      return
    }

    let provider: string
    try {
      provider = JSON.parse(atob(params.state)).provider
    } catch {
      console.error("Impossible to identify the provider")
      navigate("/Connexion")
      return
    }

    const currUser = getUserSession()
    if (!currUser) {
      navigate("/Connexion")
      return;
    }

    api.post(`/oauth/${provider}`, params)
      .then(() => navigate("/dashboard"))
      .catch((e) => {
        console.error(e)
        navigate("/")
      })
  }, [searchParams])

  return <p>Connexion en cours...</p>
}

export default OAuthCallback
