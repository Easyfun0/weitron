"""建立後台管理員帳號。用法： python -m app.create_admin <username> <password>"""
import sys

from app.db import SessionLocal, Base, engine
from app.models import AdminUser
from app.auth.jwt_handler import hash_password


def create_admin(username: str, password: str):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(AdminUser).filter(AdminUser.username == username).first():
            print(f"帳號 {username} 已存在")
            return
        user = AdminUser(username=username, password_hash=hash_password(password))
        db.add(user)
        db.commit()
        print(f"已建立管理員帳號：{username}")
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("用法: python -m app.create_admin <username> <password>")
        sys.exit(1)
    create_admin(sys.argv[1], sys.argv[2])
