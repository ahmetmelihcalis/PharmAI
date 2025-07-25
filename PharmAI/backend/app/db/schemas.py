from pydantic import BaseModel, EmailStr
from typing import List, Optional

# --- Token Şemaları ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[EmailStr] = None

# --- Favori İlaç Şemaları ---
class FavoriteDrugBase(BaseModel):
    drug_name: str

class FavoriteDrugCreate(FavoriteDrugBase): pass

class FavoriteDrug(FavoriteDrugBase):
    id: int
    owner_id: int
    class Config: from_attributes = True

# --- Kullanıcı Şemaları ---
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    favorites: List[FavoriteDrug] = []
    class Config: from_attributes = True

# --- Çeviri Şemaları ---
class BatchTranslateRequest(BaseModel):
    texts: List[str]

class BatchTranslateResponse(BaseModel):
    translated_texts: List[str]