from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Student
from app.schemas.student import StudentAuthRequest, StudentTokenResponse
from app.auth.jwt_handler import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/student", tags=["student"])


@router.post("/signup", response_model=StudentTokenResponse)
def signup(payload: StudentAuthRequest, db: Session = Depends(get_db)):
    username = payload.username.strip()
    if not username or not payload.password:
        raise HTTPException(status_code=400, detail="帳號密碼不可為空")
    if db.query(Student).filter(Student.username == username).first():
        raise HTTPException(status_code=400, detail="這個帳號已經被註冊了")

    student = Student(username=username, password_hash=hash_password(payload.password))
    db.add(student)
    db.commit()
    db.refresh(student)

    token = create_access_token(subject=student.username, role="student")
    return StudentTokenResponse(access_token=token, username=student.username)


@router.post("/login", response_model=StudentTokenResponse)
def login(payload: StudentAuthRequest, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.username == payload.username.strip()).first()
    if not student or not verify_password(payload.password, student.password_hash):
        raise HTTPException(status_code=401, detail="帳號或密碼錯誤")

    token = create_access_token(subject=student.username, role="student")
    return StudentTokenResponse(access_token=token, username=student.username)
