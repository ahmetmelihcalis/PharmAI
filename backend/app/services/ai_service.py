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
    model = genai.GenerativeModel('gemini-1.5-pro')
    print("Gemini API başarıyla yapılandırıldı. Model: gemini-1.5-pro")
except Exception as e:
    print(f"!!! KRİTİK HATA: Gemini API yapılandırılamadı. Hata: {e}")

def _safe_generate_content(prompt: str, retries: int = 3, delay: int = 3) -> str:
    if not model:
        raise Exception("Gemini modeli başlatılamadı.")
    
    import random
    
    temperature = random.uniform(0.8, 1.2)
    top_p = random.uniform(0.85, 0.98)
    top_k = random.randint(35, 50)
    
    generation_config = genai.types.GenerationConfig(
        temperature=temperature,
        max_output_tokens=1800,  
        top_p=top_p,
        top_k=top_k,
        candidate_count=1  
    )
    
    last_exception = None
    for attempt in range(retries):
        try:
            response = model.generate_content(
                prompt, 
                safety_settings=safety_settings, 
                generation_config=generation_config
            )
            
            # Yanıtı kontrol et
            if response and response.text and len(response.text.strip()) > 20:
                return response.text.strip()
            else:
                raise Exception("Boş veya çok kısa yanıt alındı")
                
        except Exception as e:
            last_exception = e
            print(f"DENEME {attempt + 1}/{retries}: Gemini API hatası: {e}")
            if attempt < retries - 1:
                print(f"{delay} saniye bekleniyor...")
                time.sleep(delay)
                delay += 2  
    
    raise last_exception

def extract_key_phrases_from_reviews(reviews_text: str) -> dict:
    """Kullanıcı yorumlarından anahtar kelimeleri ve cümleleri çıkarır."""
    import re
    from collections import Counter

    positive_keywords = ['good', 'great', 'excellent', 'effective', 'helpful', 'works', 'better', 'relief', 'improved']
    negative_keywords = ['bad', 'terrible', 'awful', 'side effect', 'pain', 'nausea', 'headache', 'dizzy', 'worse', 'stopped']
    
    reviews_lower = reviews_text.lower()
    
    positive_count = sum(reviews_lower.count(word) for word in positive_keywords)
    negative_count = sum(reviews_lower.count(word) for word in negative_keywords)

    side_effects = ['headache', 'nausea', 'dizziness', 'fatigue', 'drowsiness', 'dry mouth', 'constipation', 'diarrhea']
    found_side_effects = [effect for effect in side_effects if effect in reviews_lower]
    
    return {
        'positive_sentiment': positive_count,
        'negative_sentiment': negative_count,
        'common_side_effects': found_side_effects,
        'total_length': len(reviews_text)
    }

