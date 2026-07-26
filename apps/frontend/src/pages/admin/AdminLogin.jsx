import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '../../services/api.js'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await adminLogin(username, password)
      localStorage.setItem('admin_token', res.data.access_token)
      navigate('/admin/questions')
    } catch (err) {
      setError('登入失敗，請檢查帳號密碼')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-80 space-y-3">
        <h1 className="font-bold text-lg mb-2">後台登入</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="帳號"
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密碼"
          className="w-full border rounded px-3 py-2"
        />
        <button type="submit" className="w-full bg-blue-600 text-white rounded py-2">
          登入
        </button>
      </form>
    </div>
  )
}
