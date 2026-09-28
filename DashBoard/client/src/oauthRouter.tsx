import { Route, Routes } from "react-router-dom"
import GoogleConnectButton from "./oauth/googleAuth"
import OauthCallback from "./oauth/callback"
import GithubConnectButton from "./oauth/githubAuth"
import YoutubeGoogleWidget from "./widgets/youtubeWidget"

function OauthRouter() {
    return (
        <Routes>
            <Route path="/google" element={<GoogleConnectButton/>} />
            <Route path="/google/youtube" element={<YoutubeGoogleWidget/>} />
            <Route path="/callback" element={<OauthCallback />} />
            <Route path="/github" element={<GithubConnectButton />} />
        </Routes>
    )
}

export default OauthRouter
