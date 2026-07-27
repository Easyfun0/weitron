from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./app.db"
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 120
    upload_dir: str = "./uploads"
    # 逗號分隔的允許來源，本地開發預設只放 Vite 開發伺服器；
    # 部署到 Render 後，用環境變數加上 Vercel 網域（例如 https://xxx.vercel.app）
    cors_origins: str = "http://localhost:5173"

    # Supabase Storage：本地開發留空即可（會用本地 uploads/ 資料夾）。
    # 部署到 Render 時三個都要設，圖片/影片才不會因為容器重啟而消失。
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_storage_bucket: str = "media"

    @property
    def use_supabase_storage(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_role_key)

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    class Config:
        env_file = ".env"


settings = Settings()
