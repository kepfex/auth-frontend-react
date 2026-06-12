import { apiClient } from "../../../api/client"
import type { AuthResponse, LoginRequest, RegisterRequest } from "../types/auth.types"

// Estas funciones SOLO hablan HTTP. No saben nada de estado ni UI.

export const loginApi = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data)
  return response.data
}

export const registerApi = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data)
  return response.data
}

export const logoutApi = async (): Promise<void> => {
  await apiClient.post('/auth/logout')
}