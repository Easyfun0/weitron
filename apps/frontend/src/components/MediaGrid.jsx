import { useState } from "react";
import { getMediaUrl } from "../services/api.js";

// 共用的縮圖格線，DishMediaPanel（導師範例）、StudentMediaPanel（學員自己上傳）、
// GroupReferenceImages（水花/盤飾參考圖）都會用到。
// 手機螢幕縮圖太小看不清楚，點圖片會跳出放大檢視。
export default function MediaGrid({ label, items, onDelete, isVideo, canDelete }) {
  const [zoomed, setZoomed] = useState(null);

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
                  className="w-full object-cover rounded border cursor-zoom-in"
                  src={getMediaUrl(m.file_url)}
                  alt={m.caption || ""}
                  onClick={() => setZoomed(m)}
                />
              )}
              {canDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(m.id);
                  }}
                  className="absolute top-0.5 right-0.5 bg-red-500 text-white text-xs leading-none rounded px-1 py-0.5"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setZoomed(null)}
        >
          <img
            src={getMediaUrl(zoomed.file_url)}
            alt={zoomed.caption || ""}
            className="max-w-full max-h-full object-contain rounded"
          />
          <button
            type="button"
            onClick={() => setZoomed(null)}
            className="absolute top-3 right-4 text-white text-3xl leading-none"
            aria-label="關閉"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
