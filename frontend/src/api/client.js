import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// API v1 prefix
export const apiV1 = axios.create({
  baseURL: `${baseURL}/v1`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Add auth token from localStorage (Sanctum)
apiV1.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default apiV1
