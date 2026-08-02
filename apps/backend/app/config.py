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

    # AWS S3：四個都設定時優先於 Supabase Storage（用來把新上傳換到 S3，
    # 不受 Supabase 免費方案單檔 50MB 上限限制）。舊資料留在 Supabase 的網址不受影響，
    # 兩邊資料可以並存，不需要一次搬完。
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = ""
    aws_s3_bucket: str = ""

    @property
    def use_s3_storage(self) -> bool:
        return bool(
            self.aws_access_key_id
            and self.aws_secret_access_key
            and self.aws_region
            and self.aws_s3_bucket
        )

    @property
    def use_supabase_storage(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_role_key)

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    class Config:
        env_file = ".env"


settings = Settings()
