import axios from 'axios'

// 統一管理 API 請求，baseURL 由 .env 的 VITE_API_BASE_URL 提供
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
})

// /admin/* 一定帶 admin_token；其他路徑（含 /groups/{code}/media 這種公開端點）優先帶 student_token，
// 這樣後端才知道「目前是哪個學員在看」，才能把他自己上傳的私人照片/影片一起回傳；
// 沒有學員登入就退回 admin_token（方便管理員在前台頁面預覽也能正常運作）
api.interceptors.request.use((config) => {
  const isAdminOnlyRoute = config.url?.startsWith('/admin')
  const studentToken = localStorage.getItem('student_token')
  const adminToken = localStorage.getItem('admin_token')
  const token = isAdminOnlyRoute ? adminToken : (studentToken || adminToken)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// token 過期或失效時，後端一律回 401。學員/管理員登入太久沒動作、token 過期後，
// 畫面右上角原本還是顯示「已登入」，但實際上傳/存筆記都會失敗，使用者搞不清楚發生什麼事。
// 這裡攔截所有 401，主動清掉失效的 token 並導回登入頁、帶提示，而不是讓它悄悄失敗。
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''
    const isAuthEndpoint =
      url.startsWith('/auth/login') ||
      url.startsWith('/student/login') ||
      url.startsWith('/student/signup') ||
      url.startsWith('/admin/login')

    if (status === 401 && !isAuthEndpoint) {
      const isAdminRoute = url.startsWith('/admin')
      if (isAdminRoute) {
        localStorage.removeItem('admin_token')
      } else {
        localStorage.removeItem('student_token')
        localStorage.removeItem('student_username')
      }
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=1'
      }
    }
    return Promise.reject(error)
  },
)

export const getGroups = () => api.get('/groups')
export const getGroup = (code) => api.get(`/groups/${code}`)
export const getGroupMedia = (code) => api.get(`/groups/${code}/media`)

// 學員/管理員共用同一個登入入口，後端回傳 role 讓前端決定導去後台還是導回原本頁面
export const authLogin = (username, password) => api.post('/auth/login', { username, password })
// 註冊一律是建立學員帳號（管理員帳號不開放自行註冊）
export const studentSignup = (username, password) => api.post('/student/signup', { username, password })
// 筆記綁定「單一菜餚」而非整個題組，跟著該道菜顯示（例如鹽糖用量、煮多久等個人重點）
export const getNote = (dishId) => api.get(`/notes/dish/${dishId}`)
export const saveNote = (dishId, content) => api.put(`/notes/dish/${dishId}`, { content })

export const createQuestionGroup = (payload) => api.post('/admin/questions', payload)
export const updateQuestionGroup = (code, payload) => api.put(`/admin/questions/${code}`, payload)
export const deleteQuestionGroup = (code) => api.delete(`/admin/questions/${code}`)

// 導師範例（管理員上傳，任何人都能看到）
export const uploadMedia = (formData, onUploadProgress) =>
  api.post('/admin/media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  })
export const deleteMedia = (mediaId) => api.delete(`/admin/media/${mediaId}`)

// 學員自己的照片/影片（跟著自己的帳號，只有本人登入才看得到）
export const uploadStudentMedia = (formData, onUploadProgress) =>
  api.post('/student/media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  })
export const deleteStudentMedia = (mediaId) => api.delete(`/student/media/${mediaId}`)

// 正式環境圖片/影片存在 Supabase Storage，file_url 本身就是完整網址，直接回傳即可；
// 本地開發沒設定 Supabase 時，後端還是走 /uploads 靜態目錄，回傳的是相對路徑，要補上後端網址
const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '')
export const getMediaUrl = (fileUrl) =>
  fileUrl.startsWith('http://') || fileUrl.startsWith('https://') ? fileUrl : `${API_ORIGIN}${fileUrl}`

export default api
