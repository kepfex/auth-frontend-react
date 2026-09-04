export interface AcademicYear {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Lo que enviamos al servidor para crear un nuevo año académico
export interface CreateAcademicYearRequest {
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

// Lo que enviamos al servidor para actualizar un año académico existente (todo es opcional)
export type UpdateAcademicYearRequest = Partial<CreateAcademicYearRequest>;

// Respuesta paginada de la API de Laravel
export interface PaginatedResponse {
  data: AcademicYear[];
  links: {
    first: string;
    last: string;
    prev: null;
    next: null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: Link[];
    path: string;
    per_page: number;
    to: number;
    total: number;
  }
}

export interface Link {
  url: null | string;
  label: string;
  page: number | null;
  active: boolean;
}
