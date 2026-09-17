import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="title-page">
      <h1>Dashboard</h1>
      <nav>
        <Link to="/Inscription"><button>Inscription</button></Link>
        <Link to="/Connection"><button>Connection</button></Link>
      </nav>
    </div>
  )
}
export default Home
