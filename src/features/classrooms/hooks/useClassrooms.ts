import { useAuthStore } from "@/features/auth/store/auth.store"
import { useQuery } from "@tanstack/react-query";
import { classroomsApi } from "../api/classrooms.api";

export const CLASSROOMS_KEY = {
    all: ["classrooms"] as const,
    
    byAcademicYear: (academicYearId: number) => [
        "classrooms", "academic-year", academicYearId
    ] as const,
}

export const useClassrooms = () => {
    const academicYear = useAuthStore(
        (state) => state.academicYear
    );

    return useQuery({
        queryKey: CLASSROOMS_KEY.byAcademicYear(
            academicYear?.id ?? 0
        ),

        queryFn: () => classroomsApi.getAll({
            academic_year_id: academicYear!.id, // proviene directamente del selector global.
            per_page: 100,
        })
        .then(response => response.data),

        enabled: Boolean(academicYear?.id), // evita ejecutar: GET /grade-sections?academic_year_id=undefined

        staleTime: 1000 * 60 * 5,
    })
};

