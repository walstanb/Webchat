from pydantic import BaseModel
from beanie import Document, PydanticObjectId
from typing import List, Optional
from datetime import datetime
from pydantic.dataclasses import dataclass


@dataclass
class Message:
    text: str


class AddMessageModel(BaseModel):
    sender: str
    message: str
    receiver: str


class GetMessageModel(BaseModel):
    sender: str
    receiver: str


@dataclass
class TagModel:
    message_id: str
    tag: str


class MessageModel(Document):
    message: Message
    users: List[str]
    sender: PydanticObjectId
    createdAt: datetime = datetime.now()
    tag: Optional[str]

    class Settings:
        name = "messages"

    class Config:
        orm_mode = True
