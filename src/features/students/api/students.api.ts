import { apiClient } from "@/api/client";
import type {
  CreateStudentRequest,
  Student,
  StudentFilters,
  StudentPaginatedResponse,
  UpdateStudentRequest,
} from "../types/student.types";

const BASE_URL = "/students";

export const studentsApi = {
  getAll: async (
    filters: StudentFilters = {},
  ): Promise<StudentPaginatedResponse> => {
    const { data } = await apiClient.get<StudentPaginatedResponse>(BASE_URL, {
      params: filters,
    });

    return data;
  },

  getById: async (id: number): Promise<Student> => {
    const { data } = await apiClient.get<{
      data: Student;
    }>(`${BASE_URL}/${id}`);

    return data.data;
  },

  create: async (payload: CreateStudentRequest): Promise<Student> => {
    const { data } = await apiClient.post<{
      data: Student;
    }>(BASE_URL, payload);

    return data.data;
  },

  update: async (
    id: number,
    payload: UpdateStudentRequest,
  ): Promise<Student> => {
    const { data } = await apiClient.patch<{
      data: Student;
    }>(`${BASE_URL}/${id}`, payload);

    return data.data;
  },
};
