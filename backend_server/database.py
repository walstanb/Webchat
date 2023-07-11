from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from starlette.config import Config

from models.user import User
from models.message import MessageModel
import os


async def initiate_database():
    config = Config(".env")
    client = AsyncIOMotorClient(os.getenv("MONGO_URL", config("MONGO_URL")))
    await init_beanie(
        database=client[os.getenv("MONGO_DBNAME", config("MONGO_DBNAME"))],
        document_models=[User, MessageModel],
    )
