import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthGuard } from "./guards/AuthGuard";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { DashboardPage } from "../pages/admin/DashboardPage";
import HomePage from "@/pages/HomePage";
import AdminLayout from "@/layouts/AdminLayout";
import { AcademicYearsPage } from "@/pages/admin/academic-years/AcademicYearsPage";
import { AcademicStructurePage } from "@/pages/admin/academic-structure/AcademicStructurePage";
import { ClassroomsPage } from "@/pages/admin/classrooms/ClassroomsPage";
import { StudentsPage } from "@/pages/admin/students/StudentsPage";
import { StudentCreatePage } from "@/pages/admin/students/StudentCreatePage";
import { StudentGuardianSetupPage } from "@/pages/admin/students/StudentGuardianSetupPage";
import { StudentDetailPage } from "@/pages/admin/students/StudentDetailPage";

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
          <Route
            path="academic-structure"
            element={<AcademicStructurePage />}
          />
          <Route path="classrooms" element={<ClassroomsPage />} />

          <Route
            path="students"
            element={<StudentsPage />}
          />

          <Route
            path="students/new"
            element={<StudentCreatePage />}
          />

          <Route
            path="students/:studentId/setup/guardians"
            element={
              <StudentGuardianSetupPage />
            }
          />
          <Route
            path="students/:studentId"
            element={<StudentDetailPage />}
          />
        </Route>
      </Route>

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);
