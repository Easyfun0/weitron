# 偉創餐飲教育學院 — 中餐丙級術科練習系統
## 底層架構規格書 v0.1

---

## 1. 專案概述

**目的**：提供學員一個線上頁面，練習「中餐丙級技術士技能檢定」術科考試，內容以**固定題組**（勞動部公告之規定菜單／術科測試項目）為主，呈現每題的考試流程、操作步驟、時間限制與評分重點，協助學員熟悉應檢流程並自我檢核。

**範圍（MVP）**：
- 固定題目（菜單／項目）瀏覽與查詢
- 單一題目的術科流程頁（步驟、時間、注意事項、圖片）
- 練習模式（計時、步驟勾選檢核表）
- 後台管理（校方人員維護題目內容，不開放學員編輯）

**非範圍（暫不做，未來可擴充）**：
- 學員帳號登入、個人練習紀錄追蹤
- 影片教學、線上評分／AI 判斷
- 多校區/多角色權限管理

---

## 2. 需求整理

### 2.1 功能需求

| 功能 | 說明 |
|---|---|
| 題目總覽頁 | 顯示所有固定術科題目（如刀工、配菜、熱炒、點心等分類），可搜尋/篩選分類 |
| 題目詳情頁 | 顯示該題完整應檢流程：食材、步驟、時間配分、評分標準、注意事項 |
| 練習模式 | 依步驟顯示 checklist，可打勾記錄、內建倒數計時器（依考試時限） |
| 後台管理 | 校內人員登入後可新增/編輯/刪除題目與流程內容、上傳圖片 |

### 2.2 非功能需求

- **內容固定、更新頻率低**：題庫由勞動部公告更新（通常數年一次），架構應以「易維護」優先於「即時性」。
- **可用性**：學員多以手機/平板瀏覽，前端需響應式設計（RWD）。
- **部署彈性**：初期規模小，架構需可先以輕量方式上線，未來若流量成長可平移到雲端方案，不綁定特定供應商。
- **維護性**：後台管理介面需讓非工程背景人員（校內教務人員）也能操作。

---

## 3. 系統架構總覽

```
┌─────────────────────┐        HTTPS / REST API        ┌──────────────────────┐
│   前端 (React SPA)    │  ─────────────────────────▶   │   後端 (Python API)    │
│  Vite + React Router │  ◀─────────────────────────   │   FastAPI + SQLAlchemy │
└─────────────────────┘         JSON                    └──────────┬───────────┘
                                                                     │
                                                          ┌──────────▼───────────┐
                                                          │      資料庫層          │
                                                          │  SQLite（起步）         │
                                                          │  → PostgreSQL（可擴充） │
                                                          └──────────┬───────────┘
                                                                     │
                                                          ┌──────────▼───────────┐
                                                          │   靜態資源儲存          │
                                                          │  題目圖片 / 流程圖示     │
                                                          │（本機 /uploads 目錄     │
                                                          │  → 未來可換成雲端物件儲存）│
                                                          └───────────────────────┘
```

**設計原則**：前後端分離、後端僅提供 REST JSON API、資料庫與部署方式先選最簡方案但保留升級路徑（介面/程式不綁死單一資料庫或主機供應商）。

---

## 4. 前端架構（React）

### 4.1 技術選型

| 項目 | 選擇 | 說明 |
|---|---|---|
| 建置工具 | Vite | 啟動快、設定簡單 |
| 路由 | React Router | SPA 分頁導覽 |
| 狀態管理 | React Context + useState/useReducer | 資料量小，不需要 Redux 等重型方案 |
| UI 樣式 | Tailwind CSS + 基礎元件庫 | 加速開發、RWD 容易處理 |
| API 溝通 | fetch / axios 封裝於 `services/api.js` | 統一管理 API 請求與錯誤處理 |

### 4.2 頁面結構

```
/                      題目總覽頁（分類篩選、卡片列表）
/questions/:id         題目詳情頁（流程、時間配分、注意事項）
/practice/:id          練習模式頁（checklist + 計時器）
/admin/login           後台登入
/admin/questions       後台題目管理列表
/admin/questions/:id   後台題目編輯
```

### 4.3 元件切分（示意）

```
src/
├── pages/
│   ├── QuestionList.jsx
│   ├── QuestionDetail.jsx
│   ├── PracticeMode.jsx
│   └── admin/
│       ├── AdminLogin.jsx
│       ├── QuestionManage.jsx
│       └── QuestionEditor.jsx
├── components/
│   ├── QuestionCard.jsx
│   ├── StepChecklist.jsx
│   ├── Timer.jsx
│   └── layout/ (Header, Footer, AdminLayout)
├── services/
│   └── api.js
└── App.jsx
```

---

## 5. 後端架構（Python）

### 5.1 技術選型

