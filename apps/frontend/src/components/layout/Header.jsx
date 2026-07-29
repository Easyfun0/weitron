import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FONT_SIZE_OPTIONS, applyFontSize, getStoredFontSize, FONT_SIZE_KEY } from '../../utils/fontSize.js'

export default function Header() {
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem('admin_token'))
  const [studentUsername, setStudentUsername] = useState(localStorage.getItem('student_username') || '')
  const [fontSize, setFontSize] = useState(getStoredFontSize())

  // 每次進到前台頁面（Header 掛載）都套用使用者上次選的字級，
  // 這樣從後台切回前台，或重新整理頁面，字級設定都不會不見
  useEffect(() => {
    applyFontSize(fontSize)
  }, [fontSize])

  const handleFontSizeChange = (e) => {
    const value = e.target.value
    setFontSize(value)
    localStorage.setItem(FONT_SIZE_KEY, value)
  }

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
    <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between flex-wrap gap-2">
      <Link to="/" className="font-bold text-lg">中餐丙級術科練習系統</Link>
      <nav className="text-sm text-gray-500 flex items-center gap-4">
        <select
          value={fontSize}
          onChange={handleFontSizeChange}
          className="border rounded px-1.5 py-1 text-xs text-gray-600"
          aria-label="文字大小"
        >
          {FONT_SIZE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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
