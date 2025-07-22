import pandas as pd
from pathlib import Path
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
import html
import time

# Proje içi modülleri import etme
from app.core import security
from app.db import models, schemas, crud
from app.db.database import engine, get_db
from app.services import ai_service, nlp_service, interaction_service
from fastapi.middleware.cors import CORSMiddleware

# Uygulama ilk çalıştığında veritabanı tablolarını oluştur
models.Base.metadata.create_all(bind=engine)

# FastAPI uygulamasını başlat
app = FastAPI(
    title="PharmAI API",
    description="Yapay Zeka Destekli İlaç Rehberi API'si",
    version="Final v2"
)

# Frontend'in erişebilmesi için CORS ayarları
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global DataFrame değişkeni
df_drugs = None

def _run_preprocessing():
    """Ham veriyi okur, temizler, API ile uyumlu olanları filtreler ve işlenmiş bir TSV dosyası olarak kaydeder."""
    print("İşlenmiş veri bulunamadı. İlk çalıştırma için veri işleniyor...")
    data_dir = Path(__file__).parent / "data"
    
    print("Ham veriler okunuyor ve birleştiriliyor...")
    df_train = pd.read_csv(data_dir / "drugsComTrain_raw.tsv", sep='\t')
    df_test = pd.read_csv(data_dir / "drugsComTest_raw.tsv", sep='\t')
    df = pd.concat([df_train, df_test], ignore_index=True)
    df.rename(columns={"drugName": "drug_name", "usefulCount": "useful_count"}, inplace=True)
    df.dropna(subset=['drug_name', 'condition', 'review'], inplace=True)

    print(f"Başlangıçta {df['drug_name'].nunique()} benzersiz ilaç var.")
    
    unique_raw_drugs = df['drug_name'].unique()
    valid_drugs_for_interaction = []
    print("İlaçların API uyumluluğu kontrol ediliyor (Bu işlem birkaç dakika sürebilir)...")
    for i, drug in enumerate(unique_raw_drugs):
        if interaction_service.get_rxcui(drug):
            valid_drugs_for_interaction.append(drug)
        time.sleep(0.1)
        if (i + 1) % 50 == 0: print(f"  -> {i + 1}/{len(unique_raw_drugs)} ilaç kontrol edildi...")
    
    print(f"API uyumlu {len(valid_drugs_for_interaction)} ilaç bulundu.")
    df_filtered = df[df['drug_name'].isin(valid_drugs_for_interaction)].copy()

    review_counts = df_filtered['drug_name'].value_counts()
    drugs_with_enough_reviews = review_counts[review_counts >= 10].index.tolist()
    
    df_final = df_filtered[df_filtered['drug_name'].isin(drugs_with_enough_reviews)].copy()
    print(f"Sonuç: {df_final['drug_name'].nunique()} adet yüksek kaliteli ilaç listeye eklendi.")
    
    df_final['review'] = df_final['review'].apply(lambda x: html.unescape(str(x)))
    df_final['condition'] = df_final['condition'].apply(lambda x: html.unescape(str(x)))

    output_path = data_dir / "processed_drug_data.tsv"
    df_final.to_csv(output_path, sep='\t', index=False)
    print(f"İşlenmiş veri başarıyla '{output_path}' dosyasına kaydedildi.")
    return df_final

@app.on_event("startup")
def load_data():
    """Uygulama başlarken işlenmiş veri setini arar, yoksa oluşturur ve yükler."""
    global df_drugs
    data_path = Path(__file__).parent / "data/processed_drug_data.tsv"
    try:
        if data_path.exists():
            print("İşlenmiş veri seti bulundu, yükleniyor...")
            df_drugs = pd.read_csv(data_path, sep='\t')
        else:
            df_drugs = _run_preprocessing()
        
        if 'uniqueID' not in df_drugs.columns:
            df_drugs.reset_index(drop=True, inplace=True)
            df_drugs['uniqueID'] = df_drugs.index
        
        print(f"Veri seti başarıyla yüklendi.")
    except FileNotFoundError as e:
        print(f"!!! KRİTİK HATA: Ham veri dosyası bulunamadı: {e.filename}")
        df_drugs = pd.DataFrame()
    except Exception as e:
        print(f"!!! KRİTİK HATA: Veri seti yüklenirken sunucu çöktü: {e}")
        df_drugs = pd.DataFrame()

