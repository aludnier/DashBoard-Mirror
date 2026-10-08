import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './navBar.css'

interface NavBarProps {
  // Where the title links to: the landing page for visitors, the dashboard
  // once logged in.
  brandTo?: string
  // Buttons shown on the right-hand side.
  children?: ReactNode
}

function NavBar({ brandTo = '/', children }: NavBarProps) {
  const [isMenuActive, setMenuActive] = useState<boolean>(false)

  return (
    <>
      <header className="nav-bar">
        <Link to={brandTo} className="brand"><h1>Dashboard</h1></Link>
        <nav className="nav-buttons">{children}</nav>
        <button type="button" className="nav-menu-trigger" onClick={() => setMenuActive(!isMenuActive)}
          aria-label="Toggle navigation menu">
          |||
        </button>
      </header>

      <div className={`nav-menu-panel ${isMenuActive ? 'open' : ''}`} >
        <nav className="menu-button-s">{children}</nav>
      </div>
    </>
  )
}

export default NavBar
