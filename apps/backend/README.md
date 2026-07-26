# Backend — 中餐丙級術科練習系統 API

FastAPI + SQLAlchemy，對應規格書 `README.md` 第 5 節。

## 開發環境設定

```bash
cd apps/backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

# 建立第一個後台管理員帳號
python -m app.create_admin admin your-password

# 啟動開發伺服器
uvicorn app.main:app --reload --port 8000
```

啟動後可至 http://localhost:8000/docs 看自動產生的 Swagger API 文件。

## 資料庫遷移（Alembic）

MVP 階段用 `Base.metadata.create_all` 自動建表即可；當 schema 開始需要版本控管時：

```bash
alembic revision --autogenerate -m "描述變更"
alembic upgrade head
```

## 匯入題庫種子資料

```bash
python -m app.seed ../../exam_questions_data.json
```

`app/seed.py` 內的解析邏輯需依 `exam_questions_data.json` 實際欄位補完。

## 目錄結構

```
app/
├── main.py          FastAPI 進入點
├── config.py        環境變數設定
├── db.py            資料庫連線 / Session
├── models/          SQLAlchemy 資料模型
├── schemas/         Pydantic 請求/回應格式
├── routers/         API 路由（groups / admin / media）
├── auth/            JWT 簽發與驗證
├── seed.py          題庫種子資料匯入
└── create_admin.py  建立後台管理員帳號
uploads/              題目圖片/影片儲存
alembic/              資料庫遷移腳本
```
