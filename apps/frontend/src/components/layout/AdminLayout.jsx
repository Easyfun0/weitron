import { Link, Navigate } from 'react-router-dom'

// 簡易後台驗證守衛：沒有 token 就導回登入頁
export default function AdminLayout({ children }) {
  const token = localStorage.getItem('admin_token')
  if (!token) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-48 bg-gray-900 text-white p-4">
        <p className="font-bold mb-4">後台管理</p>
        <nav className="flex flex-col gap-2 text-sm">
          <Link to="/admin/questions">題組管理</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
