import { useState } from "react"
import { api, apiErrorMessage } from "../client"

function ResendVerification({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle")
  const [error, setError] = useState("")

  async function resend() {
    setStatus("sending")
    setError("")
    try {
      await api.post("/auth/resend-verification", { email })
      setStatus("sent")
    } catch (e) {
      setError(apiErrorMessage(e, "Could not resend the email"))
      setStatus("idle")
    }
  }

  if (status === "sent")
    return <p>A new link has been sent to {email}.</p>

  return (
    <>
      <button type="button" onClick={resend} disabled={status === "sending"}>
        {status === "sending" ? "Sending..." : "Resend verification email"}
      </button>
      {error ? <p>{error}</p> : null}
    </>
  )
}

export default ResendVerification
