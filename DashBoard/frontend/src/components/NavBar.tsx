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
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className={`bi bi-filter ${isMenuActive ? 'is-active' : ''}`} viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"/>
          </svg>
        </button>
      </header>

      <div className={`nav-menu-panel ${isMenuActive ? 'open' : ''}`} >
        <nav className="menu-button-s">{children}</nav>
      </div>
    </>
  )
}

export default NavBar
