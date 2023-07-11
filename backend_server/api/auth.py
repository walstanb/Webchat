from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from bson.objectid import ObjectId
from passlib.hash import bcrypt
from datetime import datetime
from starlette.responses import Response
from models.user import User, UserLogin


router = APIRouter()


@router.post("/login")
async def login(user: UserLogin):
    """
    Authenticate a user and return the user details.
    """
    try:
        stored_user = await User.find_one(User.username == user.username)

        if not stored_user:
            return {"msg": "Incorrect username or password", "status": False}

        if not bcrypt.verify(user.password, stored_user.password):
            return {"msg": "Incorrect username or password", "status": False}

        del stored_user.password
        response_data = {"status": True, "user": stored_user}
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("/register")
async def register(user: User):
    """
    Register a new user and return the registered user details.
    """
    try:
        existing_user = await User.find_one(User.username == user.username)
        if existing_user:
            return {"msg": "Username already exists", "status": False}

        existing_email = await User.find_one(User.email == user.email)
        if existing_email:
            return {"msg": "Email already exists", "status": False}

        user.password = bcrypt.hash(user.password)

        new_user = await user.create()

        del new_user.password
        response_data = {"status": True, "user": new_user}
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")


@router.get("/allusers/{user_id}")
async def get_all_users(user_id: str):
    """
    Retrieve all users except the current user.
    """
    try:
        users = await User.find({"_id": {"$ne": ObjectId(user_id)}}).to_list()
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error {e}")


@router.get("/logout/{user_id}")
def logout(user_id: str):
    """
    Remove the user from the online users.
    """
    try:
        # save last seen datetime
        return {"status": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")
