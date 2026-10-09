import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { attendanceCalendarExceptionsApi } from "../api/attendance-calendar-exceptions.api";

import type {
  AttendanceCalendarExceptionFilters,
  CreateAttendanceCalendarExceptionRequest,
  UpdateAttendanceCalendarExceptionRequest,
} from "../types/attendance-schedule.types";

// ─────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────

export const ATTENDANCE_CALENDAR_EXCEPTION_KEYS = {
  all: ["attendance-calendar-exceptions"] as const,

  lists: () => [...ATTENDANCE_CALENDAR_EXCEPTION_KEYS.all, "list"] as const,

  list: (filters: AttendanceCalendarExceptionFilters) =>
    [...ATTENDANCE_CALENDAR_EXCEPTION_KEYS.lists(), filters] as const,

  details: () => [...ATTENDANCE_CALENDAR_EXCEPTION_KEYS.all, "detail"] as const,

  detail: (exceptionId: number) =>
    [...ATTENDANCE_CALENDAR_EXCEPTION_KEYS.details(), exceptionId] as const,
};

// ─────────────────────────────────────────────────────
// Listado
// ─────────────────────────────────────────────────────

export const useAttendanceCalendarExceptions = (
  filters: AttendanceCalendarExceptionFilters,
) => {
  return useQuery({
    queryKey: ATTENDANCE_CALENDAR_EXCEPTION_KEYS.list(filters),

    queryFn: () => attendanceCalendarExceptionsApi.getAll(filters),

    placeholderData: keepPreviousData,
  });
};

// ─────────────────────────────────────────────────────
// Detalle
// ─────────────────────────────────────────────────────

export const useAttendanceCalendarException = (exceptionId: number | null) => {
  return useQuery({
    queryKey:
      exceptionId !== null
        ? ATTENDANCE_CALENDAR_EXCEPTION_KEYS.detail(exceptionId)
        : [...ATTENDANCE_CALENDAR_EXCEPTION_KEYS.details(), "none"],

    queryFn: () => {
      if (exceptionId === null) {
        throw new Error("Se requiere el ID de la excepción.");
      }

      return attendanceCalendarExceptionsApi.getById(exceptionId);
    },

    enabled: exceptionId !== null,
  });
};

// ─────────────────────────────────────────────────────
// Crear
// ─────────────────────────────────────────────────────

export const useCreateAttendanceCalendarException = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAttendanceCalendarExceptionRequest) =>
      attendanceCalendarExceptionsApi.create(payload),

    onSuccess: (exception) => {
      queryClient.setQueryData(
        ATTENDANCE_CALENDAR_EXCEPTION_KEYS.detail(exception.id),
        exception,
      );

      queryClient.invalidateQueries({
        queryKey: ATTENDANCE_CALENDAR_EXCEPTION_KEYS.lists(),
      });
    },
  });
};

// ─────────────────────────────────────────────────────
// Actualizar
// ─────────────────────────────────────────────────────

export const useUpdateAttendanceCalendarException = (exceptionId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAttendanceCalendarExceptionRequest) =>
      attendanceCalendarExceptionsApi.update(exceptionId, payload),

    onSuccess: (exception) => {
      queryClient.setQueryData(
        ATTENDANCE_CALENDAR_EXCEPTION_KEYS.detail(exception.id),
        exception,
      );

      queryClient.invalidateQueries({
        queryKey: ATTENDANCE_CALENDAR_EXCEPTION_KEYS.lists(),
      });
    },
  });
};
