from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, UniqueConstraint

from app.db import Base


class Note(Base):
    """學員個人筆記，綁定 student_id + dish_id，一位學員對一道菜只有一筆筆記
    (例如：鹽/糖用量、煮多久、火候等個人重點，跟著該道菜顯示)"""

    __tablename__ = "note"
    __table_args__ = (UniqueConstraint("student_id", "dish_id", name="uq_note_student_dish"),)

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("student.id"), nullable=False)
    dish_id = Column(Integer, ForeignKey("dish.id"), nullable=False)
    content = Column(Text, default="")
    updated_at = Column(DateTime(timezone=True))
