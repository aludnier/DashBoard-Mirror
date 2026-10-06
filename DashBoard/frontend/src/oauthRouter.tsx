import { Route, Routes } from "react-router-dom"
import GoogleConnectButton from "./oauth/googleAuth"
import OauthCallback from "./oauth/callback"
import GithubConnectButton from "./oauth/githubAuth"

function OauthRouter() {
    return (
        <Routes>
            <Route path="/google" element={<GoogleConnectButton/>} />
            <Route path="/callback" element={<OauthCallback />} />
            <Route path="/github" element={<GithubConnectButton />} />
        </Routes>
    )
}

export default OauthRouter
