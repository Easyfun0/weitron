import { getMediaUrl } from "../services/api.js";

// 共用的縮圖格線，DishMediaPanel（導師範例）跟 StudentMediaPanel（學員自己上傳）都會用到
export default function MediaGrid({ label, items, onDelete, isVideo, canDelete }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">
        {label}（{items.length}）
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {items.map((m) => (
          <div key={m.id}>
            {m.caption && (
              <p className="text-xs text-gray-600 mb-1 break-words">{m.caption}</p>
            )}
            <div className="relative">
              {isVideo ? (
                <video
                  controls
                  className="w-full object-cover rounded border"
                  src={getMediaUrl(m.file_url)}
                />
              ) : (
                <img
                  className="w-full object-cover rounded border"
                  src={getMediaUrl(m.file_url)}
                  alt={m.caption || ""}
                />
              )}
              {canDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(m.id)}
                  className="absolute top-0.5 right-0.5 bg-red-500 text-white text-xs leading-none rounded px-1 py-0.5"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
