// ─────────────────────────────────────────────────────
// Estado
// ─────────────────────────────────────────────────────

import type { AcademicYear } from "@/features/academic-years/types/academic-year.types";
import type { Classroom } from "@/features/classrooms/types/classroom.types";
import type { Student } from "@/features/students/types/student.types";

export type EnrollmentStatus =
  | "matriculado"
  | "culminado"
  | "retirado"
  | "trasladado";

// ─────────────────────────────────────────────────────
// Enrollment
// ─────────────────────────────────────────────────────

export interface Enrollment {
  id: number;

  student_id: number;
  academic_year_id: number;
  grade_section_id: number;

  enrollment_date: string;

  status: EnrollmentStatus;
  status_label: string;

  observations: string | null;

  student: Student;
  academic_year: AcademicYear;
  grade_section: Classroom;

  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────
// Filtros
// ─────────────────────────────────────────────────────

export interface EnrollmentFilters {
  page?: number;
  per_page?: number;

  search?: string;

  academic_year_id?: number;
  educational_level_id?: number;
  grade_id?: number;
  grade_section_id?: number;

  status?: EnrollmentStatus;
}

// ─────────────────────────────────────────────────────
// Crear
// ─────────────────────────────────────────────────────

export interface CreateEnrollmentRequest {
  student_id: number;
  academic_year_id: number;
  grade_section_id: number;

  enrollment_date: string;

  status?: EnrollmentStatus;

  observations?: string | null;
}

// ─────────────────────────────────────────────────────
// Actualizar
// ─────────────────────────────────────────────────────

export interface UpdateEnrollmentRequest {
  grade_section_id?: number;
  enrollment_date?: string;
  status?: EnrollmentStatus;
  observations?: string | null;
}