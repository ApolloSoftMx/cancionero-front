import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Agrega el token automáticamente a cada request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Si el token expira, manda al login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = '/remamusic/login';
        }
        return Promise.reject(error);
    }
);

export default api;