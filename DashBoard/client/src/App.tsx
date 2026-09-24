import { useEffect, useState } from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import { clearUserSession, getUserSession, type UserSession } from './client'
import './App.css'
import Inscription from './authPages/Inscription'
import Connection from './authPages/Connexion'
import Home from './titlePage/Home'

function App() {
  const [user, setUser] = useState<UserSession | null>(null)

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
        <Route path='/Inscription' element={<Inscription />} />
        <Route path='/Connection' element={<Connection />} />
        <Route path='' />
      </Routes>
    </BrowserRouter>
  )
}

export default App
