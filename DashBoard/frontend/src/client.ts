import axios from 'axios'

export type UserSession = {
  id: string
  email: string
  accessToken: string
}

export const AUTH_STORAGE_KEY = 'dashboard_user'

export const api = axios.create({
  baseURL: 'http://localhost:8080',
})

/* Runs before every request: attach the login token so protected routes
   (JwtAuthGuard on the server) know who is calling.*/
api.interceptors.request.use((config) => {
  const token = getUserSession()?.accessToken
  if (token)
    config.headers.Authorization = `Bearer ${token}`
  return config
})

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error))
    return fallback

  const message: unknown = error.response?.data?.message
  if (typeof message === 'string')
    return message
  if (Array.isArray(message))
    return message.join(', ')
  return fallback
}

export const setUserSession = (user: UserSession) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
}

export const getUserSession = (): UserSession | null => {
  const rawUser = localStorage.getItem(AUTH_STORAGE_KEY)

  if (!rawUser) return null

  try {
    const session = JSON.parse(rawUser) as Partial<UserSession>
    // Sessions saved before JWT have no token: treat them as logged out.
    if (!session.id || !session.accessToken) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }
    return session as UserSession
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export const clearUserSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}
