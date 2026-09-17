import React, { useState } from "react"
import "./authStyle.css"

function Inscription() {
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string | null>("")
  const [isPasswordValid, setPasswordValid] = useState<boolean>(false)


  function SubmitInscription(e : React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    console.log("form submited\n" + name + "\n" + email + "\n" + password)
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
