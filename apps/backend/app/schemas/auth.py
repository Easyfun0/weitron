from pydantic import BaseModel


class AuthLoginRequest(BaseModel):
    username: str
    password: str


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str  # "admin" | "student"
    username: str
