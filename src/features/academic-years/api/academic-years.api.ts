import { apiClient } from "@/api/client";
import type { AcademicYear } from "../types/academic-year.types";

interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
    };
}

export const getAcademicYearsApi = async (): Promise<AcademicYear[]> => {
    const {data} = await apiClient.get<PaginatedResponse<AcademicYear>>(
        "/academic-years?per_page=50" // trae todos — nunca habrá 50 años académicos
    );
    return data.data; // desenvuelve la paginación de Laravel
}