from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from fastapi_cache.decorator import cache
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from db import AsyncSessionLocal
from models import AnomalyEvent, Camera

router = APIRouter(prefix="/stats", tags=["stats"])


async def get_db():
    async with AsyncSessionLocal() as db:
        yield db


@router.get("/anomalies")
@cache(expire=300)
async def get_anomalies(
    db: AsyncSession = Depends(get_db),
    building_ids: Optional[List[int]] = Query(
        None, description="Filter by building IDs"
    ),
    camera_ids: Optional[List[int]] = Query(None, description="Filter by camera IDs"),
    start_date: Optional[datetime] = Query(
        None, description="Start date for anomaly period"
    ),
    end_date: Optional[datetime] = Query(
        None, description="End date for anomaly period"
    ),
    min_confidence: Optional[float] = Query(
        None, description="Minimum confidence level"
    ),
    max_confidence: Optional[float] = Query(
        None, description="Maximum confidence level"
    ),
):
    query = select(AnomalyEvent)

    conditions = []

    if building_ids:
        subquery = select(Camera.id).where(Camera.building_id.in_(building_ids))
        conditions.append(AnomalyEvent.camera_id.in_(subquery))

    if camera_ids:
        conditions.append(AnomalyEvent.camera_id.in_(camera_ids))

    if start_date and end_date:
        conditions.append(
            or_(
                and_(
                    AnomalyEvent.start_time >= start_date,
                    AnomalyEvent.start_time <= end_date,
                ),
                and_(
                    AnomalyEvent.end_time >= start_date,
                    AnomalyEvent.end_time <= end_date,
                ),
                and_(
                    AnomalyEvent.start_time <= start_date,
                    AnomalyEvent.end_time >= end_date,
                ),
            )
        )
    elif start_date:
        conditions.append(AnomalyEvent.end_time >= start_date)
    elif end_date:
        conditions.append(AnomalyEvent.start_time <= end_date)

    if min_confidence is not None:
        conditions.append(AnomalyEvent.confidence >= min_confidence)
    if max_confidence is not None:
        conditions.append(AnomalyEvent.confidence <= max_confidence)

    if conditions:
        query = query.where(and_(*conditions))

    result = await db.execute(query)
    anomalies = result.scalars().all()

    return [
        {
            "id": anomaly.id,
            "camera_id": anomaly.camera_id,
            "start_time": anomaly.start_time,
            "end_time": anomaly.end_time,
            "confidence": anomaly.confidence,
            "image_url": anomaly.image_url,
        }
        for anomaly in anomalies
    ]


@router.get("/anomalies/count")
@cache(expire=300)
async def get_anomaly_count(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(func.count(AnomalyEvent.id)))
    count = result.scalar()
    return {"count": count}
