import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ejemplo: https://localhost:7240/api
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔹 Interceptor de solicitud (añade el token a cada request)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Interceptor de respuesta (detecta expiración del token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // ⚠️ Si el backend devuelve 401 (no autorizado)
      if (error.response.status === 401) {
        console.warn('⚠️ Token expirado o inválido. Cerrando sesión...');
        // Elimina el token almacenado
        localStorage.removeItem('token');

        // Redirige al login (puedes ajustar la ruta según tu app)
        window.location.href = '/store-inventory/auth';
      }
      // Opcional: manejar 403 (sin permisos)
      if (error.response.status === 403) {
        console.warn('⛔ No tienes permisos para acceder a este recurso.');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
