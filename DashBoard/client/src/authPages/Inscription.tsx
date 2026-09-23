import React, { useState } from "react"
import "./authStyle.css"
import { api, setUserSession } from "../client"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function Inscription() {
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string | null>("")
  const [isPasswordValid, setPasswordValid] = useState<boolean>(false)
  const [error, setError] = useState<String>("")
  const navigate = useNavigate()
  const specialChar = /[\s`!@#$%^&*()_+\-=\[\]{};:"|,./<>?~]/

  async function SubmitInscription(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!isPasswordValid) {
      return
    }
    console.log("form submited\n" + name + "\n" + email + "\n" + password)
    try {
      const { data } = await api.post("/auth/signup", { email, password, name });
      console.log(data);
      setUserSession(data);
      navigate('/')
    } catch (e) {
      const message = axios.isAxiosError(e)
        ? e.response?.data?.message ?? e.message
        : "Something went wrong";
      setError(message);
    }
  }
  function HandleEmail(e : React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value)
  }

  function HandleName(e : React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value)
  }

  function HandlePassword(e : React.ChangeEvent<HTMLInputElement>) {
    const tmp : string = e.target.value

    if (!tmp || tmp.length < 8 || !/([A-Z]+)/.test(tmp) || !specialChar.test(tmp)) {
        setPasswordValid(false)
        if (password) setPassword(null)
        return
    }
    setPasswordValid(true)
    setPassword(tmp)
  }

  return (
    <div className="inscription-container">
      <form className="inscription-form" onSubmit={SubmitInscription}>
        <h1>Inscription</h1>
        {error ?  <h2> { error } </h2> : null}
        <label>
          Name
          <input type="text" placeholder="Entré un valeur" onChange={HandleName} required/>
        </label>

        <label>
          Email
          <input type="email" placeholder="exemple@mail.com" onChange={HandleEmail} required/>
        </label>

        <label>
          Password
          <input className={isPasswordValid ? "valid" : "red"} type="password" placeholder="••••••••" onChange={HandlePassword} required/>
          {isPasswordValid ? null : <>
            <p>password should contain :</p>
            <ul>
              <li>8 characters</li>
              <li>1 Uppercase</li>
              <li>1 special character</li>
            </ul>
            </>}
        </label>

        <button type="submit">S'inscrire</button>
      </form>
    </div>
  )
}

export default Inscription
