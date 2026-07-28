// 「菜名與食材切配依據」表：對照刀工作品規格卡最上方那張表，
// 菜餚名稱／主要刀工／烹調法／主材料類別／材料組合都直接沿用菜餚（Dish）本身的資料，
// 水花款式／盤飾款式兩欄則是後台可勾選的旗標，標示這道菜是否要參考本題組的水花/盤飾指定圖。
export default function DishCuttingReferenceTable({ dishes }) {
  if (!dishes || dishes.length === 0) return null;

  return (
    <div className="mb-4">
      <p className="font-medium text-sm mb-1">菜名與食材切配依據</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border px-2 py-1 text-left">菜餚名稱</th>
              <th className="border px-2 py-1 text-left">主要刀工</th>
              <th className="border px-2 py-1 text-left">烹調法</th>
              <th className="border px-2 py-1 text-left">主材料類別</th>
              <th className="border px-2 py-1 text-left">材料組合</th>
              <th className="border px-2 py-1 text-left">水花款式</th>
              <th className="border px-2 py-1 text-left">盤飾款式</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((d) => (
              <tr key={d.id}>
                <td className="border px-2 py-1">{d.name}</td>
                <td className="border px-2 py-1">{d.main_cut}</td>
                <td className="border px-2 py-1">{d.method}</td>
                <td className="border px-2 py-1">{d.main_ingredient}</td>
                <td className="border px-2 py-1">{(d.ingredients || []).join('、')}</td>
                <td className="border px-2 py-1">{d.has_water_flower ? '參考規格明細' : ''}</td>
                <td className="border px-2 py-1">{d.has_plating ? '參考規格明細' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
