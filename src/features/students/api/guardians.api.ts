import { apiClient } from "@/api/client";
import type { CreateGuardianRequest, CreateStudentGuardianRequest, Guardian, StudentGuardian, UpdateGuardianRequest, UpdateStudentGuardianRequest } from "../types/guardian.types";

const GUARDIANS_URL = "/guardians";
const STUDENTS_URL = "/students";

export const guardiansApi = {
  getById: async (id: number): Promise<Guardian> => {
    const { data } = await apiClient.get<{
      data: Guardian;
    }>(`${GUARDIANS_URL}/${id}`);

    return data.data;
  },

  create: async (payload: CreateGuardianRequest): Promise<Guardian> => {
    const { data } = await apiClient.post<{
      data: Guardian;
    }>(GUARDIANS_URL, payload);

    return data.data;
  },

  update: async (
    id: number,
    payload: UpdateGuardianRequest,
  ): Promise<Guardian> => {
    const { data } = await apiClient.patch<{
      data: Guardian;
    }>(`${GUARDIANS_URL}/${id}`, payload);

    return data.data;
  },

  getByStudent: async (studentId: number): Promise<StudentGuardian[]> => {
    const { data } = await apiClient.get<{
      data: StudentGuardian[];
    }>(`${STUDENTS_URL}/${studentId}/guardians`);

    return data.data;
  },

  attachToStudent: async (
    studentId: number,
    payload: CreateStudentGuardianRequest,
  ): Promise<StudentGuardian> => {
    const { data } = await apiClient.post<{
      data: StudentGuardian;
    }>(`${STUDENTS_URL}/${studentId}/guardians`, payload);

    return data.data;
  },

  updateStudentGuardian: async (
    studentId: number,
    studentGuardianId: number,
    payload: UpdateStudentGuardianRequest,
  ): Promise<StudentGuardian> => {
    const { data } = await apiClient.patch<{
      data: StudentGuardian;
    }>(`${STUDENTS_URL}/${studentId}/guardians/${studentGuardianId}`, payload);

    return data.data;
  },

  detachFromStudent: async (
    studentId: number,
    studentGuardianId: number,
  ): Promise<void> => {
    await apiClient.delete(
      `${STUDENTS_URL}/${studentId}/guardians/${studentGuardianId}`,
    );
  },
};
