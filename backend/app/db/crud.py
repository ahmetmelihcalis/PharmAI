from sqlalchemy.orm import Session
from . import models, schemas
from app.core.security import get_password_hash
from typing import List, Dict

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_user_favorite(db: Session, favorite: schemas.FavoriteDrugCreate, user_id: int):
    existing = db.query(models.FavoriteDrug).filter_by(owner_id=user_id, drug_name=favorite.drug_name).first()
    if existing: return existing
    db_favorite = models.FavoriteDrug(**favorite.model_dump(), owner_id=user_id)
    db.add(db_favorite)
    db.commit()
    db.refresh(db_favorite)
    return db_favorite

def get_summary_from_cache(db: Session, drug_name: str):
    return db.query(models.SummaryCache).filter(models.SummaryCache.drug_name == drug_name).first()

def add_summary_to_cache(db: Session, drug_name: str, summary_text: str):
    db_summary = models.SummaryCache(drug_name=drug_name, summary_text=summary_text)
    db.add(db_summary)
    db.commit()
    db.refresh(db_summary)
    return db_summary

def get_translations_from_cache(db: Session, original_texts: List[str]):
    cached = db.query(models.TranslationCache).filter(models.TranslationCache.original_text.in_(original_texts)).all()
    return {item.original_text: item.translated_text for item in cached}

def add_translations_to_cache(db: Session, translations_map: Dict[str, str]):
    existing_texts_q = db.query(models.TranslationCache.original_text).filter(models.TranslationCache.original_text.in_(translations_map.keys()))
    existing_texts = {text for text, in existing_texts_q}
    new_items_to_add = [
        models.TranslationCache(original_text=k, translated_text=v)
        for k, v in translations_map.items() if k not in existing_texts
    ]
    if new_items_to_add:
        db.add_all(new_items_to_add)
        db.commit()

def clear_summary_cache(db: Session) -> int:
    """Tüm özet cache'ini temizler ve silinen kayıt sayısını döndürür"""
    count = db.query(models.SummaryCache).count()
    db.query(models.SummaryCache).delete()
    db.commit()
    return count

def update_user_display_name(db: Session, user_id: int, display_name: str):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None
    user.display_name = display_name
    db.commit()
    db.refresh(user)
    return user