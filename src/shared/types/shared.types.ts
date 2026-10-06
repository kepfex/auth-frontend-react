// Define la estructura que responde tu servidor en caso de error
export interface ErrorResponse {
  message?: string;
  code?: string;
  details?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];

  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };

  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}