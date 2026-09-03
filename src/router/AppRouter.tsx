import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { AuthGuard } from './guards/AuthGuard'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { DashboardPage } from '../pages/admin/DashboardPage'
import HomePage from '@/pages/HomePage'
import AdminLayout from '@/layouts/AdminLayout'
import { AcademicYearsPage } from '@/pages/admin/academic-years/AcademicYearsPage'

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rutas privadas — protegidas por AuthGuard */}
      <Route element={<AuthGuard />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="academic-years" element={<AcademicYearsPage />} />
        </Route>
      </Route>

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
)