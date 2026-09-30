import { apiClient } from "@/api/client";
import type { GuardianRelationshipOption } from "../types/catalog.types";

const BASE_URL = "/catalogs";

export const catalogsApi = {
  getGuardianRelationships: async (): Promise<
    GuardianRelationshipOption[]
  > => {
    const { data } = await apiClient.get<{
      data: GuardianRelationshipOption[];
    }>(
      `${BASE_URL}/guardian-relationships`,
    );

    return data.data;
  },
};