import { Link } from 'react-router-dom'
import './titleStyle.css'

function Home() {
  return (
    <div className="title-page">
      <header className="title-header">
        <Link to="/" className="brand"><h1>Dashboard</h1></Link>
        <nav className="nav-buttons">
          <Link to="/Inscription"><button>Inscription</button></Link>
          <Link to="/Connection"><button>Connection</button></Link>
        </nav>
      </header>
    </div>
  )
}
export default Home
