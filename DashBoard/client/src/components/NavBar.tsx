import type { ReactNode } from 'react'
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
  return (
    <header className="nav-bar">
      <Link to={brandTo} className="brand"><h1>Dashboard</h1></Link>
      <nav className="nav-buttons">{children}</nav>
    </header>
  )
}

export default NavBar
