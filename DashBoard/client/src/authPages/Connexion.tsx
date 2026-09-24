import React, { useState } from "react"
import "./authStyle.css"
import { api, setUserSession } from "../client"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function Connection() {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string>("")
  const navigate = useNavigate()

  async function SubmitConnection(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    console.log("Try to connect : \n" + email + "\n" + password)

    try {
      const { data } = await api.post("/auth/login", { email, password })
      setUserSession(data)
      console.log(data)
      navigate('/')
    } catch (e) {
      const message = axios.isAxiosError(e)
        ? e.response?.data?.message ?? e.message
        : "Something went wrong"
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
      <form className="inscription-form" onSubmit={SubmitConnection}>
        <h1>Connection</h1>
        {error ? <h2>{error}</h2> : null}

        <label>
          Email
          <input type="email" placeholder="exemple@mail.com" onChange={HandleEmail} required />
        </label>

        <label>
          Password
          <input type="password" placeholder="••••••••" onChange={HandlePassword} required />
        </label>

        <button type="submit">Connect</button>
      </form>
    </div>
  )
}

export default Connection
