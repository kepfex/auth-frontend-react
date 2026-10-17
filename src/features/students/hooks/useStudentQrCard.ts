import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { qrCardsApi } from "../api/qr-cards.api";

import type { UpdateQrCardStatusRequest } from "../types/qr-card.types";
import { STUDENT_KEYS } from "./useStudents";

export const STUDENT_QR_KEYS = {
  all: ["student-qr-cards"] as const,

  detail: (studentId: number) => [...STUDENT_QR_KEYS.all, studentId] as const,
};

/**
 * Consultar el QR de un estudiante.
 */
export const useStudentQrCard = (studentId: number, enabled = true) => {
  return useQuery({
    queryKey: STUDENT_QR_KEYS.detail(studentId),

    queryFn: () => qrCardsApi.getByStudent(studentId),

    enabled: enabled && studentId > 0,

    staleTime: 1000 * 60 * 5,

    retry: false,
  });
};

/**
 * Actualizar el estado del QR.
 */
export const useUpdateStudentQrStatus = (studentId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateQrCardStatusRequest) =>
      qrCardsApi.updateStatus(studentId, payload),

    onSuccess: (updatedQrCard) => {
      queryClient.setQueryData(
        STUDENT_QR_KEYS.detail(studentId),
        updatedQrCard,
      );

      queryClient.invalidateQueries({
        queryKey: STUDENT_QR_KEYS.detail(studentId),
      });

      queryClient.invalidateQueries({
        queryKey: STUDENT_KEYS.lists(),
      });
    },
  });
};
