import { apiClient } from "@/api/client";

import type {
  AttendanceCalendarExceptionTypeOption,
  AttendanceEventTypeOption,
  AttendanceScheduleTypeOption,
  WeekdayOption,
} from "../types/attendance-schedule.types";

export const attendanceCatalogsApi = {
  // ───────────────────────────────────────────────────
  // Días
  // ───────────────────────────────────────────────────

  getWeekdays: async (): Promise<
    WeekdayOption[]
  > => {
    const { data } =
      await apiClient.get<{
        data: WeekdayOption[];
      }>(
        "/catalogs/weekdays",
      );

    return data.data;
  },

  // ───────────────────────────────────────────────────
  // Entrada / salida
  // ───────────────────────────────────────────────────

  getEventTypes: async (): Promise<
    AttendanceEventTypeOption[]
  > => {
    const { data } =
      await apiClient.get<{
        data: AttendanceEventTypeOption[];
      }>(
        "/catalogs/attendance-schedule-event-types",
      );

    return data.data;
  },

  // ───────────────────────────────────────────────────
  // Regular / override
  // ───────────────────────────────────────────────────

  getScheduleTypes: async (): Promise<
    AttendanceScheduleTypeOption[]
  > => {
    const { data } =
      await apiClient.get<{
        data: AttendanceScheduleTypeOption[];
      }>(
        "/catalogs/attendance-schedule-types",
      );

    return data.data;
  },

  // ───────────────────────────────────────────────────
  // Día no lectivo / horario excepcional
  // ───────────────────────────────────────────────────

  getExceptionTypes: async (): Promise<
    AttendanceCalendarExceptionTypeOption[]
  > => {
    const { data } =
      await apiClient.get<{
        data: AttendanceCalendarExceptionTypeOption[];
      }>(
        "/catalogs/attendance-calendar-exception-types",
      );

    return data.data;
  },
};