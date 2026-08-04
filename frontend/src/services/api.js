// frontend/src/services/api.js
import axios from 'axios';

// Используем переменную окружения с fallback
const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Не авторизован
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;