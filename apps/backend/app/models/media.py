from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.db import Base


class Media(Base):
    __tablename__ = "media"

    id = Column(Integer, primary_key=True)
    owner_type = Column(String(20), nullable=False)  # "group" | "dish"
    owner_id = Column(Integer, nullable=False)
    media_type = Column(String(10), nullable=False)  # "image" | "video"
    category = Column(String(20))  # 圖片用："step"（步驟照片）| "finished"（完成圖），影片不需要
    file_url = Column(String(500), nullable=False)
    caption = Column(String(255))
    sort_order = Column(Integer, default=0)
    uploaded_by = Column(Integer, ForeignKey("admin_user.id"))
    # null = 導師範例（管理員上傳，任何人都能看到）；有值 = 該學員自己上傳的照片/影片，只有本人登入才看得到
    student_id = Column(Integer, ForeignKey("student.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
