import { useEffect, useState } from "react";
import { getStudents } from "../../services/api.js";

// 後台學員清單：顯示目前註冊總人數 + 帳號列表
export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudents()
      .then((res) => {
        setStudents(res.data.students);
        setTotal(res.data.total);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">會員</h1>

      {loading ? (
        <p className="text-sm text-gray-500">載入中...</p>
      ) : (
        <>
          {/* <p className="text-sm text-gray-600 mb-3">
            目前共有 <span className="font-bold text-lg text-blue-600">{total}</span> 人註冊
          </p> */}

          {students.length === 0 ? (
            <p className="text-sm text-gray-400">還沒有學員註冊</p>
          ) : (
            <table className="w-full text-sm border-collapse max-w-md">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 w-16">#</th>
                  <th>帳號</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="py-2 text-gray-400">{s.id}</td>
                    <td>{s.username}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
