import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import './titleStyle.css'

function Home() {
  return (
    <div className="title-page">
      <NavBar>
        <Link to="/Inscription"><button>Inscription</button></Link>
        <Link to="/Connection"><button>Connection</button></Link>
      </NavBar>
    </div>
  )
}
export default Home
