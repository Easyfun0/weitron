import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
      <Link to="/" className="font-bold text-lg">中餐丙級術科練習系統</Link>
      <nav className="text-sm text-gray-500">
        <Link to="/admin/login">後台管理</Link>
      </nav>
    </header>
  )
}
