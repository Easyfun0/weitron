from datetime import datetime

from pydantic import BaseModel


class NoteIn(BaseModel):
    content: str


class NoteOut(BaseModel):
    content: str = ""
    updated_at: datetime | None = None

    class Config:
        from_attributes = True
