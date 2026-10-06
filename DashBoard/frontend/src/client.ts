import axios from 'axios'

export type UserSession = {
  id: string
  email: string
}

export const AUTH_STORAGE_KEY = 'dashboard_user'

export const api = axios.create({
  baseURL: 'http://localhost:8080',
})

// Nest answers errors as { statusCode, message }. `message` is a string for
// errors we throw ("Connect your github account first") and an array of
// strings when ValidationPipe rejects the request body.
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
    return JSON.parse(rawUser) as UserSession
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export const clearUserSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}
