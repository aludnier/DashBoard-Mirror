import { Link, Navigate, useNavigate, useNavigation } from 'react-router-dom'
import NavBar from '../components/NavBar'
import GithubMenu from '../components/GithubMenu'
import './titleStyle.css'
import { getUserSession, type UserSession } from '../client'

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
