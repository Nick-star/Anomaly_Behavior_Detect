from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from urllib.parse import urlparse


class BuildingBase(BaseModel):
    name: str
    address: Optional[str] = None


class BuildingCreate(BuildingBase):
    pass


class BuildingRead(BuildingBase):
    id: int

    class Config:
        from_attributes = True


class CameraBase(BaseModel):
    name: str
    url: str
    building_id: Optional[int] = None

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        try:
            parsed_url = urlparse(v)
            if not parsed_url.scheme:
                raise ValueError("URL must have a scheme (http, https, rtsp)")

            if parsed_url.scheme not in ["http", "https", "rtsp"]:
                raise ValueError("URL scheme must be http, https, or rtsp")

            if not parsed_url.netloc:
                raise ValueError("URL must have a host")

            return v
        except Exception as e:
            raise ValueError(f"Invalid URL: {str(e)}")


class CameraCreate(CameraBase):
    pass


class CameraRead(CameraBase):
    id: int

    class Config:
        from_attributes = True


class AnomalyEventBase(BaseModel):
    camera_id: int
    start_time: datetime
    end_time: datetime
    confidence: float
    image_url: str


class AnomalyEventCreate(AnomalyEventBase):
    pass


class AnomalyEventRead(AnomalyEventBase):
    id: int

    class Config:
        from_attributes = True
