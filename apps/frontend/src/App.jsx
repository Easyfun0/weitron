import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header.jsx'
import Footer from './components/layout/Footer.jsx'
import AdminLayout from './components/layout/AdminLayout.jsx'
import QuestionList from './pages/QuestionList.jsx'
import QuestionDetail from './pages/QuestionDetail.jsx'
import PracticeMode from './pages/PracticeMode.jsx'
import QuestionManage from './pages/admin/QuestionManage.jsx'
import QuestionEditor from './pages/admin/QuestionEditor.jsx'
import Login from './pages/StudentLogin.jsx'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        <Route path="/" element={<><Header /><main className="flex-1"><QuestionList /></main><Footer /></>} />
        <Route path="/questions/:id" element={<><Header /><main className="flex-1"><QuestionDetail /></main><Footer /></>} />
        <Route path="/practice/:id" element={<><Header /><main className="flex-1"><PracticeMode /></main><Footer /></>} />

        {/* 學員跟管理員共用同一個登入入口，登入後由後端回傳的 role 決定導去哪裡；
            舊路徑保留讓其他書籤/連結還能用 */}
        <Route path="/login" element={<Login />} />
        <Route path="/student/login" element={<Login />} />
        <Route path="/admin/login" element={<Login />} />

        <Route path="/admin/questions" element={<AdminLayout><QuestionManage /></AdminLayout>} />
        <Route path="/admin/questions/:id" element={<AdminLayout><QuestionEditor /></AdminLayout>} />
      </Routes>
    </div>
  )
}

export default App
