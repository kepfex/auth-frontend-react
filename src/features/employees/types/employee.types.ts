import type { CreatePersonRequest, Person } from "@/features/students/types/person.types";
import type { Position } from "@/features/positions/types/position.types";

export interface Employee {
  id: number;
  person_id: number;
  employee_code: string;
  is_active: boolean;
  person: Person;
  positions: Position[];
  created_at: string;
  updated_at: string;
}

export interface EmployeeFilters {
  search?: string;
  is_active?: boolean;
  position_id?: number;
  page?: number;
  per_page?: number;
}

interface EmployeeBaseRequest { position_ids: number[] }
export type CreateEmployeeRequest =
  | (EmployeeBaseRequest & { person_id: number; person?: never })
  | (EmployeeBaseRequest & { person: CreatePersonRequest; person_id?: never });

export interface SyncEmployeePositionsRequest { position_ids: number[] }
export interface UpdateEmployeeStatusRequest { is_active: boolean }

export interface EmployeePaginatedResponse {
  data: Employee[];
  links: { first: string | null; last: string | null; prev: string | null; next: string | null };
  meta: { current_page: number; from: number | null; last_page: number; path: string; per_page: number; to: number | null; total: number };
}
