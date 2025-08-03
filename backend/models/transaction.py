from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from pydantic import validator
import uuid

class TransactionBase(BaseModel):
    date: date
    description: str
    amount: float  # negative for expenses, positive for income
    category: str
    account_id: str

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    date: Optional[date] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    account_id: Optional[str] = None

class Transaction(TransactionBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @validator('date', pre=True)
    def convert_date_to_string(cls, v):
        if isinstance(v, date):
            return v.strftime('%Y-%m-%d')
        return v

    class Config:
        from_attributes = True