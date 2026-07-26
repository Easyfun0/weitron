import axios from 'axios'

// 統一管理 API 請求，baseURL 由 .env 的 VITE_API_BASE_URL 提供
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
})

// 後台管理 API 帶上 JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const getGroups = () => api.get('/groups')
export const getGroup = (code) => api.get(`/groups/${code}`)
export const getGroupMedia = (code) => api.get(`/groups/${code}/media`)
export const adminLogin = (username, password) => api.post('/admin/login', { username, password })

export const createQuestionGroup = (payload) => api.post('/admin/questions', payload)
export const updateQuestionGroup = (code, payload) => api.put(`/admin/questions/${code}`, payload)
export const deleteQuestionGroup = (code) => api.delete(`/admin/questions/${code}`)

export const uploadMedia = (formData) =>
  api.post('/admin/media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const deleteMedia = (mediaId) => api.delete(`/admin/media/${mediaId}`)

// 影片/圖片實際檔案由後端 /uploads 靜態目錄提供，跟 /api 不同路徑，需去掉 baseURL 的 /api 後綴組合網址
const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '')
export const getMediaUrl = (fileUrl) => `${API_ORIGIN}${fileUrl}`

export default api