def create_fallback_summary(drug_name: str, analysis: dict) -> str:
    """AI başarısız olduğunda kullanılacak yedek özet - çok çeşitli ve dinamik."""
    import random
    import time
    
    random.seed(int(time.time() * 1000) % 10000)
    
    positive = analysis['positive_sentiment']
    negative = analysis['negative_sentiment']
    side_effects = analysis['common_side_effects']
    key_phrases = analysis.get('key_phrases', [])
    
    if positive > negative * 1.5:
        overall_options = [
            f"{drug_name} kullanıcıları arasında yüksek memnuniyet oranı gözlemlenmektedir.",
            f"{drug_name} ile tedavi gören hastaların çoğunluğu olumlu sonuçlar bildirmiştir.",
            f"{drug_name} etkinliği konusunda kullanıcı geri bildirimleri ağırlıklı olarak pozitiftir."
        ]
    elif negative > positive * 1.5:
        overall_options = [
            f"{drug_name} kullanımında dikkat edilmesi gereken noktalar bulunmaktadır.",
            f"{drug_name} ile ilgili kullanıcı deneyimleri değişkenlik göstermektedir.",
            f"{drug_name} toleransı kişiden kişiye farklılık gösterebilmektedir."
        ]
    else:
        overall_options = [
            f"{drug_name} hakkında dengeli kullanıcı geri bildirimleri mevcuttur.",
            f"{drug_name} etkinliği ve tolerabilite açısından karma sonuçlar rapor edilmiştir.",
            f"{drug_name} kullanıcı deneyimleri bireysel farklılıklar göstermektedir."
        ]
    
    overall = random.choice(overall_options)
    
    side_effects_tr = {
        'headache': 'baş ağrısı', 'nausea': 'mide bulantısı', 'dizziness': 'baş dönmesi',
        'fatigue': 'yorgunluk', 'drowsiness': 'uyku hali', 'dry mouth': 'ağız kuruluğu',
        'constipation': 'kabızlık', 'diarrhea': 'ishal', 'stomach pain': 'mide ağrısı',
        'insomnia': 'uykusuzluk', 'anxiety': 'kaygı', 'depression': 'depresyon',
        'weight gain': 'kilo alımı', 'weight loss': 'kilo kaybı', 'rash': 'döküntü'
    }
    available_effects = [side_effects_tr.get(effect, effect) for effect in side_effects[:5]]
    selected_effects = random.sample(available_effects, min(3, len(available_effects))) if available_effects else []
    
    benefit_options = [
        ["Hedeflenen semptomların azalması", "Yaşam kalitesinde iyileşme"],
        ["Tedavi edilen durumda belirgin düzelme", "Günlük aktivitelerde kolaylık"],
        ["Semptom kontrolünde etkililik", "Hastalık seyrinde olumlu değişim"],
        ["Belirtilerin hafiflemesi", "Fonksiyonel iyileşme"]
    ]
    
    selected_benefits = random.choice(benefit_options)
    
    format_styles = [
        f"""🔍 **{drug_name} - Kullanıcı Deneyim Analizi**

📊 **Genel Durum:** {overall}

✅ **Bildirilen Faydalar:**
• {selected_benefits[0]}
• {selected_benefits[1]}

⚠️ **Gözlemlenen Yan Etkiler:**
{chr(10).join([f'• {effect.capitalize()}' for effect in selected_effects]) if selected_effects else '• Belirgin yan etki bildirilmemiştir'}

💡 **Kullanıcı Notları:** Bireysel tepkiler değişkenlik gösterebilir. Doktor kontrolü önerilir.""",
        
        f"""**{drug_name} Hasta Geri Bildirim Özeti**

**Değerlendirme:** {overall}

**Pozitif Etkiler:**
→ {selected_benefits[0]}
→ {selected_benefits[1]}

**Dikkat Edilecek Noktalar:**
{chr(10).join([f'→ {effect.capitalize()}' for effect in selected_effects]) if selected_effects else '→ Önemli yan etki raporu bulunmamaktadır'}

**Önemli:** Bu bilgiler hasta deneyimlerine dayanır. Tıbbi karar için doktorunuza başvurun."""
    ]
    
    return random.choice(format_styles)

