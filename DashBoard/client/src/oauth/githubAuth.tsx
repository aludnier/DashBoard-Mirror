function GithubConnectButton() {
    function redirectGithubOauth() {
        const state = btoa(JSON.stringify({ provider: "github", nonce: crypto.randomUUID() }))
        sessionStorage.setItem("oauth_state", state)

        const params = new URLSearchParams({
            client_id: 'Ov23li8Zh3pYF3EBUsXL',
            redirect_uri: 'http://localhost:5173/oauth/callback',
            scope: 'read:user repo',
            state,
        })

        window.location.href = `https://github.com/login/oauth/authorize?${params}`
    }

    return (
    <>
        <button onClick={ redirectGithubOauth }>Connect with Github</button>
    </>)
}

export default GithubConnectButton
