import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header.jsx'
import Footer from './components/layout/Footer.jsx'
import AdminLayout from './components/layout/AdminLayout.jsx'
import QuestionList from './pages/QuestionList.jsx'
import QuestionDetail from './pages/QuestionDetail.jsx'
import PracticeMode from './pages/PracticeMode.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import QuestionManage from './pages/admin/QuestionManage.jsx'
import QuestionEditor from './pages/admin/QuestionEditor.jsx'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        <Route path="/" element={<><Header /><main className="flex-1"><QuestionList /></main><Footer /></>} />
        <Route path="/questions/:id" element={<><Header /><main className="flex-1"><QuestionDetail /></main><Footer /></>} />
        <Route path="/practice/:id" element={<><Header /><main className="flex-1"><PracticeMode /></main><Footer /></>} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/questions" element={<AdminLayout><QuestionManage /></AdminLayout>} />
        <Route path="/admin/questions/:id" element={<AdminLayout><QuestionEditor /></AdminLayout>} />
      </Routes>
    </div>
  )
}

export default App
