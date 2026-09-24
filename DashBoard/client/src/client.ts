import axios from 'axios'

export type UserSession = {
  id: string
  email: string
}

export const AUTH_STORAGE_KEY = 'dashboard_user'

export const api = axios.create({
  baseURL: 'http://localhost:8080',
})

export const setUserSession = (user: UserSession) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
}

export const getUserSession = (): UserSession | null => {
  const rawUser = localStorage.getItem(AUTH_STORAGE_KEY)

  if (!rawUser) return null

  try {
    return JSON.parse(rawUser) as UserSession
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export const clearUserSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}
