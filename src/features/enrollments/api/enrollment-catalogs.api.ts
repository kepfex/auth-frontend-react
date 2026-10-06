import { apiClient } from "@/api/client";
import type { EnrollmentStatusOption } from "../types/enrollment-catalog.types";

export const enrollmentCatalogsApi = {
  getStatuses: async (): Promise<
    EnrollmentStatusOption[]
  > => {
    const { data } = await apiClient.get<{
      data: EnrollmentStatusOption[];
    }>("/catalogs/enrollment-statuses");

    return data.data;
  },
};