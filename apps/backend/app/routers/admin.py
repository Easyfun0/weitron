from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import AdminUser, QuestionGroup, Dish, MaterialItem, KnifeWorkItem
from app.schemas.admin import LoginRequest, TokenResponse
from app.schemas.group import GroupIn, GroupDetailOut
from app.auth.jwt_handler import verify_password, create_access_token, get_current_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.username == payload.username).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="帳號或密碼錯誤")
    token = create_access_token(subject=user.username)
    return TokenResponse(access_token=token)


@router.post(
    "/questions",
    response_model=GroupDetailOut,
    dependencies=[Depends(get_current_admin)],
)
def create_question_group(payload: GroupIn, db: Session = Depends(get_db)):
    if db.query(QuestionGroup).filter(QuestionGroup.code == payload.code).first():
        raise HTTPException(status_code=400, detail="題組編號已存在")

    group = QuestionGroup(
        code=payload.code,
        title=payload.title,
        plating_options=payload.plating_options or [],
    )
    group.dishes = [Dish(**d.model_dump()) for d in payload.dishes]
    group.material_items = [MaterialItem(**m.model_dump()) for m in payload.material_items]
    group.knife_work_items = [KnifeWorkItem(**k.model_dump()) for k in payload.knife_work_items]

    db.add(group)
    db.commit()
    db.refresh(group)
    return group


@router.put(
    "/questions/{code}",
    response_model=GroupDetailOut,
    dependencies=[Depends(get_current_admin)],
)
def update_question_group(code: str, payload: GroupIn, db: Session = Depends(get_db)):
    group = db.query(QuestionGroup).filter(QuestionGroup.code == code).first()
    if not group:
        raise HTTPException(status_code=404, detail="題組不存在")

    if payload.code != code and db.query(QuestionGroup).filter(QuestionGroup.code == payload.code).first():
        raise HTTPException(status_code=400, detail="題組編號已存在")

    group.code = payload.code
    group.title = payload.title
    group.plating_options = payload.plating_options or []

    # MVP 做法：整批覆蓋子項目（cascade delete-orphan 會自動清掉舊資料）
    group.dishes = [Dish(**d.model_dump()) for d in payload.dishes]
    group.material_items = [MaterialItem(**m.model_dump()) for m in payload.material_items]
    group.knife_work_items = [KnifeWorkItem(**k.model_dump()) for k in payload.knife_work_items]

    db.commit()
    db.refresh(group)
    return group


@router.delete("/questions/{code}", dependencies=[Depends(get_current_admin)])
def delete_question_group(code: str, db: Session = Depends(get_db)):
    group = db.query(QuestionGroup).filter(QuestionGroup.code == code).first()
    if not group:
        raise HTTPException(status_code=404, detail="題組不存在")
    db.delete(group)
    db.commit()
    return {"ok": True}
