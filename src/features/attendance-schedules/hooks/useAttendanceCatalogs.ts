import { useQuery } from "@tanstack/react-query";

import { attendanceCatalogsApi } from "../api/attendance-catalogs.api";

// ─────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────

export const ATTENDANCE_CATALOG_KEYS = {
  all: ["attendance-catalogs"] as const,

  weekdays: () => [...ATTENDANCE_CATALOG_KEYS.all, "weekdays"] as const,

  eventTypes: () => [...ATTENDANCE_CATALOG_KEYS.all, "event-types"] as const,

  scheduleTypes: () =>
    [...ATTENDANCE_CATALOG_KEYS.all, "schedule-types"] as const,

  exceptionTypes: () =>
    [...ATTENDANCE_CATALOG_KEYS.all, "exception-types"] as const,
};

// ─────────────────────────────────────────────────────
// Días
// ─────────────────────────────────────────────────────

export const useWeekdays = () => {
  return useQuery({
    queryKey: ATTENDANCE_CATALOG_KEYS.weekdays(),

    queryFn: attendanceCatalogsApi.getWeekdays,

    staleTime: Infinity,
  });
};

// ─────────────────────────────────────────────────────
// Entry / Exit
// ─────────────────────────────────────────────────────

export const useAttendanceEventTypes = () => {
  return useQuery({
    queryKey: ATTENDANCE_CATALOG_KEYS.eventTypes(),

    queryFn: attendanceCatalogsApi.getEventTypes,

    staleTime: Infinity,
  });
};

// ─────────────────────────────────────────────────────
// Regular / Override
// ─────────────────────────────────────────────────────

export const useAttendanceScheduleTypes = () => {
  return useQuery({
    queryKey: ATTENDANCE_CATALOG_KEYS.scheduleTypes(),

    queryFn: attendanceCatalogsApi.getScheduleTypes,

    staleTime: Infinity,
  });
};

// ─────────────────────────────────────────────────────
// Non-working / Override
// ─────────────────────────────────────────────────────

export const useAttendanceExceptionTypes = () => {
  return useQuery({
    queryKey: ATTENDANCE_CATALOG_KEYS.exceptionTypes(),

    queryFn: attendanceCatalogsApi.getExceptionTypes,

    staleTime: Infinity,
  });
};
