from sqlalchemy import Column, Integer, String

from app.db import Base


class AdminUser(Base):
    __tablename__ = "admin_user"

    id = Column(Integer, primary_key=True)
    username = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
