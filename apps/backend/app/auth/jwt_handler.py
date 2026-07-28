from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.config import settings

# 管理員跟學員各自一組登入端點，但 token 用同一組密鑰簽發，
# 靠 payload 裡的 role 區分身份，避免學員 token 拿去打管理員 API
admin_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/login")
student_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/student/login")
# auto_error=False：沒帶 token 或 token 無效時回傳 None，而不是直接 401，
# 給「登入才多顯示一些東西、不登入也能用」的端點（例如媒體列表）用
optional_student_scheme = OAuth2PasswordBearer(tokenUrl="/api/student/login", auto_error=False)

# bcrypt 底層限制密碼最長 72 bytes，超過則截斷再雜湊
_MAX_PASSWORD_BYTES = 72


def hash_password(password: str) -> str:
    pw_bytes = password.encode("utf-8")[:_MAX_PASSWORD_BYTES]
    return bcrypt.hashpw(pw_bytes, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    pw_bytes = plain.encode("utf-8")[:_MAX_PASSWORD_BYTES]
    return bcrypt.checkpw(pw_bytes, hashed.encode("utf-8"))


def create_access_token(subject: str, role: str = "admin") -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {"sub": subject, "role": role, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def _decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError:
        return None


def get_current_admin(token: str = Depends(admin_oauth2_scheme)) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="無法驗證管理員身份",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = _decode_token(token)
    if not payload or payload.get("role") != "admin" or not payload.get("sub"):
        raise credentials_exception
    return payload["sub"]


def get_current_student(token: str = Depends(student_oauth2_scheme)) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="無法驗證學員身份",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = _decode_token(token)
    if not payload or payload.get("role") != "student" or not payload.get("sub"):
        raise credentials_exception
    return payload["sub"]


def get_optional_student(token: str | None = Depends(optional_student_scheme)) -> str | None:
    """沒登入、token 過期、或帶的是管理員 token，一律回傳 None（不噴錯），呼叫端自行決定要不要多顯示東西"""
    if not token:
        return None
    payload = _decode_token(token)
    if not payload or payload.get("role") != "student" or not payload.get("sub"):
        return None
    return payload["sub"]
