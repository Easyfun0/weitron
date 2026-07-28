import os
import uuid
import mimetypes

import httpx
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Media, QuestionGroup, Dish, Student
from app.schemas.media import MediaOut
from app.auth.jwt_handler import get_current_admin, get_current_student, get_optional_student
from app.config import settings

router = APIRouter(prefix="/api", tags=["media"])

ALLOWED_IMAGE = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_VIDEO = {".mp4", ".mov"}
MAX_VIDEO_BYTES = 100 * 1024 * 1024  # 100MB
# step/finished：菜餚的步驟照片／完成圖；water_flower/plating：題組層級的水花參考圖／盤飾參考圖
# （對應刀工作品規格卡上「指定圖」的部分，掛在 owner_type="group" 底下）
VALID_CATEGORIES = {"step", "finished", "water_flower", "plating"}


async def _upload_to_supabase(filename: str, content: bytes, content_type: str) -> str:
    """上傳到 Supabase Storage，回傳可公開存取的完整 URL。
    用這個而不是本地磁碟，是因為 Render 免費方案的容器重啟後本地檔案會消失。
    """
    url = f"{settings.supabase_url}/storage/v1/object/{settings.supabase_storage_bucket}/{filename}"
    headers = {
        # 新版 sb_secret_... 金鑰不能只放 Authorization，會被誤判成 JWT 解析失敗（Invalid Compact JWS）。
        # apikey 跟 Authorization 兩邊放同一組值才是 Supabase 目前支援的用法。
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "Content-Type": content_type or "application/octet-stream",
    }
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(url, headers=headers, content=content)
    if resp.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail=f"Supabase Storage 上傳失敗：{resp.text}")
    return f"{settings.supabase_url}/storage/v1/object/public/{settings.supabase_storage_bucket}/{filename}"


async def _delete_from_supabase(filename: str) -> None:
    url = f"{settings.supabase_url}/storage/v1/object/{settings.supabase_storage_bucket}/{filename}"
    headers = {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
    }
    async with httpx.AsyncClient(timeout=30) as client:
        # 刪除失敗不擋流程，媒體紀錄照常從資料庫移除，最多留下孤兒檔案
        await client.delete(url, headers=headers)


async def _validate_and_store_file(file: UploadFile, category: str | None) -> tuple[str, str | None, str]:
    """驗證檔案格式/大小、存到 Supabase Storage 或本地磁碟，回傳 (media_type, category, file_url)。
    管理員上傳（導師範例）跟學員上傳（自己的照片/影片）共用這段邏輯。
    """
    ext = os.path.splitext(file.filename)[1].lower()
    if ext in ALLOWED_IMAGE:
        media_type = "image"
    elif ext in ALLOWED_VIDEO:
        media_type = "video"
    else:
        raise HTTPException(status_code=400, detail="不支援的檔案格式")

    # 分類標籤僅圖片適用（步驟照片／完成圖），影片不需要分類
    if media_type == "image" and category and category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail="圖片分類需為 step 或 finished")
    if media_type == "video":
        category = None

    content = await file.read()
    if media_type == "video" and len(content) > MAX_VIDEO_BYTES:
        raise HTTPException(status_code=400, detail="影片檔案超過 100MB 限制")

    filename = f"{uuid.uuid4().hex}{ext}"
    content_type = file.content_type or mimetypes.guess_type(filename)[0]

    if settings.use_supabase_storage:
        # 正式環境：存到 Supabase Storage，不會因為 Render 容器重啟而消失
        file_url = await _upload_to_supabase(filename, content, content_type)
    else:
        # 本地開發：沒設定 Supabase 就退回存本地 uploads/ 資料夾
        os.makedirs(settings.upload_dir, exist_ok=True)
        dest_path = os.path.join(settings.upload_dir, filename)
        with open(dest_path, "wb") as f:
            f.write(content)
        file_url = f"/uploads/{filename}"

    return media_type, category, file_url


