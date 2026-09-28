import { redirectToGithubOauth } from "./github"

function GithubConnectButton() {
    return (
    <>
        <button onClick={ redirectToGithubOauth }>Connect with Github</button>
    </>)
}

export default GithubConnectButton
