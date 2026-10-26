import { apiClient } from "@/api/client";
import type { CreateEmployeeRequest, Employee, EmployeeFilters, EmployeePaginatedResponse, SyncEmployeePositionsRequest, UpdateEmployeeStatusRequest } from "../types/employee.types";

const BASE_URL = "/employees";
export const employeesApi = {
  getAll: async (filters: EmployeeFilters = {}): Promise<EmployeePaginatedResponse> => {
    const { data } = await apiClient.get<EmployeePaginatedResponse>(BASE_URL, { params: filters });
    return data;
  },
  getById: async (id: number): Promise<Employee> => {
    const { data } = await apiClient.get<{ data: Employee }>(`${BASE_URL}/${id}`);
    return data.data;
  },
  create: async (payload: CreateEmployeeRequest): Promise<Employee> => {
    const { data } = await apiClient.post<{ data: Employee }>(BASE_URL, payload);
    return data.data;
  },
  syncPositions: async (id: number, payload: SyncEmployeePositionsRequest): Promise<Employee> => {
    const { data } = await apiClient.put<{ data: Employee }>(`${BASE_URL}/${id}/positions`, payload);
    return data.data;
  },
  updateStatus: async (id: number, payload: UpdateEmployeeStatusRequest): Promise<Employee> => {
    const { data } = await apiClient.patch<{ data: Employee }>(`${BASE_URL}/${id}/status`, payload);
    return data.data;
  },
};
