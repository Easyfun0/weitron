from datetime import datetime
from pydantic import BaseModel


class MediaOut(BaseModel):
    id: int
    owner_type: str
    owner_id: int
    media_type: str
    file_url: str
    caption: str | None = None
    sort_order: int = 0
    created_at: datetime

    class Config:
        from_attributes = True
