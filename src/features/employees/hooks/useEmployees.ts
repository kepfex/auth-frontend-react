import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PERSON_KEYS } from "@/features/students/hooks/usePersonSearch";
import { employeesApi } from "../api/employees.api";
import type { CreateEmployeeRequest, EmployeeFilters, SyncEmployeePositionsRequest, UpdateEmployeeStatusRequest } from "../types/employee.types";
import { ASSIGNMENT_KEYS } from "@/features/assistant-assignments/hooks/useAssistantAssignments";

export const EMPLOYEE_KEYS = {
  all: ["employees"] as const,
  lists: () => [...EMPLOYEE_KEYS.all, "list"] as const,
  list: (filters: EmployeeFilters) => [...EMPLOYEE_KEYS.lists(), filters] as const,
  details: () => [...EMPLOYEE_KEYS.all, "detail"] as const,
  detail: (id: number) => [...EMPLOYEE_KEYS.details(), id] as const,
};
export const useEmployees = (filters: EmployeeFilters = {}, enabled = true) => useQuery({
  queryKey: EMPLOYEE_KEYS.list(filters), queryFn: () => employeesApi.getAll(filters),
  enabled, placeholderData: keepPreviousData, staleTime: 60_000,
});
export const useEmployee = (id?: number) => useQuery({
  queryKey: EMPLOYEE_KEYS.detail(id ?? 0), queryFn: () => employeesApi.getById(id!),
  enabled: typeof id === "number" && Number.isInteger(id) && id > 0,
});
export const useCreateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEmployeeRequest) => employeesApi.create(payload),
    onSuccess: (employee) => {
      qc.setQueryData(EMPLOYEE_KEYS.detail(employee.id), employee);
      qc.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
      qc.invalidateQueries({ queryKey: PERSON_KEYS.searches() });
    },
  });
};
export const useSyncEmployeePositions = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SyncEmployeePositionsRequest }) => employeesApi.syncPositions(id, payload),
    onSuccess: (employee) => {
      qc.setQueryData(EMPLOYEE_KEYS.detail(employee.id), employee);
      qc.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
      qc.invalidateQueries({ queryKey: ASSIGNMENT_KEYS.lists() });
    },
  });
};
export const useUpdateEmployeeStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateEmployeeStatusRequest }) => employeesApi.updateStatus(id, payload),
    onSuccess: (employee) => {
      qc.setQueryData(EMPLOYEE_KEYS.detail(employee.id), employee);
      qc.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
      qc.invalidateQueries({ queryKey: ASSIGNMENT_KEYS.lists() });
    },
  });
};
