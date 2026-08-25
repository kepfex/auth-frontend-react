import { useAuthStore } from "@/features/auth/store/auth.store";
import axios from "axios";

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
    timeout: 10_000,
    headers: { 'Content-Type': 'application/json' },
})

// INTERCEPTOR DE REQUEST:
// Antes de cada petición, agrega el token si existe en localStorage
apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token || localStorage.getItem('token') // Leer el token desde Zustand o localStorage
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
    const isAuthRoute =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/register')

    // Solo redirige al login si el 401 NO viene de las rutas de auth
    // Si viene del login/registro, deja que TanStack Query maneje el error
    if (error.response?.status === 401 && !isAuthRoute) {
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
    }
    // Propaga el error para que los hooks lo capturen
    return Promise.reject(error)
  }
)