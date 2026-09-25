import axios from "axios"
import { useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { api } from "../client"

function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries())

    let provider: string
    console.log(params)

    if (params.code) {
      provider = 'google'
    } else if (params.provider) {
      provider = params.provider
    } else {
      console.error("Impossible d'identifier le provider")
      navigate("/login")
      return
    }

    api.post(`/oauth/${provider}`, params)
      .then(() => navigate("/dashboard"))
      .catch(console.error)
  }, [searchParams])

  return <p>Connexion en cours...</p>
}

export default OAuthCallback
