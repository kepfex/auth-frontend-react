import axios from "axios";
import type { ErrorResponse } from "../types/shared.types";

export const getApiError = (
  error: unknown,
  fallback = "Ha ocurrido un error"
) => {
  if (!axios.isAxiosError<ErrorResponse>(error)) {
    return {
      message: fallback,
    };
  }

  return {
    message: error.response?.data?.message ?? fallback,
    code: error.response?.data?.code,
    details: error.response?.data?.details,
    status: error.response?.status,
  };
};