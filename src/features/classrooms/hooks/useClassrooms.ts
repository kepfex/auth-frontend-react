import { useQuery } from "@tanstack/react-query";
import { classroomsApi } from "../api/classrooms.api";
import { useAppContextStore } from "@/store/app-context.store";

export const CLASSROOMS_KEY = {
  all: ["classrooms"] as const,

  list: (
    academicYearId: number,
    educationalLevelId?: number
  ) =>
    [
      "classrooms",
      "list",
      academicYearId,
      educationalLevelId ?? "all",
    ] as const,
};

export const useClassrooms = () => {
    const academicYear = useAppContextStore(
        (state) => state.academicYear
    );

    const educationalLevel =
    useAppContextStore(
      (state) => state.educationalLevel
    );

    return useQuery({
        queryKey: CLASSROOMS_KEY.list(
            academicYear?.id ?? 0,
            educationalLevel?.id
        ),

        queryFn: () => classroomsApi.getAll({
            academic_year_id: academicYear!.id, // proviene directamente del selector global.
            educational_level_id: educationalLevel?.id,
            per_page: 100,
        })
        .then(response => response.data),

        enabled: Boolean(academicYear?.id), // evita ejecutar: GET /grade-sections?academic_year_id=undefined

        staleTime: 1000 * 60 * 5,
    })
};

