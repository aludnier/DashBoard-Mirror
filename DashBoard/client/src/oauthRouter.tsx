import { Route, Routes } from "react-router-dom"
import GoogleConnectButton from "./oauth/googleAuth"
import OauthCallback from "./oauth/callback"

function OauthRouter() {
    return (
        <Routes>
            <Route path="/google" element={<GoogleConnectButton/>}/>
            <Route path="/callback" element={<OauthCallback />}/>
        </Routes>
    )
}

export default OauthRouter