| 項目 | 選擇 | 說明 |
|---|---|---|
| Web 框架 | FastAPI | 自動產生 API 文件（Swagger）、型別驗證方便、效能佳 |
| ORM | SQLAlchemy | 資料庫操作抽象化，未來換資料庫成本低 |
| 資料驗證 | Pydantic（FastAPI 內建） | 請求/回應資料結構驗證 |
| 認證（後台用） | JWT（僅後台管理員登入需要） | 學員端無需登入，不需複雜的使用者系統 |
| 遷移工具 | Alembic | 資料庫結構版本控管 |

### 5.2 專案結構（示意）

```
backend/
├── app/
│   ├── main.py              # FastAPI 進入點
│   ├── models/               # SQLAlchemy 資料模型
│   ├── schemas/               # Pydantic 請求/回應格式
│   ├── routers/
│   │   ├── questions.py       # 題目相關 API
│   │   └── admin.py           # 後台管理 API（需驗證）
│   ├── services/               # 商業邏輯層
│   ├── auth/                   # 管理員登入/JWT
│   └── db.py                   # 資料庫連線設定
├── uploads/                    # 題目圖片儲存
├── alembic/                    # 資料庫遷移腳本
└── requirements.txt
```

### 5.3 API 端點初稿

| 方法 | 路徑 | 說明 | 權限 |
|---|---|---|---|
| GET | /api/questions | 取得題目列表（可帶分類篩選） | 公開 |
| GET | /api/questions/{id} | 取得單一題目詳情（流程、步驟） | 公開 |
| GET | /api/categories | 取得題目分類 | 公開 |
| POST | /api/admin/login | 管理員登入取得 token | 公開 |
| POST | /api/admin/questions | 新增題目 | 需登入 |
| PUT | /api/admin/questions/{id} | 編輯題目 | 需登入 |
| DELETE | /api/admin/questions/{id} | 刪除題目 | 需登入 |
| POST | /api/admin/upload | 上傳題目圖片 | 需登入 |

---

## 6. 資料庫設計（初稿）

### 6.1 資料表規劃

**category（題目分類）**
| 欄位 | 型別 | 說明 |
|---|---|---|
| id | int, PK | |
| name | string | 分類名稱（如：刀工、配菜、熱炒） |
| sort_order | int | 顯示排序 |

**question（題目）**
| 欄位 | 型別 | 說明 |
|---|---|---|
| id | int, PK | |
| category_id | int, FK | 所屬分類 |
| title | string | 題目名稱（如：三絲魚捲） |
| time_limit_minutes | int | 考試時限 |
| ingredients | text | 食材清單 |
| scoring_notes | text | 評分重點/扣分項目 |
| cover_image_url | string | 封面圖 |
| created_at / updated_at | datetime | |

**step（流程步驟，屬於某一題目）**
| 欄位 | 型別 | 說明 |
|---|---|---|
| id | int, PK | |
| question_id | int, FK | |
| step_order | int | 步驟順序 |
| description | text | 步驟說明 |
| image_url | string, nullable | 步驟示意圖 |

**admin_user（後台管理員）**
| 欄位 | 型別 | 說明 |
|---|---|---|
| id | int, PK | |
| username | string | |
| password_hash | string | |

> 學員練習紀錄（練習次數、勾選狀態）屬於**未來擴充項目**，MVP 階段可先僅在前端本地暫存（不落地資料庫），待確定需要追蹤學習成效時再加 `practice_record` 表與學員帳號系統。

---

## 7. 部署架構（先保持彈性）

**階段一（上線初期，最小成本）**
- 前端：build 成靜態檔案，部署於任一靜態網站空間
- 後端：單一主機以 Docker 執行 FastAPI + SQLite
- 圖片：存於後端主機本機 `uploads/` 目錄

**階段二（若流量/資料成長）**
- 資料庫平移至 PostgreSQL（SQLAlchemy 已抽象化，改設定即可）
- 圖片改存物件儲存服務
- 前後端可分別水平擴充，中間加 Nginx / 反向代理

兩階段程式碼共用同一套架構，差異僅在設定檔（`.env`）與部署方式，避免日後重寫。

---

## 8. 開發階段建議

1. **Phase 1**：後端資料模型 + 題目/分類 CRUD API + 後台登入
2. **Phase 2**：前端題目總覽頁、詳情頁串接 API
3. **Phase 3**：練習模式（checklist + 計時器，前端邏輯為主）
4. **Phase 4**：後台管理介面（新增/編輯題目與步驟、上傳圖片）
5. **Phase 5**：整體測試、RWD 調整、正式部署

---

## 9. 題庫內容更新（v0.2 — 依實際考題文件修訂）

依校方提供之勞動部「中餐烹調職類(葷食項)丙級」術科三份正式文件（測試過程烹調指引表、題卡及考生材料清點單、第一階段刀工作品規格卡），確認題庫為 **24 個固定題組**（301-1～301-12、302-1～302-12），每個題組固定 3 道菜，共 72 道菜。已將全部內容轉為結構化資料 `exam_questions_data.json`，作為系統的題庫種子資料，取代先前規格書中「題目待補」的假設。

### 9.1 資料模型調整

每個「題目」實際上是一個**題組**，包含 3 道菜與 3 類清單資訊，資料表需相應調整：

