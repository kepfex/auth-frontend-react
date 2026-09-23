import { apiClient } from "@/api/client";
import type { CreateGradeRequest, CreateLevelRequest, CreateSectionRequest, EducationalLevel, Grade, Section, UpdateGradeRequest, UpdateLevelRequest, UpdateSectionRequest } from "../types/academic-structure.types";

// ── Niveles ───────────────────────────────────────────
export const levelsApi = {
    getAll: async (): Promise<EducationalLevel[]> => {
        const { data } = await apiClient.get<{ data: EducationalLevel[] }>('/educational-levels')
        return data.data
    },
    create: async (payload: CreateLevelRequest): Promise<EducationalLevel> => {
        const { data } = await apiClient.post<{ data: EducationalLevel }>('/educational-levels', payload)
        return data.data
    },
    update: async (id: number, payload: UpdateLevelRequest): Promise<EducationalLevel> => {
        const { data } = await apiClient.put<{ data: EducationalLevel }>(`/educational-levels/${id}`, payload)
        return data.data
    },
    remove: async (id: number): Promise<void> => {
        await apiClient.delete(`/educational-levels/${id}`)
    },
}

// ── Grados ────────────────────────────────────────────
export const gradesApi = {
    getAll: async (): Promise<Grade[]> => {
        const { data } = await apiClient.get<{ data: Grade[] }>('/grades')
        return data.data
    },
    create: async (payload: CreateGradeRequest): Promise<Grade> => {
        const { data } = await apiClient.post<{ data: Grade }>('/grades', payload)
        return data.data
    },
    update: async (id: number, payload: UpdateGradeRequest): Promise<Grade> => {
        const { data } = await apiClient.put<{ data: Grade }>(`/grades/${id}`, payload)
        return data.data
    },
    remove: async (id: number): Promise<void> => {
        await apiClient.delete(`/grades/${id}`)
    },
}

// ── Secciones ─────────────────────────────────────────
export const sectionsApi = {
    getAll: async (): Promise<Section[]> => {
        const { data } = await apiClient.get<{ data: Section[] }>('/sections')
        return data.data
    },
    create: async (payload: CreateSectionRequest): Promise<Section> => {
        const { data } = await apiClient.post<{ data: Section }>('/sections', payload)
        return data.data
    },
    update: async (id: number, payload: UpdateSectionRequest): Promise<Section> => {
        const { data } = await apiClient.put<{ data: Section }>(
            `/sections/${id}`,
            payload
        )
        return data.data
    },
    remove: async (id: number): Promise<void> => {
        await apiClient.delete(`/sections/${id}`)
    },
}