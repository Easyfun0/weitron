import { useEffect, useRef, useState } from "react";
import { getNote, saveNote } from "../services/api.js";

// 單一菜餚的個人筆記（鹽/糖用量、煮多久、火候等）。
// 整個區塊只有登入學員帳號才會出現；沒登入時完全不顯示（含提示文字），
// 入口統一交給頁面上方的「登入」連結。
export default function DishNote({ dishId }) {
  const [studentUsername] = useState(
    localStorage.getItem("student_username") || "",
  );
  const [note, setNote] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState("");
  const saveTimer = useRef(null);

  useEffect(() => {
    if (!studentUsername) return;
    getNote(dishId).then((res) => {
      setNote(res.data.content || "");
      setLoaded(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dishId, studentUsername]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const handleChange = (value) => {
    setNote(value);
    setStatus("儲存中...");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await saveNote(dishId, value);
        setStatus("已儲存");
      } catch {
        setStatus("儲存失敗，請確認網路連線");
      }
    }, 800);
  };

  if (!studentUsername) return null;

  return (
    <div className="mt-3 pt-3 border-t">
      <p className="text-xs font-medium text-gray-600 mb-1">我的筆記</p>
      <textarea
        value={note}
        onChange={(e) => handleChange(e.target.value)}
        rows={2}
        disabled={!loaded}
        className="w-full border rounded px-2 py-1 text-sm bg-yellow-50 disabled:opacity-60"
      />
      {status && <p className="text-xs text-gray-400 mt-0.5">{status}</p>}
    </div>
  );
}
