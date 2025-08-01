from pydantic import BaseModel, EmailStr
from typing import List, Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[EmailStr] = None

class FavoriteDrugBase(BaseModel):
    drug_name: str

class FavoriteDrugCreate(FavoriteDrugBase): pass

class FavoriteDrug(FavoriteDrugBase):
    id: int
    owner_id: int
    class Config: from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    display_name: str | None = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    favorites: List[FavoriteDrug] = []
    class Config: from_attributes = True

class BatchTranslateRequest(BaseModel):
    texts: List[str]

class BatchTranslateResponse(BaseModel):
    translated_texts: List[str]