async def _delete_stored_file(media: Media) -> None:
    if settings.use_supabase_storage and media.file_url.startswith(settings.supabase_url):
        filename = media.file_url.rsplit("/", 1)[-1]
        await _delete_from_supabase(filename)
    elif media.file_url.startswith("/uploads/"):
        local_path = os.path.join(settings.upload_dir, media.file_url[len("/uploads/"):])
        if os.path.exists(local_path):
            os.remove(local_path)


@router.get("/groups/{code}/media", response_model=list[MediaOut])
def get_group_media(
    code: str,
    db: Session = Depends(get_db),
    student_username: str | None = Depends(get_optional_student),
):
    group = db.query(QuestionGroup).filter(QuestionGroup.code == code).first()
    if not group:
        raise HTTPException(status_code=404, detail="題組不存在")
    dish_ids = [d.id for d in group.dishes]

    owner_filter = (
        ((Media.owner_type == "group") & (Media.owner_id == group.id))
        | ((Media.owner_type == "dish") & (Media.owner_id.in_(dish_ids)))
    )

    current_student_id = None
    if student_username:
        student = db.query(Student).filter(Student.username == student_username).first()
        if student:
            current_student_id = student.id

    # 導師範例（student_id 是 null）任何人都能看到；學員自己上傳的只有本人登入才看得到，
    # 其他學員上傳的私人媒體一律不會出現在這裡
    if current_student_id is not None:
        visibility_filter = (Media.student_id.is_(None)) | (Media.student_id == current_student_id)
    else:
        visibility_filter = Media.student_id.is_(None)

    return (
        db.query(Media)
        .filter(owner_filter, visibility_filter)
        .order_by(Media.sort_order)
        .all()
    )


@router.post("/admin/media", response_model=MediaOut, dependencies=[Depends(get_current_admin)])
async def upload_media(
    owner_type: str = Form(...),
    owner_id: int = Form(...),
    caption: str = Form(""),
    category: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    media_type, category, file_url = await _validate_and_store_file(file, category)

    media = Media(
        owner_type=owner_type,
        owner_id=owner_id,
        media_type=media_type,
        category=category,
        file_url=file_url,
        caption=caption,
    )
    db.add(media)
    db.commit()
    db.refresh(media)
    return media


@router.delete("/admin/media/{media_id}", dependencies=[Depends(get_current_admin)])
async def delete_media(media_id: int, db: Session = Depends(get_db)):
    media = db.query(Media).get(media_id)
    if not media:
        raise HTTPException(status_code=404, detail="媒體不存在")

    await _delete_stored_file(media)

    db.delete(media)
    db.commit()
    return {"ok": True}


@router.post("/student/media", response_model=MediaOut)
async def upload_student_media(
    owner_type: str = Form(...),
    owner_id: int = Form(...),
    caption: str = Form(""),
    category: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    username: str = Depends(get_current_student),
):
    student = db.query(Student).filter(Student.username == username).first()
    if not student:
        raise HTTPException(status_code=401, detail="找不到學員帳號")

    media_type, category, file_url = await _validate_and_store_file(file, category)

    media = Media(
        owner_type=owner_type,
        owner_id=owner_id,
        media_type=media_type,
        category=category,
        file_url=file_url,
        caption=caption,
        student_id=student.id,
    )
    db.add(media)
    db.commit()
    db.refresh(media)
    return media


@router.delete("/student/media/{media_id}")
async def delete_student_media(
    media_id: int,
    db: Session = Depends(get_db),
    username: str = Depends(get_current_student),
):
    student = db.query(Student).filter(Student.username == username).first()
    if not student:
        raise HTTPException(status_code=401, detail="找不到學員帳號")

    media = db.query(Media).get(media_id)
    if not media:
        raise HTTPException(status_code=404, detail="媒體不存在")
    if media.student_id != student.id:
        raise HTTPException(status_code=403, detail="只能刪除自己上傳的檔案")

    await _delete_stored_file(media)

    db.delete(media)
    db.commit()
    return {"ok": True}
