import React, { useState } from "react"
import "./authStyle.css"
import { api } from "../client"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function Inscription() {
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string | null>("")
  const [isPasswordValid, setPasswordValid] = useState<boolean>(false)
  const [error, setError] = useState<String>("")
  const navigate = useNavigate()


  async function SubmitInscription(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    console.log("form submited\n" + name + "\n" + email + "\n" + password)
    try {
      const { data } = await api.post("/auth/signup", { email, password });
      console.log(data);
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

    if (!tmp || tmp.length < 8 || !/([A-Z]+)/.test(tmp)) {
        setPasswordValid(false)
        console.log("Bad password " + isPasswordValid.toString())
        if (password) setPassword(null)
        return
    }
    setPasswordValid(true)
    console.log("Good password "+ isPasswordValid.toString() )
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
          {isPasswordValid ? null : <p>test - {isPasswordValid.toString()}</p>}
        </label>

        <button type="submit">S'inscrire</button>
      </form>
    </div>
  )
}

export default Inscription
