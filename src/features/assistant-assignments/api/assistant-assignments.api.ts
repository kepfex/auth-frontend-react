import { apiClient } from "@/api/client";
import type { AssistantAssignment, AssistantAssignmentFilters, AssistantAssignmentsPaginatedResponse, CreateAssistantAssignmentRequest, FinishAssistantAssignmentRequest } from "../types/assistant-assignment.types";

const BASE_URL = "/assistant-assignments";
export const assistantAssignmentsApi = {
  getAll: async (filters: AssistantAssignmentFilters = {}): Promise<AssistantAssignmentsPaginatedResponse> => {
    const { data } = await apiClient.get<AssistantAssignmentsPaginatedResponse>(BASE_URL, { params: filters });
    return data;
  },
  getById: async (id: number): Promise<AssistantAssignment> => {
    const { data } = await apiClient.get<{ data: AssistantAssignment }>(`${BASE_URL}/${id}`);
    return data.data;
  },
  create: async (payload: CreateAssistantAssignmentRequest): Promise<AssistantAssignment> => {
    const { data } = await apiClient.post<{ data: AssistantAssignment }>(BASE_URL, payload);
    return data.data;
  },
  finish: async (id: number, payload: FinishAssistantAssignmentRequest): Promise<AssistantAssignment> => {
    const { data } = await apiClient.patch<{ data: AssistantAssignment }>(`${BASE_URL}/${id}/finish`, payload);
    return data.data;
  },
};
