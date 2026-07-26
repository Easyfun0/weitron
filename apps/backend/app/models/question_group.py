from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.db import Base


class QuestionGroup(Base):
    __tablename__ = "question_group"

    id = Column(Integer, primary_key=True)
    code = Column(String(20), unique=True, nullable=False, index=True)  # e.g. 301-1
    title = Column(String(255), nullable=False)  # 3 道菜名組合
    plating_options = Column(JSON)  # 盤飾參考選項清單（純文字，指定圖 3 選 2）

    dishes = relationship("Dish", back_populates="group", cascade="all, delete-orphan")
    material_items = relationship("MaterialItem", back_populates="group", cascade="all, delete-orphan")
    knife_work_items = relationship("KnifeWorkItem", back_populates="group", cascade="all, delete-orphan")


class Dish(Base):
    __tablename__ = "dish"

    id = Column(Integer, primary_key=True)
    group_id = Column(Integer, ForeignKey("question_group.id"), nullable=False)
    name = Column(String(255), nullable=False)
    main_cut = Column(String(100))
    method = Column(String(100))
    main_ingredient = Column(String(100))
    ingredients = Column(JSON)       # list
    cooking_steps = Column(JSON)     # list
    seasoning = Column(Text)
    notes = Column(Text)

    group = relationship("QuestionGroup", back_populates="dishes")


class MaterialItem(Base):
    __tablename__ = "material_item"

    id = Column(Integer, primary_key=True)
    group_id = Column(Integer, ForeignKey("question_group.id"), nullable=False)
    name = Column(String(255), nullable=False)
    spec = Column(Text)
    qty = Column(String(100))
    note = Column(Text)

    group = relationship("QuestionGroup", back_populates="material_items")


class KnifeWorkItem(Base):
    __tablename__ = "knife_work_item"

    id = Column(Integer, primary_key=True)
    group_id = Column(Integer, ForeignKey("question_group.id"), nullable=False)
    material = Column(String(255), nullable=False)
    spec = Column(Text)
    qty = Column(String(100))
    note = Column(Text)

    group = relationship("QuestionGroup", back_populates="knife_work_items")
