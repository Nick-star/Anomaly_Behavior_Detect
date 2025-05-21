from fastapi import APIRouter, Depends, status
from fastapi_cache.decorator import cache
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from db import AsyncSessionLocal
from models import Building, Camera
from schemas import BuildingCreate, BuildingRead, CameraCreate, CameraRead

router = APIRouter(prefix="/admin", tags=["admin"])


async def get_db():
    async with AsyncSessionLocal() as db:
        yield db


@router.post(
    "/buildings",
    response_model=BuildingRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_building(
    b: BuildingCreate,
    db: AsyncSession = Depends(get_db),
):
    building = Building(**b.model_dump())
    db.add(building)
    await db.commit()
    await db.refresh(building)
    return building


@router.get("/buildings", response_model=list[BuildingRead])
@cache(expire=300)
async def list_buildings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Building))
    buildings = result.scalars().all()
    return buildings


@router.post(
    "/cameras",
    response_model=CameraRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_camera(
    c: CameraCreate,
    db: AsyncSession = Depends(get_db),
):
    camera = Camera(**c.model_dump())
    db.add(camera)
    await db.commit()
    await db.refresh(camera)
    return camera


@router.get("/cameras", response_model=list[CameraRead])
@cache(expire=300)
async def list_cameras(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Camera))
    cameras = result.scalars().all()
    return cameras
