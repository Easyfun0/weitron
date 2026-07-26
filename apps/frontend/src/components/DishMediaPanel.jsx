import { useState } from "react";
import { uploadMedia, deleteMedia, getMediaUrl } from "../services/api.js";

function MediaGrid({ label, items, onDelete, isVideo, canDelete }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">
        {label}（{items.length}）
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {items.map((m) => (
          <div key={m.id} className="relative">
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
        ))}
      </div>
    </div>
  );
}

// 單一菜餚底下的照片／影片：步驟照片、完成圖、操作影片，皆不限張數
// canManage=false 時只顯示、不提供上傳/刪除（給學員端使用）
export default function DishMediaPanel({
  dishId,
  allMedia,
  onChanged,
  canManage = false,
}) {
  const items = allMedia.filter(
    (m) => m.owner_type === "dish" && m.owner_id === dishId,
  );
  const stepPhotos = items.filter(
    (m) => m.media_type === "image" && m.category === "step",
  );
  const finishedPhotos = items.filter(
    (m) => m.media_type === "image" && m.category === "finished",
  );
  const videos = items.filter((m) => m.media_type === "video");

  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("step");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const isImageFile = file && file.type.startsWith("image/");
  const hasAnyMedia = items.length > 0;

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("owner_type", "dish");
      formData.append("owner_id", dishId);
      formData.append("caption", caption);
      if (isImageFile) formData.append("category", category);
      formData.append("file", file);
      await uploadMedia(formData);
      setFile(null);
      setCaption("");
      e.target.reset();
      onChanged();
    } catch (err) {
      setError(err.response?.data?.detail || "上傳失敗，請確認檔案格式與大小");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaId) => {
    await deleteMedia(mediaId);
    onChanged();
  };

  if (!canManage && !hasAnyMedia) return null;

  return (
    <div className="mt-3 pt-3 border-t space-y-2">
      <p className="text-xs font-medium text-gray-600">照片／影片</p>

      {!hasAnyMedia && <p className="text-xs text-gray-400">尚無照片／影片</p>}

      <MediaGrid
        label="步驟照片"
        items={stepPhotos}
        onDelete={handleDelete}
        canDelete={canManage}
      />
      <MediaGrid
        label="完成圖"
        items={finishedPhotos}
        onDelete={handleDelete}
        canDelete={canManage}
      />
      <MediaGrid
        label="操作影片"
        items={videos}
        onDelete={handleDelete}
        canDelete={canManage}
        isVideo
      />

      {canManage && (
        <form
          onSubmit={handleUpload}
          className="flex flex-wrap items-center gap-2 text-xs"
        >
          {error && <p className="text-red-500 w-full">{error}</p>}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
            onChange={(e) => setFile(e.target.files[0])}
          />
          {isImageFile && (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded px-1.5 py-1"
            >
              <option value="step">步驟照片</option>
              <option value="finished">完成圖</option>
            </select>
          )}
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="說明（選填）"
            className="border rounded px-2 py-1 flex-1 min-w-[100px]"
          />
          <button
            type="submit"
            disabled={uploading || !file}
            className="bg-blue-600 text-white px-2.5 py-1 rounded disabled:opacity-50"
          >
            {uploading ? "上傳中..." : "上傳"}
          </button>
        </form>
      )}
    </div>
  );
}
