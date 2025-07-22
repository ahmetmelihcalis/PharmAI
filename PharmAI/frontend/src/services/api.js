import axios from 'axios';

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

// --- İLAÇ & GENEL FONKSİYONLAR ---
export const fetchDrugs = () => API.get('/drugs');
export const fetchPopularDrugs = () => API.get('/drugs/popular');
export const fetchTopRatedDrugs = () => API.get('/drugs/top-rated');
export const fetchMostReviewedDrugs = () => API.get('/drugs/most-reviewed');
export const fetchDrugDetails = (drugName) => API.get(`/drugs/${drugName}`);
export const fetchDrugSummary = (drugName) => API.get(`/drugs/${drugName}/summary`);
export const compareTwoDrugs = (drug1, drug2) => API.get(`/compare?drug1=${drug1}&drug2=${drug2}`);
export const checkInteraction = (drug1, drug2) => API.get(`/check-interaction?drug1=${drug1}&drug2=${drug2}`);
export const fetchRatingDistribution = (drugName) => API.get(`/drugs/${drugName}/rating-distribution`);
export const searchByQuery = (query) => API.get(`/search?query=${query}`);

// --- YAPAY ZEKA FONKSİYONLARI ---
export const fetchBatchTranslations = (texts) => API.post('/batch-translate', { texts });

// --- KİMLİK DOĞRULAMA & KULLANICI FONKSİYONLARI ---
export const loginUser = (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    return API.post('/token', formData);
};
export const registerUser = (email, password) => API.post('/users/register', { email, password });
export const getCurrentUser = () => API.get('/users/me');
export const addFavoriteDrug = (drugName) => API.post('/users/me/favorites', { drug_name: drugName });