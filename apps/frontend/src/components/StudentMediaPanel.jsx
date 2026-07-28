import { useState } from "react";
import { uploadStudentMedia, deleteStudentMedia } from "../services/api.js";
import MediaGrid from "./MediaGrid.jsx";

export default function StudentMediaPanel({ dishId, allMedia, onChanged }) {
  const isStudent = !!localStorage.getItem("student_token");

  const items = allMedia.filter(
    (m) =>
      m.owner_type === "dish" && m.owner_id === dishId && m.student_id != null,
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

  if (!isStudent) return null;

  const handleUpload = async (e) => {
    e.preventDefault();
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
      await uploadStudentMedia(formData, (progressEvent) => {
        if (!progressEvent.total) return;
        setUploadProgress(
          Math.round((progressEvent.loaded / progressEvent.total) * 100),
        );
      });
      setFile(null);
      setCaption("");
      e.target.reset();
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
    await deleteStudentMedia(mediaId);
    onChanged();
  };

  return (
    <div className="mt-3 pt-3 border-t space-y-2">
      <p className="text-xs font-medium text-gray-600">我的照片／影片</p>

      {items.length === 0 && (
        <p className="text-xs text-gray-400">還沒有上傳自己練習的照片／影片</p>
      )}

      <MediaGrid
        label="步驟照片"
        items={stepPhotos}
        onDelete={handleDelete}
        canDelete
      />
      <MediaGrid
        label="完成圖"
        items={finishedPhotos}
        onDelete={handleDelete}
        canDelete
      />
      <MediaGrid
        label="操作影片"
        items={videos}
        onDelete={handleDelete}
        canDelete
        isVideo
      />

      <form
        onSubmit={handleUpload}
        className="flex flex-wrap items-center gap-2 text-xs"
      >
        {error && <p className="text-red-500 w-full">{error}</p>}
        <input
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
    </div>
  );
}
