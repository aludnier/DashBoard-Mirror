export function redirectToGoogleOauth() {
  const state = btoa(JSON.stringify({
    provider: 'google',
    nonce: crypto.randomUUID(),
  }))

  sessionStorage.setItem('oauth_state', state)

  const scope = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/gmail.readonly',
  ].join(' ')

  const params = new URLSearchParams({
    client_id: '958946193851-v5v59iomn7606gmssoeev34f13rg3l9p.apps.googleusercontent.com',
    redirect_uri: 'http://localhost:5173/oauth/callback/',
    response_type: 'code',
    scope,
    access_type: 'offline',
    prompt: 'consent',
    state,
  })

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

function GoogleConnectButton() {
  return <button type="button" onClick={redirectToGoogleOauth}>Connect with Google</button>
}

export default GoogleConnectButton
