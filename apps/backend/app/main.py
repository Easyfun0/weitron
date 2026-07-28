from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.db import Base, engine
from app.routers import groups, admin, media, student, notes, auth

# MVP 直接用 create_all；有正式 schema 演進需求時改用 alembic upgrade
Base.metadata.create_all(bind=engine)

app = FastAPI(title="中餐丙級術科練習系統 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,  # 本地預設 localhost:5173，雲端用 CORS_ORIGINS 環境變數加上 Vercel 網域
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(groups.router)
app.include_router(admin.router)
app.include_router(media.router)
app.include_router(student.router)
app.include_router(notes.router)
app.include_router(auth.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
