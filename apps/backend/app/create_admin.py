"""
建立／重設後台管理員帳號。
用法： python -m app.create_admin <username> <password>

若帳號已存在，會更新密碼（可用來重設固定帳密，如 admin / 123456）；
若帳號不存在，則新增一筆。之後要再新增其他管理員，重複執行本指令並換新帳號即可，
不會影響既有帳號。
"""
import sys

from app.db import SessionLocal, Base, engine
from app.models import AdminUser
from app.auth.jwt_handler import hash_password


def create_admin(username: str, password: str):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        user = db.query(AdminUser).filter(AdminUser.username == username).first()
        if user:
            user.password_hash = hash_password(password)
            db.commit()
            print(f"已重設帳號 {username} 的密碼")
        else:
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
