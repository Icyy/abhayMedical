const API_BASE_URL = 'http://localhost:5000/api'

const getToken = () => localStorage.getItem('meditrack_token')

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken()

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Something went wrong')
  }

  return response.json()
}