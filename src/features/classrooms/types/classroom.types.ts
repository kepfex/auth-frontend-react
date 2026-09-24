import type { Grade, Section } from "@/features/academic-structure/types/academic-structure.types";
import type { AcademicYear } from "@/features/academic-years/types/academic-year.types";

export type ClassroomsShift =
    | "mañana"
    | "tarde"
    | "mañana y tarde";

export interface Classroom {
    id: number;

    shift: ClassroomsShift;
    capacity: number;
    is_active: boolean;

    academic_year: AcademicYear;
    grade: Grade;
    section: Section;

    created_at: string;
    updated_at: string;
}

export interface ClassroomPaginatedResponse {
    data: Classroom[];

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

export interface ClassroomFilters {
  academic_year_id?: number;
  educational_level_id?: number;
  is_active?: boolean;
  per_page?: number;
  page?: number;
}