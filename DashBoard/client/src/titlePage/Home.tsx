import { Link, useNavigate } from 'react-router-dom'
import './titleStyle.css'
import { clearUserSession, getUserSession } from '../client';


function Home() {
  const user = getUserSession()

  const handleLogout = () => {
    clearUserSession()
    window.location.reload()
  }

  return (
    <div className="title-page">
      <header className="title-header">
        <Link to="/" className="brand"><h1>Dashboard</h1></Link>

        {user ? (
          <div className="nav-buttons">
            <span>Bonjour {user.email}</span>
            <button onClick={handleLogout}>Déconnexion</button>
          </div>
        ) : (
          <nav className="nav-buttons">
            <Link to="/Inscription"><button>Inscription</button></Link>
            <Link to="/Connection"><button>Connection</button></Link>
          </nav>
        )}
      </header>
    </div>
  )
}

export default Home
