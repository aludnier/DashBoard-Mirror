import React, { useState } from "react"
import "./authStyle.css"

function Connection() {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")


  function SubmitConnection(e : React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    console.log("Try to connect : \n" + email + "\n" + password)
  }

  function HandleEmail(e : React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value)
  }


  function HandlePassword(e : React.ChangeEvent<HTMLInputElement>) {
    const tmp : string = e.target.value

    setPassword(tmp)
  }

  return (
    <>
    <div className="inscription-container">
      <form className="inscription-form" onSubmit={SubmitConnection}>
        <h1>Connection</h1>
        <label>
          Email
          <input type="email" placeholder="exemple@mail.com" onChange={HandleEmail} required/>
        </label>

        <label>
          Password
          <input type="password" placeholder="••••••••" onChange={HandlePassword} required/>
        </label>

        <button type="submit">Connect</button>
      </form>
    </div>
    </>
  )
}

export default Connection
