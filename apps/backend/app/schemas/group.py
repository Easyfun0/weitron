from typing import Optional
from pydantic import BaseModel


class DishOut(BaseModel):
    id: int
    name: str
    main_cut: Optional[str] = None
    method: Optional[str] = None
    main_ingredient: Optional[str] = None
    ingredients: Optional[list] = None
    cooking_steps: Optional[list] = None
    seasoning: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class MaterialItemOut(BaseModel):
    id: int
    name: str
    spec: Optional[str] = None
    qty: Optional[str] = None
    note: Optional[str] = None

    class Config:
        from_attributes = True


class KnifeWorkItemOut(BaseModel):
    id: int
    material: str
    spec: Optional[str] = None
    qty: Optional[str] = None
    note: Optional[str] = None

    class Config:
        from_attributes = True


class GroupListOut(BaseModel):
    code: str
    title: str

    class Config:
        from_attributes = True


class GroupDetailOut(BaseModel):
    id: int
    code: str
    title: str
    dishes: list[DishOut] = []
    material_items: list[MaterialItemOut] = []
    knife_work_items: list[KnifeWorkItemOut] = []
    plating_options: Optional[list[str]] = None

    class Config:
        from_attributes = True


# --- 後台新增/編輯用的輸入格式 ---


class DishIn(BaseModel):
    name: str
    main_cut: Optional[str] = None
    method: Optional[str] = None
    main_ingredient: Optional[str] = None
    ingredients: Optional[list[str]] = []
    cooking_steps: Optional[list[str]] = []
    seasoning: Optional[str] = None
    notes: Optional[str] = None


class MaterialItemIn(BaseModel):
    name: str
    spec: Optional[str] = None
    qty: Optional[str] = None
    note: Optional[str] = None


class KnifeWorkItemIn(BaseModel):
    material: str
    spec: Optional[str] = None
    qty: Optional[str] = None
    note: Optional[str] = None


class GroupIn(BaseModel):
    code: str
    title: str
    dishes: list[DishIn] = []
    material_items: list[MaterialItemIn] = []
    knife_work_items: list[KnifeWorkItemIn] = []
    plating_options: Optional[list[str]] = []
