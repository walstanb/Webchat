from beanie import Document
from pydantic import BaseModel, EmailStr
from datetime import datetime


class User(Document):
    username: str
    email: EmailStr
    password: str

    class Settings:
        name = "users"


class UserLogin(BaseModel):
    username: str
    password: str
