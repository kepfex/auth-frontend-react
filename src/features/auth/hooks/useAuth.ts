import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginApi, registerApi } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import type { LoginRequest, RegisterRequest } from '../types/auth.types'

// Este hook conecta la API con el store. Los componentes solo usan este hook.
export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()

  const login = async (data: LoginRequest) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await loginApi(data)
      setAuth(response.user, response.token) // guarda en Zustand + localStorage
      navigate('/dashboard')
    } catch (err: unknown) {
      // Captura el mensaje de error del servidor
      const message =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? 'Error al iniciar sesión'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return { login, isLoading, error }
}

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()

  const register = async (data: RegisterRequest) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await registerApi(data)
      setAuth(response.user, response.token)
      navigate('/dashboard')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? 'Error al registrarse'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return { register, isLoading, error }
}

export const useLogout = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const navigate = useNavigate()

  const logout = () => {
    clearAuth()
    navigate('/login')
  }

  return { logout }
}