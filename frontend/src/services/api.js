// frontend/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    if (config.method !== 'get') {
        try {
            const response = await axios.get('/api/auth/csrf/', {
                withCredentials: true,
            });
            const csrfToken = response.data.csrfToken;
            config.headers['X-CSRFToken'] = csrfToken;
        } catch (error) {
            console.error('Error fetching CSRF token:', error);
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;