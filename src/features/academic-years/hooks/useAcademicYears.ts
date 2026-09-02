import { useQuery } from "@tanstack/react-query"
import { getAcademicYearsApi } from "../api/academic-years.api"

// Query key como constante — evita typos en invalidaciones futuras
export const ACADEMIC_YEARS_KEY = ['academic-years'] as const

export const useAcademicYears = () => {
    return useQuery({
        queryKey: ACADEMIC_YEARS_KEY,
        queryFn: getAcademicYearsApi,
        staleTime: 1000 * 60 * 30, // 30 min — los años académicos no cambian seguido
    })
}