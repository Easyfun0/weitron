import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getGroup } from '../services/api.js'
import StepChecklist from '../components/StepChecklist.jsx'
import Timer from '../components/Timer.jsx'

// 練習模式頁：checklist + 計時器
export default function PracticeMode() {
  const { id: code } = useParams()
  const [group, setGroup] = useState(null)

  useEffect(() => {
    getGroup(code).then((res) => setGroup(res.data))
  }, [code])

  if (!group) return <p className="p-4">載入中...</p>

  const allSteps = (group.dishes || []).flatMap((d) => d.cooking_steps || [])

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-2">{group.code} 練習模式</h1>
      <Timer minutes={group.time_limit_minutes || 90} />
      <div className="mt-4">
        <StepChecklist steps={allSteps} />
      </div>
    </div>
  )
}
