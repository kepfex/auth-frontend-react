import { create } from "zustand"
import type { AcademicYear, User } from "../types/auth.types"
import { persist } from "zustand/middleware"

// Define QUÉ datos guarda y QUÉ acciones existen
interface AuthState {
  // Datos de sesión
  user: User | null
  token: string | null
  isAuthenticated: boolean

  // Contexto global de la app - filtra toda la data
  academicYear: AcademicYear | null

  // Acciones
  setAuth: (user: User, token: string, academicYear: AcademicYear | null) => void
  setAcademicYear: (academicYear: AcademicYear | null) => void // para cambiar año desde un selector
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  // "persist" guarda automáticamente en localStorage
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      academicYear: null,

      setAuth: (user, token, academicYear) => {
        // Guarda en localStorage para el interceptor de Axios
        // localStorage.setItem('token', token)

        set({ user, token, isAuthenticated: true, academicYear }) // Persis se encarga de guardar en localStorage automáticamente
      },

      // Selector de año académico global
      setAcademicYear(academicYear) {
        set({ academicYear })
      },

      clearAuth: () => {
        set({ user: null, token: null, isAuthenticated: false, academicYear: null })
      },
    }),
    {
      name: 'auth-storage', // nombre de la key en localStorage
      // Solo persiste estos campos (no las funciones)
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        academicYear: state.academicYear,
      }),
    }
  )
)