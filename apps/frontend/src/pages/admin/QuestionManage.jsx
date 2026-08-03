import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getGroups, deleteQuestionGroup } from "../../services/api.js";

// 後台題目管理列表：新增/編輯/刪除題組入口
export default function QuestionManage() {
  const [groups, setGroups] = useState([]);

  const load = () => {
    getGroups().then((res) => setGroups(res.data));
  };

  useEffect(load, []);

  const handleDelete = async (code) => {
    if (!confirm(`確定要刪除題組 ${code} 嗎？此動作無法復原。`)) return;
    await deleteQuestionGroup(code);
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">題組管理</h1>
        {/* <Link to="/admin/questions/new" className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm">
          + 新增題組
        </Link> */}
        <div class="hidden md:flex gap-2">
          <Link to="/">回前台</Link>
        </div>
      </div>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">編號</th>
            <th>題名</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={g.code} className="border-b">
              <td className="py-2">{g.code}</td>
              <td>{g.title}</td>
              <td className="space-x-3">
                <Link
                  to={`/admin/questions/${g.code}`}
                  className="text-blue-600"
                >
                  編輯
                </Link>
                {/* <button onClick={() => handleDelete(g.code)} className="text-red-500">刪除</button> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
