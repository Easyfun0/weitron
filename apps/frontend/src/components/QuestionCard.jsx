import { Link } from 'react-router-dom'

// showFavorite/isFavorite/onToggleFavorite：登入學員可以在卡片右上角標記「我的最愛／優先練習」，
// 標記過的題組會在總覽頁排到最前面。星星按鈕跟 Link 是同層級的兄弟元素（不是巢狀在 <a> 裡面），
// 避免互動元素巢狀互動元素的 HTML 問題（跟之前 <form> 巢狀 <form> 是同一類地雷）。
export default function QuestionCard({
  group,
  showFavorite = false,
  isFavorite = false,
  onToggleFavorite,
}) {
  return (
    <div className="relative border rounded-lg hover:shadow-md transition bg-white">
      <Link to={`/questions/${group.code}`} className="block p-4">
        <p className="text-sm text-gray-400">{group.code}</p>
        <p className="font-medium pr-6">{group.title}</p>
      </Link>
      {showFavorite && (
        <button
          type="button"
          onClick={() => onToggleFavorite(group.code)}
          aria-label={isFavorite ? '取消優先練習標記' : '標記為優先練習'}
          title={isFavorite ? '取消優先練習標記' : '標記為優先練習'}
          className={`absolute top-2 right-2 text-2xl leading-none px-1 ${
            isFavorite ? 'text-yellow-400' : 'text-gray-300 hover:text-gray-400'
          }`}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      )}
    </div>
  )
}
