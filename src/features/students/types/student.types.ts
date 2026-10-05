import type { CreatePersonRequest, Person, UpdatePersonRequest } from "./person.types";

export type StudentStatus = "activo" | "inactivo" | "egresado";

export interface Student {
  id: number;
  person_id: number;

  student_code: string;
  status: StudentStatus;

  person: Person;

  created_at: string;
}

export interface StudentFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: StudentStatus;
}

interface StudentBaseRequest {
  student_code: string;
  status?: StudentStatus;
}

export interface CreateStudentWithPersonRequest
  extends StudentBaseRequest {
  person: CreatePersonRequest;
  person_id?: never;
}

export interface CreateStudentWithPersonIdRequest
  extends StudentBaseRequest {
  person_id: number;
  person?: never;
}

export type CreateStudentRequest =
  | CreateStudentWithPersonRequest
  | CreateStudentWithPersonIdRequest;

export interface UpdateStudentRequest {
  student_code?: string;
  status?: StudentStatus;

  person?: UpdatePersonRequest;
}

export interface StudentPaginatedResponse {
  data: Student[];

  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };

  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}