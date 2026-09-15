import { useEffect, useState } from 'react'
import { api } from './../../server/client'
import './App.css'

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
    <>
      <h1>Hi!</h1>

      {error ? (
        <h1>Error: {error}</h1>
      ) : data ? (
        <h1>{JSON.stringify(data)}</h1>
      ) : (
        <h1>Loading...</h1>
      )}
    </>
  )
}

export default App
