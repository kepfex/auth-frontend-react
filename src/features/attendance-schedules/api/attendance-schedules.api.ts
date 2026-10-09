import { apiClient } from "@/api/client";
import type { PaginatedResponse } from "@/shared/types/shared.types";
import type { AttendanceSchedule, AttendanceScheduleFilters, CreateAttendanceScheduleRequest, UpdateAttendanceScheduleRequest } from "../types/attendance-schedule.types";


export const attendanceSchedulesApi = {
  // ───────────────────────────────────────────────────
  // Listado
  // ───────────────────────────────────────────────────

  getAll: async (
    filters: AttendanceScheduleFilters = {},
  ): Promise<
    PaginatedResponse<AttendanceSchedule>
  > => {
    const { data } =
      await apiClient.get<
        PaginatedResponse<AttendanceSchedule>
      >(
        "/attendance-schedules",
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
    scheduleId: number,
  ): Promise<AttendanceSchedule> => {
    const { data } =
      await apiClient.get<{
        data: AttendanceSchedule;
      }>(
        `/attendance-schedules/${scheduleId}`,
      );

    return data.data;
  },

  // ───────────────────────────────────────────────────
  // Crear
  // ───────────────────────────────────────────────────

  create: async (
    payload: CreateAttendanceScheduleRequest,
  ): Promise<AttendanceSchedule> => {
    const { data } =
      await apiClient.post<{
        data: AttendanceSchedule;
      }>(
        "/attendance-schedules",
        payload,
      );

    return data.data;
  },

  // ───────────────────────────────────────────────────
  // Actualizar
  // ───────────────────────────────────────────────────

  update: async (
    scheduleId: number,
    payload: UpdateAttendanceScheduleRequest,
  ): Promise<AttendanceSchedule> => {
    const { data } =
      await apiClient.patch<{
        data: AttendanceSchedule;
      }>(
        `/attendance-schedules/${scheduleId}`,
        payload,
      );

    return data.data;
  },
};