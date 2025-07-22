import google.generativeai as genai
import os
import time
from dotenv import load_dotenv
from google.generativeai.types import HarmCategory, HarmBlockThreshold
import re
from typing import List

load_dotenv()
model = None
safety_settings = {}

try:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY bulunamadı. Lütfen .env dosyasını kontrol edin.")
    genai.configure(api_key=api_key)
    safety_settings = {
        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
    }
    model = genai.GenerativeModel('gemini-2.5-flash-latest')
    print("Gemini API başarıyla yapılandırıldı. Model: gemini-2.5-flash-latest")
except Exception as e:
    print(f"!!! KRİTİK HATA: Gemini API yapılandırılamadı. Hata: {e}")

def _safe_generate_content(prompt: str, retries: int = 2, delay: int = 5) -> str:
    """API isteğini güvenli bir şekilde yapar, başarısız olursa tekrar dener."""
    if not model:
        raise Exception("Gemini modeli başlatılamadı.")
    generation_config = genai.types.GenerationConfig(temperature=0.25)
    last_exception = None
    for attempt in range(retries):
        try:
            response = model.generate_content(
                prompt, safety_settings=safety_settings, generation_config=generation_config
            )
            return response.text
        except Exception as e:
            last_exception = e
            print(f"ATTEMPT {attempt + 1}/{retries}: Gemini API hatası: {e}")
            if attempt < retries - 1:
                print(f"{delay} saniye bekleniyor...")
                time.sleep(delay)
    raise last_exception

def summarize_reviews_with_gemini(reviews_text: str, drug_name: str) -> str:
    if not model: return "Yapay zeka servisi başlatılamadı."
    if not reviews_text.strip(): return "Özetlenecek yorum bulunamadı."
    prompt = f"""
    GÖREV: Aşağıdaki İngilizce ilaç yorumlarını analiz ederek, belirtilen formatta Türkçe bir özet çıkar.
    KURALLAR:
    - Çıktı SADECE ve SADECE aşağıda belirtilen 4 maddelik formatta olmalıdır.
    - Asla tıbbi tavsiye verme. Yorumları tarafsız bir şekilde özetle.
    - Cevabın tamamen Türkçe olsun.
    - Eğer yorumlar yetersizse veya konu dışıysa, "Bu konuda yeterli bilgi bulunamadı." yaz.
    FORMAT:
    1.  **Genel Değerlendirme:** ...
    2.  **Yaygın Olumlu Etkiler:** ...
    3.  **Yaygın Yan Etkiler:** ...
    4.  **Önemli Notlar:** ...
    İŞLENECEK YORUMLAR: --- {reviews_text} ---
    """
    try:
        return _safe_generate_content(prompt)
    except Exception as e:
        print(f"Gemini özetleme hatası (tüm denemelerden sonra): {e}")
        return f"Yorumlar özetlenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."

def translate_batch_with_gemini(texts: List[str]) -> List[str]:
    if not model: return ["[AI Servisi kapalı]"] * len(texts)
    if not texts: return []
    numbered_texts = "\n".join([f"{i+1}. {text}" for i, text in enumerate(texts)])
    prompt = f"""
    Aşağıda numaralandırılmış bir liste halinde İngilizce metinler bulunmaktadır.
    Her bir metni akıcı bir şekilde Türkçe'ye çevir. Cevabını, orijinal numaralandırmayı koruyarak, yine aynı formatta bir liste olarak ver.
    Sadece çevrilmiş listeyi döndür, başka hiçbir açıklama ekleme.
    İngilizce Liste: --- {numbered_texts} --- Türkçe Liste:
    """
    try:
        response_text = _safe_generate_content(prompt)
        translated_lines = response_text.strip().split('\n')
        results = [line.split('. ', 1)[1] for line in translated_lines if re.match(r'^\d+\.\s', line)]
        if len(results) != len(texts):
            return ["[Toplu çeviri hatası]"] * len(texts)
        return results
    except Exception as e:
        print(f"Gemini toplu çeviri hatası (tüm denemelerden sonra): {e}")
        return ["[API hatası]"] * len(texts)