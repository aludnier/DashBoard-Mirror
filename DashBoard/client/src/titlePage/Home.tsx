import { Navigate } from 'react-router-dom'
import './titleStyle.css'
import type { UserSession } from '../client'

type Props = {
  user: UserSession | null
  onLogout: () => void
}

function Home({ user }: Props) {

  return (
    <Navigate to={user ? '/dashboard' : '/connexion'}/>
  )
}

export default Home
