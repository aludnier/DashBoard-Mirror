import { useEffect, useState } from 'react'
import {HashRouter as Router, Routes, Route, BrowserRouter} from 'react-router-dom'
import { api } from './client'
import './App.css'
import Inscription from './authPages/Inscription'
import Connection from './authPages/Connexion'

function App() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get('/')
      .then((response) => {
        setData(response.data)
      })
      .catch((error) => {
        setError(error.message)
      })
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Connection/>}/>
        <Route path='/Inscription' element={<Inscription/>}/>
        <Route path='/Connection' element={<Connection/>}/>
        <Route path=''/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
