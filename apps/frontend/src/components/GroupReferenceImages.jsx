import { useState } from "react";
import { uploadMedia, deleteMedia } from "../services/api.js";
import MediaGrid from "./MediaGrid.jsx";

// 題組層級的參考圖片，對應刀工作品規格卡裡「指定圖」的部分：
// 水花參考圖（紅蘿蔔水花片指定款）、盤飾參考圖（3選2）。
// 管理員上傳，任何人（含未登入）都能看到；用 category 區分是水花還是盤飾。
export default function GroupReferenceImages({
  groupId,
  category, // "water_flower" | "plating"
  label,
  allMedia,
  onChanged,
  canManage = false,
}) {
  const items = allMedia.filter(
    (m) => m.owner_type === "group" && m.owner_id === groupId && m.category === category,
  );

  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setError(null);
    setUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append("owner_type", "group");
      formData.append("owner_id", groupId);
      formData.append("caption", caption);
      formData.append("category", category);
      formData.append("file", file);
      await uploadMedia(formData, (progressEvent) => {
        if (!progressEvent.total) return;
        setUploadProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
      });
      setFile(null);
      setCaption("");
      e.target.reset();
      onChanged();
    } catch (err) {
      setError(err.response?.data?.detail || "上傳失敗，請確認檔案格式");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (mediaId) => {
    if (!confirm("確定要刪除這張參考圖嗎？此動作無法復原。")) return;
    await deleteMedia(mediaId);
    onChanged();
  };

  if (!canManage && items.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t space-y-2">
      {items.length === 0 ? (
        <p className="text-sm font-medium text-gray-600">
          {label}<span className="text-xs text-gray-400 font-normal">（尚無）</span>
        </p>
      ) : (
        <MediaGrid label={label} items={items} onDelete={handleDelete} canDelete={canManage} />
      )}

      {canManage && (
        <form
          onSubmit={handleUpload}
          className="flex flex-wrap items-center gap-2 text-xs"
        >
          {error && <p className="text-red-500 w-full">{error}</p>}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files[0])}
            disabled={uploading}
          />
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="說明（選填，例如：指定款1）"
            className="border rounded px-2 py-1 flex-1 min-w-[100px]"
            disabled={uploading}
          />
          <button
            type="submit"
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
        </form>
      )}
    </div>
  );
}
