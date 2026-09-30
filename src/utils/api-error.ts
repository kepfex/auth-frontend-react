import axios from "axios";

import type {
  ApiErrorResponse,
} from "@/types/api.types";

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Ocurrió un error inesperado",
): string => {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  const data = error.response?.data;

  const firstValidationError =
    Object.values(
      data?.errors ?? {},
    )[0]?.[0];

  return (
    firstValidationError ??
    data?.message ??
    data?.error ??
    fallback
  );
};