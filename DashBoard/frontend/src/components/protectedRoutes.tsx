import { Navigate, Outlet } from 'react-router-dom'
import { getUserSession } from '../client'

export default function ProtectedRoute() {
  const session = getUserSession()

  if (!session) {
    return <Navigate to="/connexion" replace />
  }

  return <Outlet />
}
