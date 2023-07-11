from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import auth, messages
from starlette.config import Config
from database import initiate_database
from fastapi_socketio import SocketManager
from api.messages import tag_message
import os

app = FastAPI(
    title="ChatApp API",
    description="Backend API for ChatApp",
    version="1.0.0",
)
global online_users

config = Config(".env")
socket_manager = SocketManager(app=app)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(messages.router, prefix="/api/messages", tags=["Messages"])


# Socket.IO event handlers
@socket_manager.on("connect")
async def connect(sid, environ):
    print("Connected:", sid)


@socket_manager.on("add-user")
async def add_user(sid, user_id):
    user_id_list = online_users.get(user_id, [])
    user_id_list.append(sid)
    online_users[user_id] = user_id_list


@socket_manager.on("send-msg")
async def send_msg(sid, data):
    send_user_sockets = online_users.get(data["sender"], None)
    if send_user_sockets:
        for user_socket in send_user_sockets:
            await socket_manager.emit("msg-recieve", data, to=user_socket)


@socket_manager.on("tag-msg")
async def react_msg(sid, data):
    await tag_message(message_id=data["message_id"], tag=data["tag"])
    send_user_sockets = online_users.get(data["sender"], None)
    if send_user_sockets:
        for user_socket in send_user_sockets:
            await socket_manager.emit("tag-recieve", data, to=user_socket)


@app.on_event("startup")
async def start_database():
    await initiate_database()


@app.on_event("shutdown")
async def shutdown():
    pass
    # await app.sio.stop()


@app.get("/")
async def read_root():
    """
    Root endpoint for the ChatApp API.

    Returns:
        str: Welcome message.
    """
    return "Welcome to the ChatApp API!"


if __name__ == "__main__":
    import uvicorn

    online_users = {}

    host = os.getenv("HOST", config("HOST"))
    port = os.getenv("PORT", config("PORT"))

    uvicorn.run(app, host=host, port=port)
