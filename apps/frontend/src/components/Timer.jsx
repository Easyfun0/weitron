import { useEffect, useState } from 'react'

// 內建倒數計時器，依考試時限（分鐘）
export default function Timer({ minutes = 0 }) {
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl font-mono">{mm}:{ss}</span>
      <button
        onClick={() => setRunning((r) => !r)}
        className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
      >
        {running ? '暫停' : '開始'}
      </button>
    </div>
  )
}
