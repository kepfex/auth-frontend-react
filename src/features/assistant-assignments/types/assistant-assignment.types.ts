import type { Employee } from "@/features/employees/types/employee.types";
import type { Classroom } from "@/features/classrooms/types/classroom.types";

export interface AssistantAssignment {
  id: number;
  employee_id: number;
  grade_section_id: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  employee: Employee;
  grade_section: Classroom;
  created_at: string;
  updated_at: string;
}
export interface AssistantAssignmentFilters {
  academic_year_id?: number;
  educational_level_id?: number;
  employee_id?: number;
  grade_section_id?: number;
  is_active?: boolean;
  effective_on?: string;
  page?: number;
  per_page?: number;
}
export interface CreateAssistantAssignmentRequest {
  employee_id: number;
  grade_section_id: number;
  start_date: string;
  end_date?: string | null;
}
export interface FinishAssistantAssignmentRequest { end_date: string }
export interface AssistantAssignmentsPaginatedResponse {
  data: AssistantAssignment[];
  links: { first: string | null; last: string | null; prev: string | null; next: string | null };
  meta: { current_page: number; from: number | null; last_page: number; path: string; per_page: number; to: number | null; total: number };
}
