import { useState } from "react"
import "./authStyle.css"

function Connection() {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [isPasswordValid, setPasswordValid] = useState<boolean>(false)


  function SubmitConnection(e) {
    e.preventDefault()
  }

  function HandleEmail(e) {
    setEmail(e.target.value)
  }


  function HandlePassword(e) {
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
