import { Link } from 'react-router-dom'

export default function QuestionCard({ group }) {
  return (
    <Link
      to={`/questions/${group.code}`}
      className="block border rounded-lg p-4 hover:shadow-md transition bg-white"
    >
      <p className="text-sm text-gray-400">{group.code}</p>
      <p className="font-medium">{group.title}</p>
    </Link>
  )
}
