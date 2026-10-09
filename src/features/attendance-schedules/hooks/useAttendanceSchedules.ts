import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { attendanceSchedulesApi } from "../api/attendance-schedules.api";

import type {
  AttendanceScheduleFilters,
  CreateAttendanceScheduleRequest,
  UpdateAttendanceScheduleRequest,
} from "../types/attendance-schedule.types";

// ─────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────

export const ATTENDANCE_SCHEDULE_KEYS = {
  all: ["attendance-schedules"] as const,

  lists: () => [...ATTENDANCE_SCHEDULE_KEYS.all, "list"] as const,

  list: (filters: AttendanceScheduleFilters) =>
    [...ATTENDANCE_SCHEDULE_KEYS.lists(), filters] as const,

  details: () => [...ATTENDANCE_SCHEDULE_KEYS.all, "detail"] as const,

  detail: (scheduleId: number) =>
    [...ATTENDANCE_SCHEDULE_KEYS.details(), scheduleId] as const,
};

// ─────────────────────────────────────────────────────
// Listado
// ─────────────────────────────────────────────────────

export const useAttendanceSchedules = (filters: AttendanceScheduleFilters) => {
  return useQuery({
    queryKey: ATTENDANCE_SCHEDULE_KEYS.list(filters),

    queryFn: () => attendanceSchedulesApi.getAll(filters),

    placeholderData: keepPreviousData,
  });
};

// ─────────────────────────────────────────────────────
// Detalle
// ─────────────────────────────────────────────────────

export const useAttendanceSchedule = (scheduleId: number | null) => {
  return useQuery({
    queryKey:
      scheduleId !== null
        ? ATTENDANCE_SCHEDULE_KEYS.detail(scheduleId)
        : [...ATTENDANCE_SCHEDULE_KEYS.details(), "none"],

    queryFn: () => {
      if (scheduleId === null) {
        throw new Error("Se requiere el ID del horario.");
      }

      return attendanceSchedulesApi.getById(scheduleId);
    },

    enabled: scheduleId !== null,
  });
};

// ─────────────────────────────────────────────────────
// Crear
// ─────────────────────────────────────────────────────

export const useCreateAttendanceSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAttendanceScheduleRequest) =>
      attendanceSchedulesApi.create(payload),

    onSuccess: (schedule) => {
      queryClient.setQueryData(
        ATTENDANCE_SCHEDULE_KEYS.detail(schedule.id),
        schedule,
      );

      queryClient.invalidateQueries({
        queryKey: ATTENDANCE_SCHEDULE_KEYS.lists(),
      });
    },
  });
};

// ─────────────────────────────────────────────────────
// Actualizar
// ─────────────────────────────────────────────────────

export const useUpdateAttendanceSchedule = (scheduleId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAttendanceScheduleRequest) =>
      attendanceSchedulesApi.update(scheduleId, payload),

    onSuccess: (schedule) => {
      queryClient.setQueryData(
        ATTENDANCE_SCHEDULE_KEYS.detail(schedule.id),
        schedule,
      );

      queryClient.invalidateQueries({
        queryKey: ATTENDANCE_SCHEDULE_KEYS.lists(),
      });

      /*
       * Una excepción puede devolver
       * override_schedule anidado.
       */
      queryClient.invalidateQueries({
        queryKey: ["attendance-calendar-exceptions"],
      });
    },
  });
};
