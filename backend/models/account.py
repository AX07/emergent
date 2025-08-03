from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class AccountBase(BaseModel):
    name: str
    institution: Optional[str] = None
    category: str  # 'Bank Accounts', 'Equities', 'Crypto', 'Real Estate'
    balance: float = 0.0

class AccountCreate(AccountBase):
    pass

class AccountUpdate(BaseModel):
    name: Optional[str] = None
    institution: Optional[str] = None
    category: Optional[str] = None
    balance: Optional[float] = None

class Account(AccountBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True