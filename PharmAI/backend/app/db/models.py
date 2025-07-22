from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    favorites = relationship("FavoriteDrug", back_populates="owner")

class FavoriteDrug(Base):
    __tablename__ = "favorite_drugs"
    id = Column(Integer, primary_key=True, index=True)
    drug_name = Column(String, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="favorites")

class TranslationCache(Base):
    __tablename__ = "translation_cache"
    id = Column(Integer, primary_key=True, index=True)
    original_text = Column(Text, unique=True, index=True) 
    translated_text = Column(Text)

class SummaryCache(Base):
    __tablename__ = "summary_cache"
    id = Column(Integer, primary_key=True, index=True)
    drug_name = Column(String, unique=True, index=True)
    summary_text = Column(Text)