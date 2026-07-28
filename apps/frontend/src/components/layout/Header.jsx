import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem('admin_token'))
  const [studentUsername, setStudentUsername] = useState(localStorage.getItem('student_username') || '')

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setIsAdmin(false)
    navigate('/')
  }

  const handleStudentLogout = () => {
    localStorage.removeItem('student_token')
    localStorage.removeItem('student_username')
    setStudentUsername('')
    navigate('/')
  }

  return (
    <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
      <Link to="/" className="font-bold text-lg">中餐丙級術科練習系統</Link>
      <nav className="text-sm text-gray-500 flex items-center gap-4">
        {isAdmin && (
          <>
            <Link to="/admin/questions">後台管理</Link>
            <button onClick={handleLogout} className="text-red-500">
              登出
            </button>
          </>
        )}
        {!isAdmin && studentUsername && (
          <>
            <span className="text-gray-400">學員：{studentUsername}</span>
            <button onClick={handleStudentLogout} className="text-red-500">
              登出
            </button>
          </>
        )}
        {!isAdmin && !studentUsername && <Link to="/login">登入</Link>}
      </nav>
    </header>
  )
}
