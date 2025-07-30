// frontend/src/utils/drugNameUtils.js

/**
 * İlaç isimlerindeki '/' gibi URL için sorunlu karakterleri güvenli bir karaktere dönüştürür.
 * @param {string} drugName - Orijinal ilaç adı.
 * @returns {string} URL için güvenli hale getirilmiş ilaç adı.
 */
export const getSafeDrugNameForUrl = (drugName) => {
  if (typeof drugName !== 'string') {
    return '';
  }
  // '/' karakterini '_slash_' ile değiştir ve ardından tüm ismi URL kodlamasından geçir.
  return encodeURIComponent(drugName.replace(/\//g, '_slash_'));
};

/**
 * URL'den alınan güvenli ilaç adını tekrar orijinal haline çevirir.
 * @param {string} safeDrugName - URL'den gelen güvenli ilaç adı.
 * @returns {string} Orijinal ilaç adı.
 */
export const getOriginalDrugNameFromUrl = (safeDrugName) => {
  if (typeof safeDrugName !== 'string') {
    return '';
  }
  // URL kodlamasını çöz ve '_slash_' ifadesini tekrar '/' karakterine dönüştür.
  return decodeURIComponent(safeDrugName).replace(/_slash_/g, '/');
};

/**
 * İlaç adını temizler (örneğin, baştaki/sondaki boşlukları kaldırır).
 * @param {string} drugName - Temizlenecek ilaç adı.
 * @returns {string} Temizlenmiş ilaç adı.
 */
export const cleanDrugName = (drugName) => {
  if (typeof drugName !== 'string') {
    return '';
  }
  return drugName.trim();
};
