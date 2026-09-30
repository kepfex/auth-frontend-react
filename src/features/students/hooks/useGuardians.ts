import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { guardiansApi } from "../api/guardians.api";
import type { CreateGuardianRequest, CreateStudentGuardianRequest, UpdateGuardianRequest, UpdateStudentGuardianRequest } from "../types/guardian.types";
import { PERSON_KEYS } from "./usePersonSearch";

export const GUARDIAN_KEYS = {
  all: ["guardians"] as const,

  details: () =>
    [...GUARDIAN_KEYS.all, "detail"] as const,

  detail: (id: number) =>
    [...GUARDIAN_KEYS.details(), id] as const,

  byStudent: (studentId: number) =>
    [
      ...GUARDIAN_KEYS.all,
      "student",
      studentId,
    ] as const,
};

export const useGuardian = (
  id: number,
  enabled = true,
) => {
  return useQuery({
    queryKey: GUARDIAN_KEYS.detail(id),

    queryFn: () =>
      guardiansApi.getById(id),

    enabled: enabled && id > 0,

    staleTime: 1000 * 60 * 5,
  });
};

export const useStudentGuardians = (
  studentId: number,
  enabled = true,
) => {
  return useQuery({
    queryKey:
      GUARDIAN_KEYS.byStudent(studentId),

    queryFn: () =>
      guardiansApi.getByStudent(studentId),

    enabled:
      enabled && studentId > 0,

    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateGuardian = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: CreateGuardianRequest,
    ) =>
      guardiansApi.create(payload),

    onSuccess: (guardian) => {
      queryClient.setQueryData(
        GUARDIAN_KEYS.detail(guardian.id),
        guardian,
      );

      queryClient.invalidateQueries({
        queryKey: PERSON_KEYS.searches(),
      });
    },
  });
};

export const useUpdateGuardian = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateGuardianRequest;
    }) =>
      guardiansApi.update(id, payload),

    onSuccess: (guardian) => {
      queryClient.setQueryData(
        GUARDIAN_KEYS.detail(guardian.id),
        guardian,
      );

      queryClient.invalidateQueries({
        queryKey: GUARDIAN_KEYS.all,
      });
    },
  });
};

export const useAttachGuardianToStudent =
  (studentId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (
        payload: CreateStudentGuardianRequest,
      ) =>
        guardiansApi.attachToStudent(
          studentId,
          payload,
        ),

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey:
            GUARDIAN_KEYS.byStudent(
              studentId,
            ),
        });
      },
    });
  };

export const useUpdateStudentGuardian =
  (studentId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({
        studentGuardianId,
        payload,
      }: {
        studentGuardianId: number;
        payload:
          UpdateStudentGuardianRequest;
      }) =>
        guardiansApi.updateStudentGuardian(
          studentId,
          studentGuardianId,
          payload,
        ),

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey:
            GUARDIAN_KEYS.byStudent(
              studentId,
            ),
        });
      },
    });
  };

export const useDetachGuardianFromStudent =
  (studentId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (
        studentGuardianId: number,
      ) =>
        guardiansApi.detachFromStudent(
          studentId,
          studentGuardianId,
        ),

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey:
            GUARDIAN_KEYS.byStudent(
              studentId,
            ),
        });
      },
    });
  };