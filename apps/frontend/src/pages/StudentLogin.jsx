import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authLogin, studentSignup } from "../services/api.js";

// 學員跟管理員共用同一個登入入口：登入時後端會回傳 role，
// role 是 admin 就導去後台，是 student 就導回原本在看的頁面。
// 註冊一律是建立學員帳號（管理員帳號不開放自行註冊）。
export default function StudentLogin() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        const res = await authLogin(username, password);
        const { role, username: name, access_token } = res.data;
        if (role === "admin") {
          localStorage.setItem("admin_token", access_token);
          navigate("/admin/questions");
        } else {
          localStorage.setItem("student_token", access_token);
          localStorage.setItem("student_username", name);
          navigate(location.state?.from || "/");
        }
      } else {
        const res = await studentSignup(username, password);
        localStorage.setItem("student_token", res.data.access_token);
        localStorage.setItem("student_username", res.data.username);
        navigate(location.state?.from || "/");
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          (mode === "login" ? "登入失敗，請檢查帳號密碼" : "註冊失敗"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-80 space-y-3"
      >
        <Link to="/" className="text-xs text-gray-400">
          ← 回題組總覽
        </Link>
        <h1 className="font-bold text-lg mb-1">
          {mode === "login" ? "登入" : "註冊"}
        </h1>
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
        <button
          type="submit"
          disabled={submitting || !username || !password}
          className="w-full bg-blue-600 text-white rounded py-2 disabled:opacity-50"
        >
          {submitting ? "處理中..." : mode === "login" ? "登入" : "註冊"}
        </button>
        {mode === "login" && (
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className="w-full text-sm text-gray-500"
          >
            還沒有帳號？註冊一個
          </button>
        )}
        {mode === "signup" && (
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className="w-full text-sm text-gray-500"
          >
            已經有帳號了？登入
          </button>
        )}
      </form>
    </div>
  );
}
