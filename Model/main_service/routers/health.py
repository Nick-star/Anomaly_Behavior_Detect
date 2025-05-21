import cv2
import asyncio
from fastapi import APIRouter, Depends, HTTPException
from fastapi_cache.decorator import cache
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from db import AsyncSessionLocal
from models import Camera

router = APIRouter(prefix="/health", tags=["health"])


async def get_db():
    async with AsyncSessionLocal() as db:
        yield db


@router.get("/cameras/{camera_id}")
@cache(expire=60)
async def check_camera_health(
    camera_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Camera).where(Camera.id == camera_id))
    camera = result.scalars().first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")

    try:
        cap = cv2.VideoCapture(camera.url)
        if not cap.isOpened():
            return {"status": "error", "message": "Cannot open camera stream"}

        ret, frame = cap.read()
        cap.release()

        if not ret:
            return {"status": "error", "message": "Cannot read frame from camera"}

        return {"status": "ok", "message": "Camera is working"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
