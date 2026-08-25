import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { AuthGuard } from './guards/AuthGuard'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { DashboardPage } from '../pages/admin/DashboardPage'
import HomePage from '@/pages/HomePage'

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rutas privadas — protegidas por AuthGuard */}
      <Route element={<AuthGuard />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
)