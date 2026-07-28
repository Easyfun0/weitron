import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getGroup, getGroupMedia } from "../services/api.js";
import DishMediaPanel from "../components/DishMediaPanel.jsx";
import StudentMediaPanel from "../components/StudentMediaPanel.jsx";
import DishNote from "../components/DishNote.jsx";
import GroupReferenceImages from "../components/GroupReferenceImages.jsx";
import DishCuttingReferenceTable from "../components/DishCuttingReferenceTable.jsx";

// 題組詳情頁：烹調指引（含每道菜的步驟照片/完成圖/影片/個人筆記） / 材料清點 / 刀工規格 三分頁
export default function QuestionDetail() {
  const { id: code } = useParams();
  const [group, setGroup] = useState(null);
  const [tab, setTab] = useState("dishes");
  const [media, setMedia] = useState([]);

  const isAdmin = !!localStorage.getItem("admin_token");

  useEffect(() => {
    getGroup(code).then((res) => setGroup(res.data));
  }, [code]);

  const loadMedia = () => {
    getGroupMedia(code).then((res) => setMedia(res.data));
  };

  useEffect(() => {
    loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

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
              <DishNote dishId={d.id} />
              <StudentMediaPanel
                dishId={d.id}
                allMedia={media}
                onChanged={loadMedia}
              />
              <DishMediaPanel
                dishId={d.id}
                allMedia={media}
                onChanged={loadMedia}
                canManage={isAdmin}
              />
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
          <DishCuttingReferenceTable dishes={group.dishes} />

          <p className="font-medium text-sm mb-1">規格明細</p>
          <ul className="text-sm space-y-1">
            {group.knife_work_items?.map((k) => (
              <li key={k.id}>
                {k.material}（{k.spec}）— {k.qty}
                {k.note ? `　備註：${k.note}` : ""}
              </li>
            ))}
          </ul>

          <GroupReferenceImages
            groupId={group.id}
            category="water_flower"
            label="水花參考圖"
            allMedia={media}
            onChanged={loadMedia}
            canManage={isAdmin}
          />

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

          <GroupReferenceImages
            groupId={group.id}
            category="plating"
            label="盤飾參考圖"
            allMedia={media}
            onChanged={loadMedia}
            canManage={isAdmin}
          />
        </div>
      )}
    </div>
  );
}