**question_group（題組，取代原 question 表）**
| 欄位 | 型別 | 說明 |
|---|---|---|
| id | int, PK | |
| code | string | 題組編號，如 `301-1` |
| title | string | 3 道菜名組合，如「青椒炒肉絲、茄汁燴魚片、乾煸四季豆」 |

**dish（菜餚，屬於某題組，固定3筆/組）**
| 欄位 | 型別 | 說明 |
|---|---|---|
| id | int, PK | |
| group_id | int, FK | |
| name | string | 菜餚名稱 |
| main_cut | string | 主要刀工（絲、片、丁…） |
| method | string | 烹調法 |
| main_ingredient | string | 主材料類別 |
| ingredients | json/array | 材料組合清單 |
| cooking_steps | json/array | 烹調規定步驟 |
| seasoning | text | 調味規定 |
| notes | text | 備註（扣分標準等） |

**material_item（材料清點項目，屬於題組，非單一菜餚）**
| 欄位 | 型別 | 說明 |
|---|---|---|
| id | int, PK | |
| group_id | int, FK | |
| name | string | 材料名稱 |
| spec | text | 規格描述 |
| qty | string | 重量/數量 |
| note | text | 備註 |

**knife_work_item（第一階段刀工規格項目，屬於題組）**
| 欄位 | 型別 | 說明 |
|---|---|---|
| id | int, PK | |
| group_id | int, FK | |
| material | string | 材料/刀工項目名稱（如「紅蘿蔔水花片兩款」） |
| spec | text | 規格描述（長寬高、花刀間隔等） |
| qty | string | 數量規定 |
| note | text | 備註 |

**plating_option（盤飾參考選項，屬於題組）**：純文字清單（如「大黃瓜、小黃瓜、紅辣椒」），對應指定圖 3 選 2。指定水花圖與指定盤飾照片為視覺參考圖，屬於媒體資源（見 9.3）。

### 9.2 題目清單／詳情頁功能（點選題目查看清單）

前端新增「題組列表 → 題組詳情」的瀏覽流程：

- **題組列表頁**：卡片列出 24 個題組（編號＋3道菜名），可依編號或菜名搜尋。
- **題組詳情頁**：點選任一題組後，以分頁（Tab）呈現該題組完整清單：
  1. **烹調指引**：3 道菜的主要刀工／烹調法／材料組合／烹調規定步驟／調味規定／備註，逐道菜以 checklist 呈現，供學員對照練習。
  2. **材料清點清單**：該題組所有材料的品名／規格／重量數量，做成勾選式清點表，供學員練習「考生材料清點」流程。
  3. **刀工規格清單**：第一階段刀工作品規格明細（各材料的尺寸、數量、備註），同樣以勾選式清單呈現，並列出指定水花／盤飾之參考選項。

後端對應新增 API：

| 方法 | 路徑 | 說明 |
|---|---|---|
| GET | /api/groups | 題組列表（含每組3道菜名） |
| GET | /api/groups/{code} | 單一題組完整詳情（dishes + materials + knife_work） |

### 9.3 新增功能：題目項目可新增圖片與影片

每個題組（或細至每道菜）需能由後台上傳**參考圖片／教學影片**（例如成品照、刀工示範影片、水花刻花參考圖），供學員練習時對照。

**media（媒體資源）資料表**
| 欄位 | 型別 | 說明 |
|---|---|---|
| id | int, PK | |
| owner_type | string | `group`（題組層級）或 `dish`（單一菜餚層級） |
| owner_id | int | 對應 group_id 或 dish_id |
| media_type | string | `image` 或 `video` |
| file_url | string | 儲存路徑（本機 uploads/ 或未來雲端物件儲存） |
| caption | string | 說明文字（如「水花指定款(1)參考圖」） |
| sort_order | int | 顯示順序 |
| uploaded_by | int, FK | 上傳的後台管理員 |
| created_at | datetime | |

**API 新增**
| 方法 | 路徑 | 說明 | 權限 |
|---|---|---|---|
| GET | /api/groups/{code}/media | 取得該題組（含旗下菜餚）所有圖片/影片 | 公開 |
| POST | /api/admin/media | 上傳圖片或影片（multipart/form-data） | 需登入 |
| DELETE | /api/admin/media/{id} | 刪除媒體 | 需登入 |

**前端**：題組詳情頁的每個分頁（烹調指引／材料清點／刀工規格）下方加入媒體區塊，顯示已上傳的圖片（燈箱放大）與影片（內嵌播放器），後台管理頁提供拖放上傳元件。影片檔案較大，初期建議：圖片直接存後端 `uploads/`，影片則先限制檔案大小（如 100MB）並存本機，未來若流量增加再遷移至雲端物件儲存＋CDN。

## 10. 待確認事項

- 實際部署環境（雲端主機／校內自架主機）尚未決定，本規格書架構已設計為兩者皆可套用。
- 是否需要學員登入與練習紀錄追蹤，將影響是否提前設計 `user` / `practice_record` 資料表。
- 題目圖片是否需要多張（例如每步驟一張），會影響 `step` 表的圖片欄位設計。
