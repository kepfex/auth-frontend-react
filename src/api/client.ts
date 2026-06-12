import axios from "axios";

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
    timeout: 10_000,
    headers: {
        'Content-Type': 'application/json',
    }
})

// INTERCEPTOR DE REQUEST:
// Antes de cada petición, agrega el token si existe en localStorage
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if(token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

// INTERCEPTOR DE RESPONSE:
// Si el servidor devuelve 401, limpia la sesión
apiClient.interceptors.response.use(
  (response) => response, // Si todo va bien, devuelve la respuesta normal
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    // Propaga el error para que los hooks lo capturen
    return Promise.reject(error)
  }
)