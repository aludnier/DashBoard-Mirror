import React, { useState } from "react"
import "./authStyle.css"
import { api, setUserSession } from "../client"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import ResendVerification from "./ResendVerification"

function Connexion() {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string>("")
  const navigate = useNavigate()
  const [needsVerification, setNeedsVerification] = useState<boolean>(false)

  async function SubmitConnexion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setNeedsVerification(axios.isAxiosError(e) && e.response?.status === 403)

    try {
      const { data } = await api.post("/auth/login", { email, password })
      setUserSession({ ...data.user, accessToken: data.accessToken })
      navigate('/dashboard', {replace : true})
    } catch (e) {
      const message = axios.isAxiosError(e)
        ? e.response?.data?.message ?? e.message
        : "Something went wrong"
      setNeedsVerification(axios.isAxiosError(e) && e.response?.status === 403)
      setError(message)
    }
  }

  function HandleEmail(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value)
  }

  function HandlePassword(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value)
  }

  return (
    <div className="inscription-container">
      <form className="inscription-form" onSubmit={SubmitConnexion}>
        <h1>Connexion</h1>
        {error ? <h2>{error}</h2> : null}
        {needsVerification ? <ResendVerification email={email} /> : null}

        <label>
          Email
          <input type="email" placeholder="exemple@mail.com" onChange={HandleEmail} required />
        </label>

        <label>
          Password
          <input type="password" placeholder="••••••••" onChange={HandlePassword} required />
        </label>

        <button type="submit">Connect</button>
        <Link to={"/inscription"}>Don't have an account?</Link>

      </form>
    </div>
  )
}

export default Connexion
