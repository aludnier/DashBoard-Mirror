import { BrowserRouter, Route, Routes } from "react-router-dom"
import GoogleConnectButton from "./authPages/googleAuth"

function OauthRouter() {
    return (
        <Routes>
            <Route path="/google" element={<GoogleConnectButton/>}/>
        </Routes>
    )
}

export default OauthRouter
