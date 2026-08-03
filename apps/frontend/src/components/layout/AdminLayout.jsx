import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { resetFontSize } from "../../utils/fontSize.js";

// 簡易後台驗證守衛：沒有 token 就導回登入頁
export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("admin_token");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* 手機版頂欄：漢堡選單開側邊欄 + 右上角回前台捷徑；桌機版側邊欄本來就常駐，不需要這條 */}
      <div className="md:hidden flex items-center justify-between bg-gray-900 text-white p-3">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="開啟選單"
          className="text-2xl leading-none px-1"
        >
          ☰
        </button>
        <p className="font-bold">後台管理</p>
        <Link to="/" className="text-sm text-gray-300">
          回前台
        </Link>
      </div>

      {/* 手機版側邊欄打開時的背景遮罩，點擊空白處可關閉 */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`w-48 bg-gray-900 text-white p-4 flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <p className="font-bold mb-4 hidden md:block">後台管理</p>
        <nav className="flex flex-col gap-2 text-sm flex-1">
          <Link to="/admin/questions" onClick={() => setSidebarOpen(false)}>
            題組管理
          </Link>
          <Link to="/admin/students" onClick={() => setSidebarOpen(false)}>
            會員清單
          </Link>
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
