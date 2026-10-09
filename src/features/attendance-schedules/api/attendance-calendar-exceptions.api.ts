import { apiClient } from "@/api/client";
import type { PaginatedResponse } from "@/shared/types/shared.types";
import type { AttendanceCalendarException, AttendanceCalendarExceptionFilters, CreateAttendanceCalendarExceptionRequest, UpdateAttendanceCalendarExceptionRequest } from "../types/attendance-schedule.types";


export const attendanceCalendarExceptionsApi = {
  // ───────────────────────────────────────────────────
  // Listado
  // ───────────────────────────────────────────────────

  getAll: async (
    filters: AttendanceCalendarExceptionFilters = {},
  ): Promise<
    PaginatedResponse<AttendanceCalendarException>
  > => {
    const { data } =
      await apiClient.get<
        PaginatedResponse<AttendanceCalendarException>
      >(
        "/attendance-calendar-exceptions",
        {
          params: filters,
        },
      );

    return data;
  },

  // ───────────────────────────────────────────────────
  // Detalle
  // ───────────────────────────────────────────────────

  getById: async (
    exceptionId: number,
  ): Promise<AttendanceCalendarException> => {
    const { data } =
      await apiClient.get<{
        data: AttendanceCalendarException;
      }>(
        `/attendance-calendar-exceptions/${exceptionId}`,
      );

    return data.data;
  },

  // ───────────────────────────────────────────────────
  // Crear
  // ───────────────────────────────────────────────────

  create: async (
    payload: CreateAttendanceCalendarExceptionRequest,
  ): Promise<AttendanceCalendarException> => {
    const { data } =
      await apiClient.post<{
        data: AttendanceCalendarException;
      }>(
        "/attendance-calendar-exceptions",
        payload,
      );

    return data.data;
  },

  // ───────────────────────────────────────────────────
  // Actualizar
  // ───────────────────────────────────────────────────

  update: async (
    exceptionId: number,
    payload: UpdateAttendanceCalendarExceptionRequest,
  ): Promise<AttendanceCalendarException> => {
    const { data } =
      await apiClient.patch<{
        data: AttendanceCalendarException;
      }>(
        `/attendance-calendar-exceptions/${exceptionId}`,
        payload,
      );

    return data.data;
  },
};