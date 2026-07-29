import { useRef, useState } from "react";
import { uploadMedia, deleteMedia } from "../services/api.js";
import MediaGrid from "./MediaGrid.jsx";

// 單一菜餚底下「導師範例」的照片／影片：步驟照片、完成圖、操作影片，皆不限張數。
// 這是管理員上傳的公開示範內容，任何人（含未登入）都能看到；
// 學員自己上傳的私人照片/影片走 StudentMediaPanel，不會混在這裡。
// canManage=false 時只顯示、不提供上傳/刪除（給非管理員瀏覽用）
export default function DishMediaPanel({
  dishId,
  allMedia,
  onChanged,
  canManage = false,
}) {
  const items = allMedia.filter(
    (m) => m.owner_type === "dish" && m.owner_id === dishId && m.student_id == null,
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const isImageFile = file && file.type.startsWith("image/");
  const hasAnyMedia = items.length > 0;
  const fileInputRef = useRef(null);

  const handleUpload = async () => {
    if (!file) return;
    setError(null);
    setUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append("owner_type", "dish");
      formData.append("owner_id", dishId);
      formData.append("caption", caption);
      if (isImageFile) formData.append("category", category);
      formData.append("file", file);
      await uploadMedia(formData, (progressEvent) => {
        if (!progressEvent.total) return;
        setUploadProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
      });
      setFile(null);
      setCaption("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      onChanged();
    } catch (err) {
      setError(err.response?.data?.detail || "上傳失敗，請確認檔案格式與大小");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (mediaId) => {
    if (!confirm("確定要刪除這個檔案嗎？此動作無法復原。")) return;
    await deleteMedia(mediaId);
    onChanged();
  };

  if (!canManage && !hasAnyMedia) return null;

  return (
    <div className="mt-3 pt-3 border-t space-y-2">
      <p className="text-xs font-medium text-gray-600">導師範例照片／影片</p>

      {!hasAnyMedia && <p className="text-xs text-gray-400">尚無導師範例</p>}

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
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {error && <p className="text-red-500 w-full">{error}</p>}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
            onChange={(e) => setFile(e.target.files[0])}
            disabled={uploading}
          />
          {isImageFile && (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded px-1.5 py-1"
              disabled={uploading}
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
            disabled={uploading}
          />
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || !file}
            className="bg-blue-600 text-white px-2.5 py-1 rounded disabled:opacity-50 min-w-[72px]"
          >
            {uploading ? `上傳中 ${uploadProgress}%` : "上傳"}
          </button>
          {uploading && (
            <div className="w-full h-1.5 bg-gray-200 rounded overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
