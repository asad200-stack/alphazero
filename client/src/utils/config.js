// API and Image URLs configuration
const API_URL = import.meta.env.VITE_API_URL || ''
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

export const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${BACKEND_URL}${path}`
}

export const getApiUrl = () => API_URL || '/api'

export default {
  API_URL,
  BACKEND_URL,
  getImageUrl,
  getApiUrl
}


