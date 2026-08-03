from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Favorite, Student, QuestionGroup
from app.auth.jwt_handler import get_current_student

router = APIRouter(prefix="/api/favorites", tags=["favorites"])


def _get_student(db: Session, username: str) -> Student:
    student = db.query(Student).filter(Student.username == username).first()
    if not student:
        raise HTTPException(status_code=401, detail="找不到學員帳號")
    return student


def _get_group(db: Session, code: str) -> QuestionGroup:
    group = db.query(QuestionGroup).filter(QuestionGroup.code == code).first()
    if not group:
        raise HTTPException(status_code=404, detail="題組不存在")
    return group


@router.get("")
def list_favorites(
    db: Session = Depends(get_db),
    username: str = Depends(get_current_student),
):
    """回傳目前登入學員標記過「我的最愛」的題組編號清單，前台總覽頁靠這個排序優先顯示。"""
    student = _get_student(db, username)
    group_ids = [
        f.group_id
        for f in db.query(Favorite).filter(Favorite.student_id == student.id).all()
    ]
    if not group_ids:
        return {"codes": []}
    codes = [
        g.code
        for g in db.query(QuestionGroup).filter(QuestionGroup.id.in_(group_ids)).all()
    ]
    return {"codes": codes}


@router.post("/{code}")
def add_favorite(
    code: str,
    db: Session = Depends(get_db),
    username: str = Depends(get_current_student),
):
    student = _get_student(db, username)
    group = _get_group(db, code)

    exists = (
        db.query(Favorite)
        .filter(Favorite.student_id == student.id, Favorite.group_id == group.id)
        .first()
    )
    if not exists:
        db.add(Favorite(student_id=student.id, group_id=group.id))
        db.commit()
    return {"ok": True}


@router.delete("/{code}")
def remove_favorite(
    code: str,
    db: Session = Depends(get_db),
    username: str = Depends(get_current_student),
):
    student = _get_student(db, username)
    group = _get_group(db, code)

    db.query(Favorite).filter(
        Favorite.student_id == student.id, Favorite.group_id == group.id
    ).delete()
    db.commit()
    return {"ok": True}
