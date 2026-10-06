import { useQuery } from "@tanstack/react-query";
import { enrollmentCatalogsApi } from "../api/enrollment-catalogs.api";

export const ENROLLMENT_CATALOG_KEYS = {
  all: ["enrollment-catalogs"] as const,

  statuses: () => [...ENROLLMENT_CATALOG_KEYS.all, "statuses"] as const,
};

export const useEnrollmentStatuses = () => {
  return useQuery({
    queryKey: ENROLLMENT_CATALOG_KEYS.statuses(),

    queryFn: enrollmentCatalogsApi.getStatuses,

    staleTime: Infinity,
  });
};
