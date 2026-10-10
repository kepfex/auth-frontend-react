import type { EducationalLevel } from "@/features/academic-structure/types/academic-structure.types";
import type { AcademicYear } from "@/features/academic-years/types/academic-year.types";
import type { Classroom } from "@/features/classrooms/types/classroom.types";

// ─────────────────────────────────────────────────────
// Tipos base
// ─────────────────────────────────────────────────────

export type AttendanceScheduleType = "regular" | "override";

export type AttendanceEventType = "entry" | "exit";

export type AttendanceCalendarExceptionType =
  | "non_working"
  | "schedule_override";

export type AttendanceScheduleScope = "level" | "classroom";

export type AttendanceCalendarExceptionScope =
  | "institution"
  | "level"
  | "classroom";

// ─────────────────────────────────────────────────────
// Catálogos
// ─────────────────────────────────────────────────────

export interface CatalogOption<TValue extends string | number> {
  value: TValue;
  label: string;
}

export type WeekdayOption = CatalogOption<number>;

export type AttendanceEventTypeOption = CatalogOption<AttendanceEventType>;

export type AttendanceScheduleTypeOption =
  CatalogOption<AttendanceScheduleType>;

export type AttendanceCalendarExceptionTypeOption =
  CatalogOption<AttendanceCalendarExceptionType>;

// ─────────────────────────────────────────────────────
// Evento del horario
// ─────────────────────────────────────────────────────

export interface AttendanceScheduleEvent {
  id: number;

  day_of_week: number;
  day_label: string;

  sequence: number;

  event_type: AttendanceEventType;
  event_type_label: string;

  expected_time: string;

  tolerance_minutes: number;

  window_before_minutes: number;
  window_after_minutes: number;

  created_at?: string;
  updated_at?: string;
}

// ─────────────────────────────────────────────────────
// Schedule
// ─────────────────────────────────────────────────────

export interface AttendanceSchedule {
  id: number;

  academic_year_id: number;
  educational_level_id: number;
  grade_section_id: number | null;

  name: string;

  schedule_type: AttendanceScheduleType;
  schedule_type_label: string;

  valid_from: string;
  valid_until: string;

  is_active: boolean;

  scope: AttendanceScheduleScope;

  academic_year?: AcademicYear;

  educational_level?: EducationalLevel;

  grade_section?: Classroom | null;

  events: AttendanceScheduleEvent[];

  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────
// Filtros Schedule
// ─────────────────────────────────────────────────────

export interface AttendanceScheduleFilters {
  page?: number;
  per_page?: number;

  academic_year_id?: number;
  educational_level_id?: number;
  grade_section_id?: number;

  schedule_type?: AttendanceScheduleType;

  is_active?: boolean;

  date?: string;
}

// ─────────────────────────────────────────────────────
// Requests Schedule
// ─────────────────────────────────────────────────────

export interface AttendanceScheduleEventRequest {
  day_of_week: number;

  sequence: number;

  event_type: AttendanceEventType;

  expected_time: string;

  tolerance_minutes: number;

  window_before_minutes?: number;
  window_after_minutes?: number;
}

export interface CreateAttendanceScheduleRequest {
  academic_year_id: number;

  educational_level_id: number;

  grade_section_id: number | null;

  name: string;

  schedule_type?: AttendanceScheduleType;

  valid_from: string;
  valid_until: string;

  is_active?: boolean;

  events: AttendanceScheduleEventRequest[];
}

export interface UpdateAttendanceScheduleRequest {
  name?: string;

  valid_from?: string;
  valid_until?: string;

  is_active?: boolean;

  events?: AttendanceScheduleEventRequest[];
}

// ─────────────────────────────────────────────────────
// Calendar Exception
// ─────────────────────────────────────────────────────

export interface AttendanceCalendarException {
  id: number;

  academic_year_id: number;

  educational_level_id: number | null;

  grade_section_id: number | null;

  attendance_schedule_id: number | null;

  date: string;

  type: AttendanceCalendarExceptionType;
  type_label: string;

  name: string;

  reason: string | null;

  is_active: boolean;

  scope: AttendanceCalendarExceptionScope;

  override_schedule?: AttendanceSchedule | null;

  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────
// Filtros Exception
// ─────────────────────────────────────────────────────

export interface AttendanceCalendarExceptionFilters {
  page?: number;
  per_page?: number;

  academic_year_id?: number;

  educational_level_id?: number;

  grade_section_id?: number;

  date?: string;

  type?: AttendanceCalendarExceptionType;

  is_active?: boolean;
}

// ─────────────────────────────────────────────────────
// Requests Exception
// ─────────────────────────────────────────────────────

export interface CreateAttendanceCalendarExceptionRequest {
  academic_year_id: number;

  educational_level_id: number | null;

  grade_section_id: number | null;

  attendance_schedule_id: number | null;

  date: string;

  type: AttendanceCalendarExceptionType;

  name: string;

  reason?: string | null;

  is_active?: boolean;
}

export interface UpdateAttendanceCalendarExceptionRequest {
  name?: string;

  reason?: string | null;

  is_active?: boolean;
}

export interface AttendanceOverrideEventRequest {
  event_type: AttendanceEventType;

  expected_time: string;

  tolerance_minutes: number;

  window_before_minutes: number;

  window_after_minutes: number;
}

export interface CreateScheduleOverrideExceptionRequest {
  academic_year_id: number;

  educational_level_id: number;

  grade_section_id: number | null;

  date: string;

  name: string;

  reason?: string | null;

  is_active?: boolean;

  schedule: {
    name: string;

    events: AttendanceOverrideEventRequest[];
  };
}
