import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assistantAssignmentsApi } from "../api/assistant-assignments.api";
import type { AssistantAssignmentFilters, CreateAssistantAssignmentRequest, FinishAssistantAssignmentRequest } from "../types/assistant-assignment.types";

export const ASSIGNMENT_KEYS = {
  all: ["assistant-assignments"] as const,
  lists: () => [...ASSIGNMENT_KEYS.all, "list"] as const,
  list: (filters: AssistantAssignmentFilters) => [...ASSIGNMENT_KEYS.lists(), filters] as const,
  details: () => [...ASSIGNMENT_KEYS.all, "detail"] as const,
  detail: (id: number) => [...ASSIGNMENT_KEYS.details(), id] as const,
};
export const useAssistantAssignments = (filters: AssistantAssignmentFilters = {}, enabled = true) => useQuery({
  queryKey: ASSIGNMENT_KEYS.list(filters), queryFn: () => assistantAssignmentsApi.getAll(filters),
  enabled, placeholderData: keepPreviousData, staleTime: 60_000,
});
export const useAssistantAssignment = (id?: number) => useQuery({
  queryKey: ASSIGNMENT_KEYS.detail(id ?? 0), queryFn: () => assistantAssignmentsApi.getById(id!),
  enabled: typeof id === "number" && Number.isInteger(id) && id > 0,
});
export const useCreateAssistantAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAssistantAssignmentRequest) => assistantAssignmentsApi.create(payload),
    onSuccess: (assignment) => {
      qc.setQueryData(ASSIGNMENT_KEYS.detail(assignment.id), assignment);
      qc.invalidateQueries({ queryKey: ASSIGNMENT_KEYS.lists() });
    },
  });
};
export const useFinishAssistantAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FinishAssistantAssignmentRequest }) => assistantAssignmentsApi.finish(id, payload),
    onSuccess: (assignment) => {
      qc.setQueryData(ASSIGNMENT_KEYS.detail(assignment.id), assignment);
      qc.invalidateQueries({ queryKey: ASSIGNMENT_KEYS.lists() });
    },
  });
};
