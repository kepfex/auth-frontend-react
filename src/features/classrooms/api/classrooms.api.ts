import { apiClient } from "@/api/client";
import type { ClassroomFilters, ClassroomPaginatedResponse } from "../types/classroom.types";

const BASE = "/grade-sections";

export const classroomsApi = {
    getAll: async (filters: ClassroomFilters): Promise<ClassroomPaginatedResponse> => {
        const {data} = await apiClient.get<ClassroomPaginatedResponse>(
            BASE,
            {params: filters},
        );

        return data;
    }
}