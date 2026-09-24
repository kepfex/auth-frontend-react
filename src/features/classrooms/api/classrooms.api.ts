import { apiClient } from "@/api/client";
import type { Classroom, ClassroomFilters, ClassroomPaginatedResponse, CreateClassroomRequest, UpdateClassroomRequest } from "../types/classroom.types";

const BASE_URL = "/grade-sections";

export const classroomsApi = {
    getAll: async (filters: ClassroomFilters): Promise<ClassroomPaginatedResponse> => {
        const {data} = await apiClient.get<ClassroomPaginatedResponse>(
            BASE_URL,
            {params: filters},
        );

        return data;
    },

    create: async (payload: CreateClassroomRequest): Promise<Classroom> => {
        const {data} = await apiClient.post<{data: Classroom}>(
            BASE_URL,
            payload
        );

        return data.data;
    },

    update: async (id: number, payload: UpdateClassroomRequest): Promise<Classroom> => {
        const {data} = await apiClient.put<{data: Classroom}>(
            `${BASE_URL}/${id}`,
            payload
        );

        return data.data
    },

    remove: async (id: number): Promise<void> => {
        await apiClient.delete(`${BASE_URL}/${id}`)
    }
}