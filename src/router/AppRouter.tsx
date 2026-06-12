import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { AuthGuard } from './guards/AuthGuard'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { DashboardPage } from '../pages/DashboardPage'

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rutas privadas — protegidas por AuthGuard */}
      <Route element={<AuthGuard />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
)