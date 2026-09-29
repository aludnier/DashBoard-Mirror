import { Link, useNavigate, useNavigation } from 'react-router-dom'
import NavBar from '../components/NavBar'
import GithubMenu from '../components/GithubMenu'
import './titleStyle.css'
import { getUserSession, type UserSession } from '../client'

type Props = {
  user: UserSession | null
  onLogout: () => void
}

function Home({ user, onLogout }: Props) {
  const userSession =  getUserSession()
  const navigate = useNavigate()
  if (userSession) {
    navigate('/dashBoard')
  } else {
    navigate('/connexion')
  }

  return (
    <div className="title-page">
      <NavBar>
        {user ? (
          <>
            <p>Welcome {user.email}</p>
            <GithubMenu />
            <button onClick={onLogout}>Disconnect</button>
          </>
        ) : (
          <>
            <Link to="/Inscription"><button>Inscription</button></Link>
            <Link to="/Connexion"><button>Connexion</button></Link>
          </>
        )}
      </NavBar>
    </div>
  )
}

export default Home
