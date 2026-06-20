import { apiRequest } from './api'

interface User {
  id: string
  name: string
  phone: string
  role: 'OWNER' | 'EMPLOYEE' | 'ADMIN'
}

interface AuthResponse {
  token: string
  user: User
}

export const login = async (phone: string, password: string): Promise<AuthResponse> => {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  })
  localStorage.setItem('meditrack_token', data.token)
  localStorage.setItem('meditrack_user', JSON.stringify(data.user))
  return data
}

export const logout = () => {
  localStorage.removeItem('meditrack_token')
  localStorage.removeItem('meditrack_user')
}

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem('meditrack_user')
  return stored ? JSON.parse(stored) : null
}

export const fetchMe = (): Promise<User> => {
  return apiRequest('/auth/me')
}