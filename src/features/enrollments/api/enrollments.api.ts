import type { PaginatedResponse } from "@/shared/types/shared.types";
import type {
  CreateEnrollmentRequest,
  Enrollment,
  EnrollmentFilters,
  UpdateEnrollmentRequest,
} from "../types/enrollment.types";
import { apiClient } from "@/api/client";

export const enrollmentsApi = {
  // ───────────────────────────────────────────────────
  // Listado general
  // ───────────────────────────────────────────────────

  getAll: async (
    filters: EnrollmentFilters = {},
  ): Promise<PaginatedResponse<Enrollment>> => {
    const { data } = await apiClient.get<PaginatedResponse<Enrollment>>(
      "/enrollments",
      {
        params: filters,
      },
    );

    return data;
  },

  // ───────────────────────────────────────────────────
  // Detalle
  // ───────────────────────────────────────────────────

  getById: async (enrollmentId: number): Promise<Enrollment> => {
    const { data } = await apiClient.get<{
      data: Enrollment;
    }>(`/enrollments/${enrollmentId}`);

    return data.data;
  },

  // ───────────────────────────────────────────────────
  // Crear
  // ───────────────────────────────────────────────────

  create: async (payload: CreateEnrollmentRequest): Promise<Enrollment> => {
    const { data } = await apiClient.post<{
      data: Enrollment;
    }>("/enrollments", payload);

    return data.data;
  },

  // ───────────────────────────────────────────────────
  // Actualizar
  // ───────────────────────────────────────────────────

  update: async (
    enrollmentId: number,
    payload: UpdateEnrollmentRequest,
  ): Promise<Enrollment> => {
    const { data } = await apiClient.patch<{
      data: Enrollment;
    }>(`/enrollments/${enrollmentId}`, payload);

    return data.data;
  },

  // ───────────────────────────────────────────────────
  // Historial de un estudiante
  // ───────────────────────────────────────────────────

  getByStudent: async (studentId: number): Promise<Enrollment[]> => {
    const { data } = await apiClient.get<{
      data: Enrollment[];
    }>(`/students/${studentId}/enrollments`);

    return data.data;
  },
};
