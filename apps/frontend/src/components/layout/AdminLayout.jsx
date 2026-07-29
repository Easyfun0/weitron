import { useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { resetFontSize } from "../../utils/fontSize.js";

// 簡易後台驗證守衛：沒有 token 就導回登入頁
export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("admin_token");

  // 後台一律用標準字級，不受前台「文字大小」設定影響
  useEffect(() => {
    resetFontSize();
  }, []);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-48 bg-gray-900 text-white p-4 flex flex-col">
        <p className="font-bold mb-4">後台管理</p>
        <nav className="flex flex-col gap-2 text-sm flex-1">
          <Link to="/admin/questions">題組管理</Link>
          <Link to="/admin/students">會員清單</Link>
        </nav>
        <div className="flex flex-col gap-2 text-sm pt-4 border-t border-gray-700">
          <Link to="/">← 回前台</Link>
          <button onClick={handleLogout} className="text-left text-red-400">
            登出
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
