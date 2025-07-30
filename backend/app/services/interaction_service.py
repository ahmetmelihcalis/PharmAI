import requests
from typing import Optional, Dict, Any, List

RXNAV_API_BASE_URL = "https://rxnav.nlm.nih.gov/REST"

def get_rxcui(drug_name: str) -> Optional[str]:
    """Verilen ilaç ismine karşılık gelen RxCUI kodunu alır."""
    url = f"{RXNAV_API_BASE_URL}/rxcui.json?name={drug_name.lower()}"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        if "idGroup" in data and "rxnormId" in data["idGroup"] and data["idGroup"]["rxnormId"]:
            return data["idGroup"]["rxnormId"][0]
        return None
    except requests.exceptions.RequestException as e:
        print(f"RxCUI alınırken hata: {e}")
        return None

def find_interactions_by_rxcuis(rxcuis: List[str]) -> Optional[Dict[str, Any]]:
    """Verilen RxCUI listesi arasındaki etkileşimleri bulur."""
    rxcui_string = "+".join(rxcuis)
    url = f"{RXNAV_API_BASE_URL}/interaction/list.json?rxcuis={rxcui_string}"
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        data = response.json()
        if "fullInteractionTypeGroup" in data:
            return data
        return None
    except requests.exceptions.RequestException as e:
        print(f"Etkileşimler alınırken hata: {e}")
        return None

def process_interaction_data(drug1_name: str, drug2_name: str, interaction_data: Dict[str, Any]) -> List[Dict[str, str]]:
    """API'den gelen karmaşık JSON'u frontend için basit bir listeye dönüştürür."""
    processed_list = []
    for group in interaction_data.get("fullInteractionTypeGroup", []):
        for interaction_type in group.get("fullInteractionType", []):
            for interaction_pair in interaction_type.get("interactionPair", []):
                interaction_detail = {
                    "severity": interaction_pair.get("severity", "Bilinmiyor"),
                    "description": interaction_pair.get("description", "Açıklama bulunamadı."),
                    "drug1": drug1_name,
                    "drug2": drug2_name
                }
                processed_list.append(interaction_detail)
    return processed_list