def summarize_reviews_with_gemini(reviews_text: str, drug_name: str) -> str:
    if not model: return "Yapay zeka servisi başlatılamadı."
    if not reviews_text.strip(): return "Özetlenecek yorum bulunamadı."
    
    analysis = extract_key_phrases_from_reviews(reviews_text)
    
    clean_reviews = reviews_text[:4000]  # Daha fazla veri al
    
    import random
    import time
    
    random.seed(int(time.time() * 1000) % 10000)
    
    prompt_styles = [
        f"""
Sen deneyimli bir eczacı ve veri analisti olarak {drug_name} ilacı hakkındaki hasta yorumlarını bilimsel bir yaklaşımla incele.

GÖREVİN:
• Her yorumu sistematik olarak kategorize et
• Nicel verileri (sayı, yüzde, süre) öne çıkar
• Hasta profillerini belirle
• Trend analizi yap
• En az 450 kelimelik kapsamlı rapor hazırla

ANALİZ KURALLARI:
✓ Somut veriler kullan ("15 hasta içinde 8'i...")
✓ Zaman aralıklarını belirt ("2 hafta içinde...")
✓ Doz bilgilerini dahil et
✓ Yaş/cinsiyet dağılımını not et
✓ Karşılaştırmalı analiz yap

RAPOR FORMATI:

📊 **{drug_name} - Bilimsel Hasta Deneyim Raporu**

📈 **İstatistiksel Bulgular:**
[Kesin sayılar, yüzde dağılımlar, ortalama değerler. En az 4 cümle]

👥 **Hasta Profil Analizi:**
[Yaş, cinsiyet, kullanım süresi dağılımı. Spesifik örnekler. En az 4 cümle]

⚙️ **Etkinlik Değerlendirmesi:**
[Hangi durumda ne kadar etkili? Zaman çizelgesi. Karşılaştırmalar. En az 4 cümle]

⚠️ **Yan Etki Profili:**
[Hangi yan etkiler ne sıklıkta? Ciddiyeti? Örnekler. En az 4 cümle]

📝 **Hasta Alıntıları:**
[3-4 önemli hasta yorumu aynen aktar]

📉 **Genel Değerlendirme:**
[Sonuç ve öneriler. Risk-fayda analizi. En az 3 cümle]
""",
        
        f"""
Sen hasta deneyimlerini anlatan uzman bir tıbbi gazeteci olarak {drug_name} hakkındaki gerçek hasta hikayelerini derle.

MISYONUN:
• Her hasta yorumunu bir hikaye parçası gibi ele al
• Duygusal ve fiziksel değişimleri takip et
• Zaman çizelgesini oluştur
• Gerçek hasta seslerini duyur
• En az 400 kelimelik etkileyici anlatım yap

HIKAYE KURALLARI:
✓ Gerçek hasta sözlerini kullan
✓ Kronolojik sıra takip et
✓ Duygu değişimlerini vurgula
✓ Sonuçları net belirt
✓ Ümit ve zorlukları dengele

HIKAYE FORMATI:

📚 **{drug_name} - Hasta Hikayelerinden Dersler**

🌅 **Başlangıç Hikayeleri:**
[Hastaların ilk deneyimleri, beklentileri. Gerçek alıntılar. En az 4 cümle]

🚪 **Dönüşüm Anı:**
[Kritik değişim noktaları, şaşırtıcı sonuçlar. Detaylı örnekler. En az 4 cümle]

⚖️ **Zorluklar ve Çözümler:**
[Yan etkilerle mücadele, uyum süreci. Hasta stratejileri. En az 4 cümle]

🎆 **Başarı Hikayeleri:**
[Olumlu sonuçlar, yaşam kalitesi artışı. İlham verici örnekler. En az 4 cümle]

🗣️ **Hasta Sesleri:**
[Dorudan hasta alıntıları, tavsiyeleri]

📝 **Hikayelerden Çıkarılan Dersler:**
[Genel patern, önemli noktalar. En az 3 cümle]
""",
        
        f"""
Sen deneyimli bir eczacı olarak {drug_name} kullanacak hastalara pratik rehberlik sağla. Gerçek hasta deneyimlerinden yola çıkarak.

REHBER GÖREVİ:
• Hasta yorumlarını pratik bilgilere dönüştür
• Beklentileri gerçekçi şekilde belirle
• Hazırlık ve takip önerileri ver
• Sorun çözme stratejileri sun
• En az 420 kelimelik kullanışlı rehber hazırla

REHBER İLKELERİ:
✓ Uygulanabilir tavsiyeler
✓ Gerçek hasta deneyimlerinden örnekler
✓ Zaman çizelgesi rehberi
✓ Beklenti yönetimi
✓ Acil durum işaretleri

REHBER FORMATI:

📝 **{drug_name} - Hasta Deneyimli Kullanım Rehberi**

🚀 **Başlamadan Önce Bilinmesi Gerekenler:**
[Hazırlık, beklentiler, ilk adımlar. Hasta örnekleri. En az 4 cümle]

📅 **İlk Haftalarda Neler Beklenir:**
[Erken dönem deneyimleri, uyum süreci. Zaman çizelgesi. En az 4 cümle]

🎯 **Etkinlik Takibi:**
[Nasıl ölçülür, hangi belirtiler izlenir. Pratik ipucu. En az 4 cümle]

⚠️ **Yan Etki Yönetimi:**
[Hangi yan etkiler normal, ne zaman endişe. Çözüm önerileri. En az 4 cümle]

💬 **Hasta Tavsiyeleri:**
[Deneyimli hastalardan pratik öneriler]

✅ **Başarı İçin Öneriler:**
[Optimum sonuç için stratejiler. En az 3 cümle]
"""
    ]
    prompt = random.choice(prompt_styles) + f"""

HASTA YORUMLARI:
{clean_reviews}

ÖNEMLİ: En az 400 kelime yaz. Her bölüm detaylı olmalı. Sadece yorumlardaki bilgileri kullan!"""
    
    try:
        result = _safe_generate_content(prompt)
        
        problematic_phrases = [
            "genel olarak", "kullanıcı deneyimleri", "rapor edilmiştir", 
            "belirtilmiştir", "geri bildirim", "analiz sonucları",
            "hata oluştu", "sorry", "cannot", "unable"
        ]
        
        is_problematic = (
            len(result.strip()) < 300 or  
            any(phrase in result.lower() for phrase in problematic_phrases) or  
            result.count('•') < 3 or 
            drug_name.lower() not in result.lower()  
        )
        
        if is_problematic:
            print(f"AI özeti kalitesiz (uzunluk: {len(result)}), fallback kullanılıyor: {drug_name}")
            return create_fallback_summary(drug_name, analysis)
            
        return result
    except Exception as e:
        print(f"Gemini özetleme hatası: {e}")
        return create_fallback_summary(drug_name, analysis)

