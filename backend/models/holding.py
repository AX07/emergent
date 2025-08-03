from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class HoldingBase(BaseModel):
    account_id: str
    name: str
    ticker: Optional[str] = None
    quantity: float = 0.0
    value: float = 0.0

class HoldingCreate(BaseModel):
    name: str
    ticker: Optional[str] = None
    quantity: float = 0.0
    value: float = 0.0

class HoldingUpdate(BaseModel):
    name: Optional[str] = None
    ticker: Optional[str] = None
    quantity: Optional[float] = None
    value: Optional[float] = None

class Holding(HoldingBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True