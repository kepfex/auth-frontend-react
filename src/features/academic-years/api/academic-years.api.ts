import { apiClient } from "@/api/client";
import type { AcademicYear, CreateAcademicYearRequest, PaginatedResponse, UpdateAcademicYearRequest } from "../types/academic-year.types";

// interface PaginatedResponse<T> {
//     data: T[];
//     meta: {
//         current_page: number;
//         last_page: number;
//         total: number;
//     };
// }

const BASE = '/academic-years';

export const getAcademicYearsApi = async (): Promise<AcademicYear[]> => {
    const {data} = await apiClient.get<PaginatedResponse>(
        "/academic-years?per_page=50" // trae todos — nunca habrá 50 años académicos
    );
    return data.data; // desenvuelve la paginación de Laravel
}

export const academicYearsApi = {
    // GET /academic-years?page=1&per_page=10
    getAll: async (page = 1): Promise<PaginatedResponse> => {
        const {data} = await apiClient.get<PaginatedResponse>(BASE, {
            params: { page, per_page: 10 }
        })
        return data;
    },

    // POST /academic-years
    create: async (payload: CreateAcademicYearRequest): Promise<AcademicYear> => {
        const {data} = await apiClient.post<{data: AcademicYear}>(BASE, payload);
        return data.data;
    },

    // PUT /academic-years/:id
    update: async (id: number, payload: UpdateAcademicYearRequest): Promise<AcademicYear> => {
        const {data} = await apiClient.put<{data: AcademicYear}>(`${BASE}/${id}`, payload);
        return data.data;
    },

    // DELETE /academic-years/:id
    remove: async (id: number): Promise<void> => {
        await apiClient.delete(`${BASE}/${id}`);
    }
}