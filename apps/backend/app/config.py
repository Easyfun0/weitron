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

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    class Config:
        env_file = ".env"


settings = Settings()
