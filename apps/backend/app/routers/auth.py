from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import AdminUser, Student
from app.schemas.auth import AuthLoginRequest, AuthTokenResponse
from app.auth.jwt_handler import verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=AuthTokenResponse)
def unified_login(payload: AuthLoginRequest, db: Session = Depends(get_db)):
    """
    學員跟管理員共用同一個登入入口：先比對管理員帳號，比對不到/密碼錯才試學員帳號。
    前端拿到 role 之後自己決定要導去後台還是導回原本的頁面。
    """
    admin = db.query(AdminUser).filter(AdminUser.username == payload.username).first()
    if admin and verify_password(payload.password, admin.password_hash):
        token = create_access_token(subject=admin.username, role="admin")
        return AuthTokenResponse(access_token=token, role="admin", username=admin.username)

    student = db.query(Student).filter(Student.username == payload.username).first()
    if student and verify_password(payload.password, student.password_hash):
        token = create_access_token(subject=student.username, role="student")
        return AuthTokenResponse(access_token=token, role="student", username=student.username)

    raise HTTPException(status_code=401, detail="帳號或密碼錯誤")
