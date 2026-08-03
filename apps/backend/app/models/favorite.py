from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint

from app.db import Base


class Favorite(Base):
    """學員個人的「我的最愛」標記，綁定 student_id + group_id（題組），
    用來讓前台題組總覽把學員自己標記過的題組排到最前面（優先練習）。"""

    __tablename__ = "favorite"
    __table_args__ = (UniqueConstraint("student_id", "group_id", name="uq_favorite_student_group"),)

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("student.id"), nullable=False)
    group_id = Column(Integer, ForeignKey("question_group.id"), nullable=False)
