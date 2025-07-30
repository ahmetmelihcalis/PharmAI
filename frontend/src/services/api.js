import axios from 'axios';
import { getSafeDrugNameForUrl } from '../utils/drugNameUtils';

const API = axios.create({ 
    baseURL: 'http://127.0.0.1:8000',
    timeout: 30000 
});

export const setAuthToken = (token) => {
    if (token) {
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete API.defaults.headers.common['Authorization'];
    }
};

export const fetchDrugs = () => API.get('/drugs');
export const fetchPopularDrugs = () => API.get('/drugs/popular');
export const fetchTopRatedDrugs = () => API.get('/drugs/top-rated');
export const fetchMostReviewedDrugs = () => API.get('/drugs/most-reviewed');
export const getDrugDetails = async (drugName) => {
  const safeName = getSafeDrugNameForUrl(drugName);
  const response = await API.get(`/drugs/${safeName}`);
  return response.data;
};
export const fetchDrugSummary = (drugName) => API.get(`/drugs/${encodeURIComponent(drugName)}/summary`);
export const compareTwoDrugs = (drug1, drug2) => API.get(`/compare?drug1=${encodeURIComponent(drug1)}&drug2=${encodeURIComponent(drug2)}`);
export const checkInteraction = (drug1, drug2) => API.get(`/check-interaction?drug1=${encodeURIComponent(drug1)}&drug2=${encodeURIComponent(drug2)}`);
export const getDrugRatingDistribution = async (drugName) => {
  const safeName = getSafeDrugNameForUrl(drugName);
  const response = await API.get(`/drugs/${safeName}/rating-distribution`);
  return response.data;
};
export const searchByQuery = (query) => API.get(`/search?query=${encodeURIComponent(query)}`);

export const fetchBatchTranslations = (texts) => API.post('/batch-translate', { texts });
export const loginUser = (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    return API.post('/token', formData);
};
export const registerUser = (email, password) => API.post('/users/register', { email, password });
export const getCurrentUser = () => API.get('/users/me');
export const addFavoriteDrug = (drugName) => API.post('/users/me/favorites', { drug_name: drugName });