import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  CreateEnrollmentRequest,
  EnrollmentFilters,
  UpdateEnrollmentRequest,
} from "../types/enrollment.types";
import { enrollmentsApi } from "../api/enrollments.api";

// ─────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────

export const ENROLLMENT_KEYS = {
  all: ["enrollments"] as const,

  lists: () => [...ENROLLMENT_KEYS.all, "list"] as const,

  list: (filters: EnrollmentFilters) =>
    [...ENROLLMENT_KEYS.lists(), filters] as const,

  details: () => [...ENROLLMENT_KEYS.all, "detail"] as const,

  detail: (enrollmentId: number) =>
    [...ENROLLMENT_KEYS.details(), enrollmentId] as const,

  studentHistories: () => [...ENROLLMENT_KEYS.all, "student-history"] as const,

  studentHistory: (studentId: number) =>
    [...ENROLLMENT_KEYS.studentHistories(), studentId] as const,
};

// ─────────────────────────────────────────────────────
// Listado
// ─────────────────────────────────────────────────────

export const useEnrollments = (filters: EnrollmentFilters) => {
  return useQuery({
    queryKey: ENROLLMENT_KEYS.list(filters),

    queryFn: () => enrollmentsApi.getAll(filters),

    placeholderData: keepPreviousData,
  });
};

// ─────────────────────────────────────────────────────
// Detalle
// ─────────────────────────────────────────────────────

export const useEnrollment = (enrollmentId: number | null) => {
  return useQuery({
    queryKey:
      enrollmentId !== null
        ? ENROLLMENT_KEYS.detail(enrollmentId)
        : [...ENROLLMENT_KEYS.details(), "none"],

    queryFn: () => {
      if (enrollmentId === null) {
        throw new Error("Se requiere el ID de la matrícula.");
      }

      return enrollmentsApi.getById(enrollmentId);
    },

    enabled: enrollmentId !== null,
  });
};

// ─────────────────────────────────────────────────────
// Historial del estudiante
// ─────────────────────────────────────────────────────

export const useStudentEnrollments = (studentId: number | null) => {
  return useQuery({
    queryKey:
      studentId !== null
        ? ENROLLMENT_KEYS.studentHistory(studentId)
        : [...ENROLLMENT_KEYS.studentHistories(), "none"],

    queryFn: () => {
      if (studentId === null) {
        throw new Error("Se requiere el ID del estudiante.");
      }

      return enrollmentsApi.getByStudent(studentId);
    },

    enabled: studentId !== null,
  });
};

// ─────────────────────────────────────────────────────
// Crear
// ─────────────────────────────────────────────────────

export const useCreateEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEnrollmentRequest) =>
      enrollmentsApi.create(payload),

    onSuccess: (enrollment) => {
      queryClient.setQueryData(
        ENROLLMENT_KEYS.detail(enrollment.id),
        enrollment,
      );

      queryClient.invalidateQueries({
        queryKey: ENROLLMENT_KEYS.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: ENROLLMENT_KEYS.studentHistory(enrollment.student_id),
      });
    },
  });
};

// ─────────────────────────────────────────────────────
// Actualizar
// ─────────────────────────────────────────────────────

export const useUpdateEnrollment = (enrollmentId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateEnrollmentRequest) =>
      enrollmentsApi.update(enrollmentId, payload),

    onSuccess: (enrollment) => {
      queryClient.setQueryData(
        ENROLLMENT_KEYS.detail(enrollment.id),
        enrollment,
      );

      queryClient.invalidateQueries({
        queryKey: ENROLLMENT_KEYS.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: ENROLLMENT_KEYS.studentHistory(enrollment.student_id),
      });
    },
  });
};
