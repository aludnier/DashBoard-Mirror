export function redirectToDiscordOauth() {
  const state = btoa(JSON.stringify({
    provider: 'discord',
    nonce: crypto.randomUUID(),
  }))

  sessionStorage.setItem('oauth_state', state)

  const scope = [
    'identify',
    'guilds',
    'role_connections.write',
  ].join(' ')


  const params = new URLSearchParams({
    client_id: '1556666904557518968',
    redirect_uri: 'http://localhost:5173/oauth/callback/',
    response_type: 'code',
    scope,
    state,
  })

  window.location.href = `https://discord.com/oauth2/authorize?${params}`
}

function DiscordConnectButton() {
  return <button type="button" onClick={redirectToDiscordOauth}>Connect with Discord</button>
}

export default DiscordConnectButton
