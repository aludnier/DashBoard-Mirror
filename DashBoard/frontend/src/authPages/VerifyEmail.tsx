import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import "./authStyle.css"
import { api, apiErrorMessage, setUserSession } from "../client"

function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const [error, setError] = useState<string>(token ? "" : "This link has no verification token.")
  const navigate = useNavigate()
  const requested = useRef(false)

  useEffect(() => {
    if (!token || requested.current)
      return
    requested.current = true

    api.post("/auth/verify", { token })
      .then(({ data }) => {
        setUserSession({ ...data.user, accessToken: data.accessToken })
        navigate("/dashboard", { replace: true })
      })
      .catch((e) => setError(apiErrorMessage(e, "Could not verify your email")))
  }, [token, navigate])

  return (
    <div className="inscription-container">
      <div className="inscription-form">
        <h1>Email verification</h1>
        {error
          ? <>
              <h2>{error}</h2>
              <p>Log in to get a new verification link.</p>
              <Link to="/connexion">Go to login</Link>
            </>
          : <p>Verifying your email...</p>}
      </div>
    </div>
  )
}

export default VerifyEmail
