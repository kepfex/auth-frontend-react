import { apiClient } from "@/api/client";

import type { QrCard, UpdateQrCardStatusRequest } from "../types/qr-card.types";

const getBaseUrl = (studentId: number) => `/students/${studentId}/qr-card`;

export const qrCardsApi = {
  /**
   * Obtener el QR único de un estudiante.
   */
  getByStudent: async (studentId: number): Promise<QrCard> => {
    const { data } = await apiClient.get<{
      data: QrCard;
    }>(getBaseUrl(studentId));

    return data.data;
  },

  /**
   * Activar o desactivar el QR.
   */
  updateStatus: async (
    studentId: number,
    payload: UpdateQrCardStatusRequest,
  ): Promise<QrCard> => {
    const { data } = await apiClient.patch<{
      data: QrCard;
    }>(`${getBaseUrl(studentId)}/status`, payload);

    return data.data;
  },
};
