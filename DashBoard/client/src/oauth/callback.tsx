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

    let provider: string

    if (params.code) {
      provider = 'google'
    } else if (params.provider) {
      provider = params.provider
    } else {
      console.error("Impossible d'identifier le provider")
      navigate("/login")
      return
    }

    const currUser = getUserSession()
    if (!currUser) {
      return;
    }

    api.post(`/oauth/${provider}/${currUser.id}`, params)
      .then(() => navigate("/dashboard"))
      .catch(console.error)
  }, [searchParams])

  return <p>Connexion en cours...</p>
}

export default OAuthCallback
