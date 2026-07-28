from pydantic import BaseModel


class StudentAuthRequest(BaseModel):
    username: str
    password: str


class StudentTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