def translate_batch_with_gemini(texts: List[str]) -> List[str]:
    if not model: return ["[AI Servisi kapalı]"] * len(texts)
    if not texts: return []
    
    if len(texts) <= 3:
        results = []
        for text in texts:
            try:
                prompt = f"""Bu İngilizce hastalık/durum ismini Türkçe'ye çevir. 
Sadece çeviriyi döndür, başka açıklama ekleme.
Büyük harfle başlasın.

İngilizce: {text}
Türkçe:"""
                translated = _safe_generate_content(prompt)
                clean_translation = translated.strip().strip('"').strip("'")
                if clean_translation and not clean_translation[0].isupper():
                    clean_translation = clean_translation.capitalize()
                results.append(clean_translation)
            except:
                simple_trans = text.replace('_', ' ').title()
                results.append(simple_trans)
        return results
    
    numbered_texts = "\n".join([f"{i+1}. {text}" for i, text in enumerate(texts)])
    prompt = f"""
Aşağıdaki numaralı İngilizce metinleri Türkçe'ye çevir.
Sadece numaralı çeviri listesini döndür, başka açıklama ekleme.

{numbered_texts}

Türkçe çeviriler:"""
    
    try:
        response_text = _safe_generate_content(prompt)
        translated_lines = response_text.strip().split('\n')
        results = []
        
        for line in translated_lines:
            if re.match(r'^\d+\.\s', line):
                translation = line.split('. ', 1)[1] if '. ' in line else line
                results.append(translation.strip())
        
        while len(results) < len(texts):
            results.append("[Çeviri tamamlanamadı]")
            
        return results[:len(texts)]
        
    except Exception as e:
        print(f"Gemini toplu çeviri hatası: {e}")
        return ["[API hatası]"] * len(texts)