import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import './titleStyle.css'
import type { UserSession } from '../client'

type Props = {
  user: UserSession | null
  onLogout: () => void
}

function Home({ user, onLogout }: Props) {
  return (
    <div className="title-page">
      <NavBar>
        {user ? (
          <>
            <p>Welcome {user.email}</p>
            <button onClick={onLogout}>Disconnect</button>
          </>
        ) : (
          <>
            <Link to="/Inscription"><button>Inscription</button></Link>
            <Link to="/Connection"><button>Connection</button></Link>
          </>
        )}
      </NavBar>
    </div>
  )
}

export default Home
