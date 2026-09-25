function GoogleConnectButton() {
    function redirectGoogleOauth() {
        const state = btoa(JSON.stringify({ provider: "google", nonce: crypto.randomUUID() }))
        sessionStorage.setItem("oauth_state", state)
        const url = "https://accounts.google.com/o/oauth2/v2/auth?client_id=958946193851-v5v59iomn7606gmssoeev34f13rg3l9p.apps.googleusercontent.com&redirect_uri=http://localhost:5173/oauth/callback/&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent"

        window.location.href = url
    }

    return (
    <>
        <button onClick={ redirectGoogleOauth }>Connect with google</button>
    </>)
}

export default GoogleConnectButton
