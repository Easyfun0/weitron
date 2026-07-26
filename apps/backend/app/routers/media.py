import os
import uuid

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Media, QuestionGroup, Dish
from app.schemas.media import MediaOut
from app.auth.jwt_handler import get_current_admin
from app.config import settings

router = APIRouter(prefix="/api", tags=["media"])

ALLOWED_IMAGE = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_VIDEO = {".mp4", ".mov"}
MAX_VIDEO_BYTES = 100 * 1024 * 1024  # 100MB


@router.get("/groups/{code}/media", response_model=list[MediaOut])
def get_group_media(code: str, db: Session = Depends(get_db)):
    group = db.query(QuestionGroup).filter(QuestionGroup.code == code).first()
    if not group:
        raise HTTPException(status_code=404, detail="題組不存在")
    dish_ids = [d.id for d in group.dishes]
    return (
        db.query(Media)
        .filter(
            ((Media.owner_type == "group") & (Media.owner_id == group.id))
            | ((Media.owner_type == "dish") & (Media.owner_id.in_(dish_ids)))
        )
        .order_by(Media.sort_order)
        .all()
    )


@router.post("/admin/media", response_model=MediaOut, dependencies=[Depends(get_current_admin)])
async def upload_media(
    owner_type: str = Form(...),
    owner_id: int = Form(...),
    caption: str = Form(""),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext in ALLOWED_IMAGE:
        media_type = "image"
    elif ext in ALLOWED_VIDEO:
        media_type = "video"
    else:
        raise HTTPException(status_code=400, detail="不支援的檔案格式")

    os.makedirs(settings.upload_dir, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    dest_path = os.path.join(settings.upload_dir, filename)

    content = await file.read()
    if media_type == "video" and len(content) > MAX_VIDEO_BYTES:
        raise HTTPException(status_code=400, detail="影片檔案超過 100MB 限制")

    with open(dest_path, "wb") as f:
        f.write(content)

    media = Media(
        owner_type=owner_type,
        owner_id=owner_id,
        media_type=media_type,
        file_url=f"/uploads/{filename}",
        caption=caption,
    )
    db.add(media)
    db.commit()
    db.refresh(media)
    return media


@router.delete("/admin/media/{media_id}", dependencies=[Depends(get_current_admin)])
def delete_media(media_id: int, db: Session = Depends(get_db)):
    media = db.query(Media).get(media_id)
    if not media:
        raise HTTPException(status_code=404, detail="媒體不存在")
    db.delete(media)
    db.commit()
    return {"ok": True}
