import { useState } from 'react'

// 依步驟顯示 checklist，可打勾記錄
export default function StepChecklist({ steps = [] }) {
  const [checked, setChecked] = useState({})

  const toggle = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <ul className="space-y-2">
      {steps.map((step) => (
        <li key={step.id} className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={!!checked[step.id]}
            onChange={() => toggle(step.id)}
            className="mt-1"
          />
          <span className={checked[step.id] ? 'line-through text-gray-400' : ''}>
            {step.description}
          </span>
        </li>
      ))}
    </ul>
  )
}
