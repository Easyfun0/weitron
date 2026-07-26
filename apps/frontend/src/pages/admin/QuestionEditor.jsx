import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getGroup,
  createQuestionGroup,
  updateQuestionGroup,
  getGroupMedia,
  uploadMedia,
  deleteMedia,
  getMediaUrl,
} from '../../services/api.js'

const emptyDish = () => ({
  name: '',
  main_cut: '',
  method: '',
  main_ingredient: '',
  ingredients: [],
  cooking_steps: [],
  seasoning: '',
  notes: '',
})

const emptyMaterial = () => ({ name: '', spec: '', qty: '', note: '' })
const emptyKnifeWork = () => ({ material: '', spec: '', qty: '', note: '' })

// 陣列欄位（材料組合 / 烹調步驟 / 盤飾）用「一行一項」的 textarea 編輯，存檔時再拆成陣列
const linesToArray = (text) =>
  text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

export default function QuestionEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [form, setForm] = useState({
    code: '',
    title: '',
    dishes: [emptyDish()],
    material_items: [],
    knife_work_items: [],
    plating_options: [],
  })
  const [groupDbId, setGroupDbId] = useState(null)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [media, setMedia] = useState([])
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaCaption, setMediaCaption] = useState('')
  const [mediaUploading, setMediaUploading] = useState(false)
  const [mediaError, setMediaError] = useState(null)

  useEffect(() => {
    if (isNew) return
    getGroup(id).then((res) => {
      const g = res.data
      setGroupDbId(g.id)
      setForm({
        code: g.code,
        title: g.title,
        dishes: g.dishes.length ? g.dishes : [emptyDish()],
        material_items: g.material_items,
        knife_work_items: g.knife_work_items,
        plating_options: g.plating_options || [],
      })
      setLoading(false)
    })
  }, [id, isNew])

  const loadMedia = () => {
    if (isNew) return
    getGroupMedia(id).then((res) => setMedia(res.data))
  }
  useEffect(loadMedia, [id, isNew])

  // --- 通用陣列欄位操作 ---
  const updateField = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const updateListItem = (listKey, index, field, value) => {
    setForm((f) => {
      const list = [...f[listKey]]
      list[index] = { ...list[index], [field]: value }
      return { ...f, [listKey]: list }
    })
  }
  const addListItem = (listKey, factory) =>
    setForm((f) => ({ ...f, [listKey]: [...f[listKey], factory()] }))
  const removeListItem = (listKey, index) =>
    setForm((f) => ({ ...f, [listKey]: f[listKey].filter((_, i) => i !== index) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!form.code.trim() || !form.title.trim()) {
      setError('題組編號與題名為必填')
      return
    }
    setSaving(true)
    try {
      if (isNew) {
        const res = await createQuestionGroup(form)
        navigate(`/admin/questions/${res.data.code}`)
      } else {
        await updateQuestionGroup(id, form)
        if (form.code !== id) {
          navigate(`/admin/questions/${form.code}`)
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || '儲存失敗')
    } finally {
      setSaving(false)
    }
  }

  const handleMediaUpload = async (e) => {
    e.preventDefault()
    if (!mediaFile || !groupDbId) return
    setMediaError(null)
    setMediaUploading(true)
    try {
      const formData = new FormData()
      formData.append('owner_type', 'group')
      formData.append('owner_id', groupDbId)
      formData.append('caption', mediaCaption)
      formData.append('file', mediaFile)
      await uploadMedia(formData)
      setMediaFile(null)
      setMediaCaption('')
      e.target.reset()
      loadMedia()
    } catch (err) {
      setMediaError(err.response?.data?.detail || '上傳失敗，請確認檔案格式與大小')
    } finally {
      setMediaUploading(false)
    }
  }

  const handleMediaDelete = async (mediaId) => {
    await deleteMedia(mediaId)
    loadMedia()
  }

  if (loading) return <p>載入中...</p>

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">{isNew ? '新增題組' : `編輯題組 ${id}`}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* 基本資料 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">題組編號（如 301-1）</label>
            <input
              value={form.code}
              onChange={(e) => updateField('code', e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">題名（3 道菜名組合）</label>
            <input
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm"
            />
          </div>
        </div>

        {/* 菜餚 / 烹調指引 */}
        <section>
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-medium">菜餚（烹調指引）</h2>
            <button
              type="button"
              onClick={() => addListItem('dishes', emptyDish)}
              className="text-sm text-blue-600"
            >
              + 新增菜餚
            </button>
          </div>
          <div className="space-y-3">
            {form.dishes.map((d, i) => (
              <div key={i} className="border rounded p-3 space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">菜餚 {i + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeListItem('dishes', i)}
                    className="text-xs text-red-500"
                  >
                    刪除
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    value={d.name}
                    onChange={(e) => updateListItem('dishes', i, 'name', e.target.value)}
                    placeholder="菜名"
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <input
                    value={d.main_cut}
                    onChange={(e) => updateListItem('dishes', i, 'main_cut', e.target.value)}
                    placeholder="主要刀工"
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <input
                    value={d.method}
                    onChange={(e) => updateListItem('dishes', i, 'method', e.target.value)}
                    placeholder="烹調法"
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <input
                    value={d.main_ingredient}
                    onChange={(e) => updateListItem('dishes', i, 'main_ingredient', e.target.value)}
                    placeholder="主材料"
                    className="border rounded px-2 py-1 text-sm"
                  />
                </div>
                <textarea
                  value={(d.ingredients || []).join('\n')}
                  onChange={(e) => updateListItem('dishes', i, 'ingredients', linesToArray(e.target.value))}
                  placeholder="材料組合（一行一項）"
                  rows={2}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
                <textarea
                  value={(d.cooking_steps || []).join('\n')}
                  onChange={(e) => updateListItem('dishes', i, 'cooking_steps', linesToArray(e.target.value))}
                  placeholder="烹調規定步驟（一行一步）"
                  rows={3}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
                <input
                  value={d.seasoning}
                  onChange={(e) => updateListItem('dishes', i, 'seasoning', e.target.value)}
                  placeholder="調味規定"
                  className="w-full border rounded px-2 py-1 text-sm"
                />
                <input
                  value={d.notes}
                  onChange={(e) => updateListItem('dishes', i, 'notes', e.target.value)}
                  placeholder="備註（扣分標準等）"
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>
            ))}
          </div>
        </section>

        {/* 材料清點清單 */}
        <section>
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-medium">材料清點清單</h2>
            <button
              type="button"
              onClick={() => addListItem('material_items', emptyMaterial)}
              className="text-sm text-blue-600"
            >
              + 新增材料
            </button>
          </div>
          <div className="space-y-2">
            {form.material_items.map((m, i) => (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
                <input
                  value={m.name}
                  onChange={(e) => updateListItem('material_items', i, 'name', e.target.value)}
                  placeholder="品名"
                  className="border rounded px-2 py-1 text-sm"
                />
                <input
                  value={m.spec}
                  onChange={(e) => updateListItem('material_items', i, 'spec', e.target.value)}
                  placeholder="規格"
                  className="border rounded px-2 py-1 text-sm"
                />
                <input
                  value={m.qty}
                  onChange={(e) => updateListItem('material_items', i, 'qty', e.target.value)}
                  placeholder="重量/數量"
                  className="border rounded px-2 py-1 text-sm"
                />
                <input
                  value={m.note}
                  onChange={(e) => updateListItem('material_items', i, 'note', e.target.value)}
                  placeholder="備註"
                  className="border rounded px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeListItem('material_items', i)}
                  className="text-xs text-red-500"
                >
                  刪除
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 刀工規格清單 */}
        <section>
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-medium">刀工規格清單</h2>
            <button
              type="button"
              onClick={() => addListItem('knife_work_items', emptyKnifeWork)}
              className="text-sm text-blue-600"
            >
              + 新增項目
            </button>
          </div>
          <div className="space-y-2">
            {form.knife_work_items.map((k, i) => (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
                <input
                  value={k.material}
                  onChange={(e) => updateListItem('knife_work_items', i, 'material', e.target.value)}
                  placeholder="材料/刀工項目"
                  className="border rounded px-2 py-1 text-sm"
                />
                <input
                  value={k.spec}
                  onChange={(e) => updateListItem('knife_work_items', i, 'spec', e.target.value)}
                  placeholder="規格描述"
                  className="border rounded px-2 py-1 text-sm"
                />
                <input
                  value={k.qty}
                  onChange={(e) => updateListItem('knife_work_items', i, 'qty', e.target.value)}
                  placeholder="數量規定"
                  className="border rounded px-2 py-1 text-sm"
                />
                <input
                  value={k.note}
                  onChange={(e) => updateListItem('knife_work_items', i, 'note', e.target.value)}
                  placeholder="備註"
                  className="border rounded px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeListItem('knife_work_items', i)}
                  className="text-xs text-red-500"
                >
                  刪除
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 指定盤飾 */}
        <section>
          <h2 className="font-medium mb-2">指定盤飾（3 選 2，一行一個選項）</h2>
          <textarea
            value={(form.plating_options || []).join('\n')}
            onChange={(e) => updateField('plating_options', linesToArray(e.target.value))}
            rows={3}
            className="w-full border rounded px-2 py-1 text-sm"
          />
        </section>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
        >
          {saving ? '儲存中...' : '儲存題組'}
        </button>
      </form>

      {/* 媒體上傳：新增題組時尚未有 group id，需先儲存一次才能上傳 */}
      <section className="mt-8 pt-6 border-t">
        <h2 className="font-medium mb-2">參考圖片／教學影片</h2>
        {isNew ? (
          <p className="text-sm text-gray-400">請先儲存題組後再上傳媒體檔案</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {media.map((m) => (
                <div key={m.id} className="border rounded p-2">
                  {m.media_type === 'video' ? (
                    <video controls className="w-full rounded" src={getMediaUrl(m.file_url)} />
                  ) : (
                    <img className="w-full rounded" src={getMediaUrl(m.file_url)} alt={m.caption || ''} />
                  )}
                  {m.caption && <p className="text-xs text-gray-500 mt-1">{m.caption}</p>}
                  <button
                    type="button"
                    onClick={() => handleMediaDelete(m.id)}
                    className="text-xs text-red-500 mt-1"
                  >
                    刪除
                  </button>
                </div>
              ))}
              {media.length === 0 && <p className="text-sm text-gray-400">尚無媒體檔案</p>}
            </div>

            <form onSubmit={handleMediaUpload} className="border rounded p-3 space-y-2 text-sm max-w-sm">
              {mediaError && <p className="text-red-500">{mediaError}</p>}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                onChange={(e) => setMediaFile(e.target.files[0])}
                className="block w-full text-sm"
              />
              <input
                value={mediaCaption}
                onChange={(e) => setMediaCaption(e.target.value)}
                placeholder="說明文字（選填）"
                className="w-full border rounded px-2 py-1"
              />
              <button
                type="submit"
                disabled={mediaUploading || !mediaFile}
                className="bg-blue-600 text-white px-3 py-1.5 rounded disabled:opacity-50"
              >
                {mediaUploading ? '上傳中...' : '上傳'}
              </button>
              <p className="text-xs text-gray-400">
                支援 jpg / png / webp 圖片，或 mp4 / mov 影片（上限 100MB）
              </p>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
