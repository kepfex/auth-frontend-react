import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { classroomsApi } from "../api/classrooms.api";
import { useAppContextStore } from "@/store/app-context.store";
import type { CreateClassroomRequest, UpdateClassroomRequest } from "../types/classroom.types";

export const CLASSROOMS_KEYS = {
  all: ["classrooms"] as const,

  lists: () => [...CLASSROOMS_KEYS.all, "list"] as const,

  list: (
    academicYearId: number,
    educationalLevelId?: number
  ) =>
    [
      ...CLASSROOMS_KEYS.lists(),
      academicYearId,
      educationalLevelId ?? "all",
    ] as const,

  detail: (id: number) => [...CLASSROOMS_KEYS.all, "detail", id] as const
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
        queryKey: CLASSROOMS_KEYS.list(
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

export const useCreateClassroom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateClassroomRequest) => classroomsApi.create(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CLASSROOMS_KEYS.lists()
      })
    }
  })
}

export const useUpdateClassroom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateClassroomRequest;
    }) =>
      classroomsApi.update(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CLASSROOMS_KEYS.all,
      });
    },
  });
};

export const useDeleteClassroom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classroomsApi.remove,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CLASSROOMS_KEYS.lists(),
      });
    },
  });
};
