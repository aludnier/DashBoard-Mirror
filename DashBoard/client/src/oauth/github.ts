// Kept in a .ts file (not next to a component) so it can be shared by the
// /oauth/github page and the navbar menu without tripping react-refresh's
// "only export components" rule.
export function redirectToGithubOauth() {
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
