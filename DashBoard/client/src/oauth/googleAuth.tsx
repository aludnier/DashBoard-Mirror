function GoogleConnectButton() {
    function redirectGoogleOauth() {
        const state = btoa(JSON.stringify({
            provider: "google",
            nonce: crypto.randomUUID()
        }));

        sessionStorage.setItem("oauth_state", state);

        const scope = [
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/youtube.readonly"
        ].join(" ")
        const params = new URLSearchParams({
            client_id: "958946193851-v5v59iomn7606gmssoeev34f13rg3l9p.apps.googleusercontent.com",
            redirect_uri: "http://localhost:5173/oauth/callback/",
            response_type: "code",
            scope: scope,
            access_type: "offline",
            prompt: "consent",
            state: state
        });

        const url = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

        window.location.href = url;
    }

    return (
        <button onClick={redirectGoogleOauth}>Connect with Google</button>
    );
}

export default GoogleConnectButton;
