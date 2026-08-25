import { create } from "zustand"
import type { User } from "../types/auth.types"
import { persist } from "zustand/middleware"

// Define QUÉ datos guarda y QUÉ acciones existen
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean

  // Acciones
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  // "persist" guarda automáticamente en localStorage
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        // Guarda en localStorage para el interceptor de Axios
        // localStorage.setItem('token', token)

        set({ user, token, isAuthenticated: true }) // Persis se encarga de guardar en localStorage automáticamente
      },

      clearAuth: () => {
        // localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage', // nombre de la key en localStorage
      // Solo persiste estos campos (no las funciones)
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)