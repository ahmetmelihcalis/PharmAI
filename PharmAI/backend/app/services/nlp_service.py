import pandas as pd
from collections import Counter
from . import ai_service 

def compare_drugs(df: pd.DataFrame, drug1_name: str, drug2_name: str):
    """İki ilacı veri setine göre karşılaştırır ve durumları (conditions) Türkçeye çevirir."""
    drug1_data = df[df['drug_name'].str.lower() == drug1_name.lower()]
    drug2_data = df[df['drug_name'].str.lower() == drug2_name.lower()]

    if drug1_data.empty or drug2_data.empty:
        return None

    drug1_top_conditions_dict = drug1_data['condition'].value_counts().head(3).to_dict()
    drug2_top_conditions_dict = drug2_data['condition'].value_counts().head(3).to_dict()
    
    all_conditions_to_translate = set(drug1_top_conditions_dict.keys()) | set(drug2_top_conditions_dict.keys())
    unique_conditions_list = list(all_conditions_to_translate)

    translation_map = {}
    if unique_conditions_list:
        translated_conditions = ai_service.translate_batch_with_gemini(unique_conditions_list)
        translation_map = dict(zip(unique_conditions_list, translated_conditions))

    translated_drug1_conditions = { translation_map.get(cond, cond): count for cond, count in drug1_top_conditions_dict.items() }
    translated_drug2_conditions = { translation_map.get(cond, cond): count for cond, count in drug2_top_conditions_dict.items() }

    result = {
        drug1_name: {
            "average_rating": round(drug1_data['rating'].mean(), 2),
            "total_reviews": len(drug1_data),
            "top_conditions": translated_drug1_conditions
        },
        drug2_name: {
            "average_rating": round(drug2_data['rating'].mean(), 2),
            "total_reviews": len(drug2_data),
            "top_conditions": translated_drug2_conditions
        }
    }
    return result