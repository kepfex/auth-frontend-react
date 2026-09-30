import { useQuery } from "@tanstack/react-query";
import { catalogsApi } from "../api/catalogs.api";

export const CATALOG_KEYS = {
  all: ["catalogs"] as const,

  guardianRelationships: () =>
    [
      ...CATALOG_KEYS.all,
      "guardian-relationships",
    ] as const,
};

export const useGuardianRelationships = () => {
  return useQuery({
    queryKey:
      CATALOG_KEYS.guardianRelationships(),

    queryFn:
      catalogsApi.getGuardianRelationships,

    staleTime: 1000 * 60 * 60,

    gcTime: 1000 * 60 * 60 * 2,
  });
};