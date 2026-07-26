from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import QuestionGroup
from app.schemas.group import GroupListOut, GroupDetailOut

router = APIRouter(prefix="/api", tags=["groups"])


@router.get("/groups", response_model=list[GroupListOut])
def list_groups(db: Session = Depends(get_db)):
    return db.query(QuestionGroup).order_by(QuestionGroup.code).all()


@router.get("/groups/{code}", response_model=GroupDetailOut)
def get_group(code: str, db: Session = Depends(get_db)):
    group = db.query(QuestionGroup).filter(QuestionGroup.code == code).first()
    if not group:
        raise HTTPException(status_code=404, detail="題組不存在")
    return group


@router.get("/categories")
def list_categories():
    # MVP：分類先以題組編號前綴（301 / 302）簡化表示，之後可視需要拆出獨立資料表
    return [{"id": 1, "name": "301"}, {"id": 2, "name": "302"}]
