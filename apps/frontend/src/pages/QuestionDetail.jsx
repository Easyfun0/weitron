import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getGroup,
  getGroupMedia,
  uploadMedia,
  getMediaUrl,
} from "../services/api.js";

// 題組詳情頁：烹調指引 / 材料清點 / 刀工規格 三分頁 + 操作影片區塊
export default function QuestionDetail() {
  const { id: code } = useParams();
  const [group, setGroup] = useState(null);
  const [tab, setTab] = useState("dishes");

  const [videos, setVideos] = useState([]);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const isAdmin = !!localStorage.getItem("admin_token");

  useEffect(() => {
    getGroup(code).then((res) => setGroup(res.data));
  }, [code]);

  const loadMedia = () => {
    getGroupMedia(code).then((res) =>
      setVideos(res.data.filter((m) => m.media_type === "video"))
    );
  };

  useEffect(() => {
    loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !group) return;
    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("owner_type", "group");
      formData.append("owner_id", group.id);
      formData.append("caption", caption);
      formData.append("file", file);
      await uploadMedia(formData);
      setFile(null);
      setCaption("");
      e.target.reset();
      loadMedia();
    } catch (err) {
      setUploadError(
        err.response?.data?.detail || "上傳失敗，請確認檔案格式與大小"
      );
    } finally {
      setUploading(false);
    }
  };

  if (!group) return <p className="p-4">載入中...</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-1">
        {group.code}　{group.title}
      </h1>
      {/* <Link to={`/practice/${code}`} className="text-blue-600 text-sm">
        進入練習模式 →
      </Link> */}

      <div className="flex gap-4 border-b mt-4 mb-4 text-sm">
        {[
          ["dishes", "烹調指引"],
          ["materials", "材料清點清單"],
          ["knifework", "刀工規格清單"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-2 ${tab === key ? "border-b-2 border-blue-600 font-medium" : "text-gray-400"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "dishes" && (
        <div className="space-y-4">
          {group.dishes?.map((d) => (
            <div key={d.id} className="border rounded p-3">
              <p className="font-medium">{d.name}</p>
              <p className="text-sm text-gray-500">
                刀工：{d.main_cut}　烹調法：{d.method}　主材料：
                {d.main_ingredient}
              </p>
              {d.ingredients?.length > 0 && (
                <p className="text-sm mt-1">
                  材料組合：{d.ingredients.join("、")}
                </p>
              )}
              {d.cooking_steps?.length > 0 && (
                <ul className="text-sm mt-1 list-disc list-inside">
                  {d.cooking_steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              )}
              {d.seasoning && (
                <p className="text-sm text-gray-500 mt-1">
                  調味：{d.seasoning}
                </p>
              )}
              {d.notes && (
                <p className="text-sm text-red-500 mt-1">備註：{d.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
      {tab === "materials" && (
        <ul className="text-sm space-y-1">
          {group.material_items?.map((m) => (
            <li key={m.id}>
              {m.name}（{m.spec}）— {m.qty}
              {m.note ? `　備註：${m.note}` : ""}
            </li>
          ))}
        </ul>
      )}
      {tab === "knifework" && (
        <div>
          <ul className="text-sm space-y-1">
            {group.knife_work_items?.map((k) => (
              <li key={k.id}>
                {k.material}（{k.spec}）— {k.qty}
                {k.note ? `　備註：${k.note}` : ""}
              </li>
            ))}
          </ul>
          {group.plating_options?.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="font-medium text-sm mb-1">指定盤飾（3 選 2）</p>
              <ul className="text-sm space-y-1">
                {group.plating_options.map((opt, i) => (
                  <li key={i}>{opt}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 pt-6 border-t">
        <h2 className="font-bold mb-3">操作影片</h2>

        {videos.length === 0 && (
          <p className="text-sm text-gray-400 mb-4">尚無操作影片</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {videos.map((v) => (
            <div key={v.id}>
              <video
                controls
                className="w-full rounded border"
                src={getMediaUrl(v.file_url)}
              />
              {v.caption && (
                <p className="text-xs text-gray-500 mt-1">{v.caption}</p>
              )}
            </div>
          ))}
        </div>

        {isAdmin && (
          <form
            onSubmit={handleUpload}
            className="border rounded p-3 space-y-2 text-sm max-w-sm"
          >
            <p className="font-medium">新增操作影片（管理員）</p>
            {uploadError && <p className="text-red-500">{uploadError}</p>}
            <input
              type="file"
              accept="video/mp4,video/quicktime"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm"
            />
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="影片說明（選填）"
              className="w-full border rounded px-2 py-1"
            />
            <button
              type="submit"
              disabled={uploading || !file}
              className="bg-blue-600 text-white px-3 py-1.5 rounded disabled:opacity-50"
            >
              {uploading ? "上傳中..." : "上傳影片"}
            </button>
            <p className="text-xs text-gray-400">
              限 mp4 / mov 格式，檔案大小上限 100MB
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
