from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import AdminUser, QuestionGroup, Dish, MaterialItem, KnifeWorkItem
from app.schemas.admin import LoginRequest, TokenResponse
from app.schemas.group import GroupIn, GroupDetailOut, DishIn
from app.auth.jwt_handler import verify_password, create_access_token, get_current_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.username == payload.username).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="帳號或密碼錯誤")
    token = create_access_token(subject=user.username)
    return TokenResponse(access_token=token)


def _sync_dishes(group: QuestionGroup, dishes_in: list[DishIn]) -> None:
    """
    以 id 為準做 upsert：payload 帶 id 的視為更新既有菜餚（保留 id，
    這樣已上傳掛在該菜餚下的照片/影片不會失聯）；沒有 id 的視為新菜餚。
    原本存在、但這次 payload 沒帶到的菜餚會被移除（cascade 清掉，
    其底下媒體不會自動跟著刪，仍留在資料庫但會變成無主資料，MVP 階段先不處理）。
    """
    existing_by_id = {d.id: d for d in group.dishes}
    new_dishes = []
    for d in dishes_in:
        fields = d.model_dump(exclude={"id"})
        if d.id is not None and d.id in existing_by_id:
            dish = existing_by_id[d.id]
            for key, value in fields.items():
                setattr(dish, key, value)
        else:
            dish = Dish(**fields)
        new_dishes.append(dish)
    group.dishes = new_dishes


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
    # 新題組沒有既有菜餚可以比對，忽略 payload 帶的 id（若有）直接新建
    group.dishes = [Dish(**d.model_dump(exclude={"id"})) for d in payload.dishes]
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

    # 菜餚用 id 做 upsert，保留既有菜餚的 id（讓已上傳的照片/影片不失聯）
    _sync_dishes(group, payload.dishes)

    # 材料清點、刀工規格底下沒有掛媒體，維持 MVP 做法：整批覆蓋
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
