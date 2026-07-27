import { useEffect, useState } from 'react'
import { getGroups } from '../services/api.js'
import QuestionCard from '../components/QuestionCard.jsx'

// 題目總覽頁：24 個題組卡片列表，可搜尋/篩選
export default function QuestionList() {
  const [groups, setGroups] = useState([])
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getGroups()
      .then((res) => {
        if (Array.isArray(res.data)) {
          setGroups(res.data)
        } else {
          // 後端回傳的不是陣列（例如錯誤訊息物件），避免下面 .filter 直接炸掉
          setGroups([])
          setError('後端回傳格式異常，請確認 API 是否正常')
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = groups.filter(
    (g) => g.title.includes(keyword) || g.code.includes(keyword)
  )

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">題組總覽</h1>
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="搜尋題組編號或菜名..."
        className="w-full border rounded px-3 py-2 mb-4"
      />
      {loading && <p>載入中...</p>}
      {error && <p className="text-red-500">載入失敗：{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((g) => (
          <QuestionCard key={g.code} group={g} />
        ))}
      </div>
    </div>
  )
}
