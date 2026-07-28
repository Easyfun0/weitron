from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Student, Note, Dish
from app.schemas.note import NoteIn, NoteOut
from app.auth.jwt_handler import get_current_student

router = APIRouter(prefix="/api/notes", tags=["notes"])


def _get_student_or_401(db: Session, username: str) -> Student:
    student = db.query(Student).filter(Student.username == username).first()
    if not student:
        raise HTTPException(status_code=401, detail="找不到學員帳號")
    return student


def _get_dish_or_404(db: Session, dish_id: int) -> Dish:
    dish = db.query(Dish).filter(Dish.id == dish_id).first()
    if not dish:
        raise HTTPException(status_code=404, detail="菜餚不存在")
    return dish


@router.get("/dish/{dish_id}", response_model=NoteOut)
def get_note(
    dish_id: int,
    db: Session = Depends(get_db),
    username: str = Depends(get_current_student),
):
    student = _get_student_or_401(db, username)
    dish = _get_dish_or_404(db, dish_id)
    note = (
        db.query(Note)
        .filter(Note.student_id == student.id, Note.dish_id == dish.id)
        .first()
    )
    if not note:
        return NoteOut(content="", updated_at=None)
    return note


@router.put("/dish/{dish_id}", response_model=NoteOut)
def upsert_note(
    dish_id: int,
    payload: NoteIn,
    db: Session = Depends(get_db),
    username: str = Depends(get_current_student),
):
    student = _get_student_or_401(db, username)
    dish = _get_dish_or_404(db, dish_id)
    note = (
        db.query(Note)
        .filter(Note.student_id == student.id, Note.dish_id == dish.id)
        .first()
    )
    if not note:
        note = Note(student_id=student.id, dish_id=dish.id)
        db.add(note)
    note.content = payload.content
    note.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(note)
    return note
