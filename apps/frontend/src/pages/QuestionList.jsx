import { useEffect, useState } from 'react'
import { getGroups } from '../services/api.js'
import QuestionCard from '../components/QuestionCard.jsx'

const GROUPS_CACHE_KEY = 'groups_cache_v1'

function readGroupsCache() {
  try {
    const cached = localStorage.getItem(GROUPS_CACHE_KEY)
    const parsed = cached ? JSON.parse(cached) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// 題目總覽頁：24 個題組卡片列表，可搜尋/篩選。
// Render 免費方案背景服務閒置一段時間會休眠，喚醒可能要等 30-50 秒，
// 這段時間先用上次成功抓到的清單顯示（存在 localStorage），不要整頁乾等轉圈圈；
// 背景照樣打 API 拿最新資料，拿到後悄悄換上，使用者不會感覺被卡住。
export default function QuestionList() {
  const [groups, setGroups] = useState(readGroupsCache)
  const hadCache = groups.length > 0
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(!hadCache)
  const [refreshing, setRefreshing] = useState(hadCache)
  const [error, setError] = useState(null)

  useEffect(() => {
    getGroups()
      .then((res) => {
        if (Array.isArray(res.data)) {
          setGroups(res.data)
          setError(null)
          try {
            localStorage.setItem(GROUPS_CACHE_KEY, JSON.stringify(res.data))
          } catch {
            // localStorage 滿了或被封鎖也沒關係，純粹是加速用的快取，失敗就跳過
          }
        } else if (!hadCache) {
          // 後端回傳的不是陣列（例如錯誤訊息物件），避免下面 .filter 直接炸掉
          setError('後端回傳格式異常，請確認 API 是否正常')
        }
      })
      .catch((err) => {
        // 已經有快取畫面可以先看，後端可能還在從休眠中醒來，先別顯示嚇人的錯誤訊息蓋掉畫面
        if (!hadCache) setError(err.message)
      })
      .finally(() => {
        setLoading(false)
        setRefreshing(false)
      })
    // 只在掛載時打一次，hadCache 只是拿掛載當下的快取狀態判斷要不要顯示錯誤，不需要重新觸發
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      {refreshing && !loading && (
        <p className="text-xs text-gray-400 mb-2">更新中...</p>
      )}
      {error && <p className="text-red-500">載入失敗：{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((g) => (
          <QuestionCard key={g.code} group={g} />
        ))}
      </div>
    </div>
  )
}
