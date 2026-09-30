import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateStudentRequest, StudentFilters, UpdateStudentRequest } from "../types/student.types";
import { studentsApi } from "../api/students.api";

export const STUDENT_KEYS = {
  all: ["students"] as const,

  lists: () =>
    [...STUDENT_KEYS.all, "list"] as const,

  list: (filters: StudentFilters) =>
    [
      ...STUDENT_KEYS.lists(),
      filters,
    ] as const,

  details: () =>
    [...STUDENT_KEYS.all, "detail"] as const,

  detail: (id: number) =>
    [...STUDENT_KEYS.details(), id] as const,
};

export const useStudents = (
  filters: StudentFilters = {},
) => {
  return useQuery({
    queryKey: STUDENT_KEYS.list(filters),

    queryFn: () =>
      studentsApi.getAll(filters),

    placeholderData: keepPreviousData,

    staleTime: 1000 * 60 * 5,
  });
};

export const useStudent = (
  id: number,
  enabled = true,
) => {
  return useQuery({
    queryKey: STUDENT_KEYS.detail(id),

    queryFn: () =>
      studentsApi.getById(id),

    enabled: enabled && id > 0,

    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: CreateStudentRequest,
    ) =>
      studentsApi.create(payload),

    onSuccess: (student) => {
      queryClient.setQueryData(
        STUDENT_KEYS.detail(student.id),
        student,
      );

      queryClient.invalidateQueries({
        queryKey: STUDENT_KEYS.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: ["persons", "search"],
      });
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateStudentRequest;
    }) =>
      studentsApi.update(id, payload),

    onSuccess: (student) => {
      queryClient.setQueryData(
        STUDENT_KEYS.detail(student.id),
        student,
      );

      queryClient.invalidateQueries({
        queryKey: STUDENT_KEYS.lists(),
      });
    },
  });
};