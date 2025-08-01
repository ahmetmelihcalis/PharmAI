/**
 * @param {string} drugName 
 * @returns {string}
 */
export const getSafeDrugNameForUrl = (drugName) => {
  if (typeof drugName !== 'string') {
    return '';
  }
  return encodeURIComponent(drugName.replace(/\//g, '_slash_'));
};

/**
 * @param {string} safeDrugName 
 * @returns {string}
 */
export const getOriginalDrugNameFromUrl = (safeDrugName) => {
  if (typeof safeDrugName !== 'string') {
    return '';
  }
  return decodeURIComponent(safeDrugName).replace(/_slash_/g, '/');
};

/**
 * @param {string} drugName
 * @returns {string}
 */
export const cleanDrugName = (drugName) => {
  if (typeof drugName !== 'string') {
    return '';
  }
  return drugName.trim();
};
