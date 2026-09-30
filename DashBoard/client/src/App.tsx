import { useEffect, useState } from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import { clearUserSession, getUserSession, type UserSession } from './client'
import './App.css'
import Inscription from './authPages/Inscription'
import Connection from './authPages/Connexion'
import Home from './titlePage/Home'
import OauthRouter from './oauthRouter'
import Dashboard from './dashboard/Dashboard'
import ProtectedRoute from './components/protectedRoutes'

function App() {
  const [user, setUser] = useState<UserSession | null>(null)
  // const navigate = useNavigate()

  useEffect(() => {
    const storedUser = getUserSession()
    if (storedUser) {
      setUser(storedUser)
    }
  }, [])

  const handleLogout = () => {
    clearUserSession()
    setUser(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home user={user} onLogout={handleLogout} />} />
        <Route path='/inscription' element={<Inscription />} />
        <Route path='/connexion' element={<Connection />} />
        <Route element={<ProtectedRoute />}>
          <Route path='/oauth/*' element={<OauthRouter />} />
          <Route path='/dashboard' element={<Dashboard  onLogout={handleLogout}/>} />
        </Route>
        <Route path='' />
      </Routes>
    </BrowserRouter>
  )
}

export default App