# --- Kimlik Doğrulama (Authentication) ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        email: str = payload.get("sub")
        if email is None: raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = crud.get_user_by_email(db, email=token_data.email)
    if user is None: raise credentials_exception
    return user

# --- API ENDPOINT'LERİ ---
@app.get("/")
def read_root(): return {"message": "PharmAI API'sine hoş geldiniz!"}

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Hatalı e-posta veya şifre")
    access_token = security.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayıtlı")
    return crud.create_user(db=db, user=user)

@app.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.post("/users/me/favorites", response_model=schemas.FavoriteDrug)
def add_favorite_for_current_user(favorite: schemas.FavoriteDrugCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_user_favorite(db=db, favorite=favorite, user_id=current_user.id)

@app.get("/drugs")
def get_all_drugs():
    if df_drugs is None or df_drugs.empty: raise HTTPException(status_code=503, detail="İlaç verileri mevcut değil.")
    unique_drugs = df_drugs['drug_name'].unique().tolist()
    return {"drugs": sorted(unique_drugs)}

@app.get("/drugs/popular")
def get_popular_drugs():
    if df_drugs is None or df_drugs.empty: raise HTTPException(status_code=503, detail="İlaç verileri mevcut değil.")
    drug_stats = df_drugs.groupby('drug_name').agg(average_rating=('rating', 'mean'), total_useful=('useful_count', 'sum')).reset_index()
    return drug_stats.sort_values(by='total_useful', ascending=False).head(12).to_dict(orient='records')

@app.get("/drugs/top-rated")
def get_top_rated_drugs():
    if df_drugs is None or df_drugs.empty: raise HTTPException(status_code=503, detail="İlaç verileri mevcut değil.")
    drug_stats = df_drugs.groupby('drug_name').agg(average_rating=('rating', 'mean'), review_count=('drug_name', 'count')).reset_index()
    significant_drugs = drug_stats[drug_stats['review_count'] >= 20]
    return significant_drugs.sort_values(by='average_rating', ascending=False).head(12).to_dict(orient='records')

@app.get("/drugs/most-reviewed")
def get_most_reviewed_drugs():
    if df_drugs is None or df_drugs.empty: raise HTTPException(status_code=503, detail="İlaç verileri mevcut değil.")
    drug_stats = df_drugs.groupby('drug_name').agg(average_rating=('rating', 'mean'), review_count=('drug_name', 'count')).reset_index()
    return drug_stats.sort_values(by='review_count', ascending=False).head(12).to_dict(orient='records')

@app.get("/drugs/{drug_name}")
def get_drug_details(drug_name: str):
    if df_drugs is None or df_drugs.empty: raise HTTPException(status_code=503, detail="İlaç verileri mevcut değil.")
    drug_data = df_drugs[df_drugs['drug_name'].str.lower() == drug_name.lower()]
    if drug_data.empty: raise HTTPException(status_code=404, detail=f"'{drug_name}' isimli ilaç bulunamadı.")
    return drug_data.to_dict(orient='records')
  
@app.get("/search")
def search_drugs_and_conditions(query: str):
    if df_drugs is None or df_drugs.empty: raise HTTPException(status_code=503, detail="İlaç verileri mevcut değil.")
    query_lower = query.lower()
    matched_drugs = df_drugs[df_drugs['drug_name'].str.lower().str.contains(query_lower, na=False)]
    matched_conditions = df_drugs[df_drugs['condition'].str.lower().str.contains(query_lower, na=False)]
    drugs_for_condition = matched_conditions.groupby('drug_name').agg(average_rating=('rating', 'mean'), review_count=('drug_name', 'count')).reset_index().sort_values(by='review_count', ascending=False)
    return { "direct_matches": matched_drugs['drug_name'].unique().tolist()[:10], "condition_matches": drugs_for_condition.to_dict(orient='records')[:10] }

@app.get("/drugs/{drug_name}/summary")
def get_drug_summary(drug_name: str, db: Session = Depends(get_db)):
    cached_summary = crud.get_summary_from_cache(db, drug_name=drug_name)
    if cached_summary:
        print(f"'{drug_name}' özeti CACHE'DEN okundu.")
        return {"drug_name": drug_name, "summary": cached_summary.summary_text}
    
    print(f"'{drug_name}' özeti API'DEN alınıyor...")
    drug_data = df_drugs[df_drugs['drug_name'].str.lower() == drug_name.lower()]
    if drug_data.empty: raise HTTPException(status_code=404, detail=f"'{drug_name}' isimli ilaç bulunamadı.")
    
    # --- DEĞİŞİKLİK BURADA: YORUM SAYISI 5'E DÜŞÜRÜLDÜ ---
    top_reviews = drug_data.sort_values(by='useful_count', ascending=False).head(5)
    
    reviews_text = "\n".join(top_reviews['review'].tolist())
    summary = ai_service.summarize_reviews_with_gemini(reviews_text, drug_name)
    
    if "hata oluştu" not in summary.lower():
        crud.add_summary_to_cache(db, drug_name=drug_name, summary_text=summary)
        print(f"'{drug_name}' özeti CACHE'E yazıldı.")
    return {"drug_name": drug_name, "summary": summary}

@app.post("/batch-translate", response_model=schemas.BatchTranslateResponse)
def batch_translate_texts(request: schemas.BatchTranslateRequest, db: Session = Depends(get_db)):
    texts_to_translate = request.texts
    if not texts_to_translate: return {"translated_texts": []}
    cached_translations = crud.get_translations_from_cache(db, original_texts=texts_to_translate)
    texts_for_api = [text for text in texts_to_translate if text not in cached_translations]
    new_translations = {}
    if texts_for_api:
        translated_list_from_api = ai_service.translate_batch_with_gemini(texts_for_api)
        new_translations = dict(zip(texts_for_api, translated_list_from_api))
        successful_new_translations = {k: v for k, v in new_translations.items() if not k.startswith("[") and not v.startswith("[")}
        if successful_new_translations:
            crud.add_translations_to_cache(db, translations_map=successful_new_translations)
            print(f"{len(successful_new_translations)} yeni çeviri CACHE'E yazıldı.")
    final_translations = {**cached_translations, **new_translations}
    ordered_results = [final_translations.get(text, text) for text in texts_to_translate]
    return {"translated_texts": ordered_results}

@app.get("/compare")
def compare_two_drugs(drug1: str, drug2: str):
    if df_drugs is None or df_drugs.empty: raise HTTPException(status_code=503, detail="İlaç verileri mevcut değil.")
    comparison_result = nlp_service.compare_drugs(df_drugs, drug1, drug2)
    if comparison_result is None: raise HTTPException(status_code=404, detail="İlaçlardan biri veya her ikisi bulunamadı.")
    return comparison_result

@app.get("/check-interaction")
def check_drug_interaction(drug1: str, drug2: str):
    rxcui1 = interaction_service.get_rxcui(drug1)
    rxcui2 = interaction_service.get_rxcui(drug2)
    if not rxcui1: raise HTTPException(status_code=404, detail=f"'{drug1}' için standart bir kod bulunamadı.")
    if not rxcui2: raise HTTPException(status_code=404, detail=f"'{drug2}' için standart bir kod bulunamadı.")
    
    interaction_data = interaction_service.find_interactions_by_rxcuis([rxcui1, rxcui2])
    if not interaction_data: return {"message": f"'{drug1}' ve '{drug2}' arasında bilinen bir etkileşim bulunamadı."}
    
    processed_interactions = interaction_service.process_interaction_data(drug1, drug2, interaction_data)
    if not processed_interactions: return {"message": f"'{drug1}' ve '{drug2}' arasında bilinen bir etkileşim bulunamadı."}
    return {"interactions": processed_interactions}