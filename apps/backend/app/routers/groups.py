import re

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import QuestionGroup
from app.schemas.group import GroupListOut, GroupDetailOut

router = APIRouter(prefix="/api", tags=["groups"])

_CODE_RE = re.compile(r"^(\d+)-(\d+)$")


def _code_sort_key(code: str) -> tuple[int, int, str]:
    """題組編號用字串排序會把 301-10 排在 301-2 前面（字典序），改成照數字排序。
    萬一格式不是 301-1 這種（理論上不會發生），退回字串排序、排在最後面。
    """
    m = _CODE_RE.match(code)
    if m:
        return (int(m.group(1)), int(m.group(2)), "")
    return (10**9, 0, code)


@router.get("/groups", response_model=list[GroupListOut])
def list_groups(db: Session = Depends(get_db)):
    groups = db.query(QuestionGroup).all()
    groups.sort(key=lambda g: _code_sort_key(g.code))
    return groups


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
