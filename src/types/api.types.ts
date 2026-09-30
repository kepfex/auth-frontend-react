export interface LaravelValidationError {
  message: string;

  errors?: Record<
    string,
    string[]
  >;
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;

  errors?: Record<
    string,
    string[]
  >;
}