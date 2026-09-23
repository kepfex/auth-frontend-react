// Define la estructura que responde tu servidor en caso de error
export interface ErrorResponse {
  message?: string;
  code?: string;
  details?: string;
  errors?: Record<string, string[]>;
}
