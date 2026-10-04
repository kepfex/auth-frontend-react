export type DocumentType = "DNI" | "CE" | "PASSPORT";

export type Sex = "M" | "F";

export interface Person {
  id: number;

  document_type: DocumentType;
  document_number: string;

  first_names: string;
  paternal_surname: string;
  maternal_surname: string;

  phone: string | null;
  email: string | null;
  birth_date: string | null;
  address: string | null;

  sex: Sex | null;
  is_active: boolean;

  student_id: number | null;
  guardian_id: number | null;
}

export interface PersonSearchParams {
  document_type: DocumentType;
  document_number: string;
}

export interface CreatePersonRequest {
  document_type: DocumentType;
  document_number: string;

  first_names: string;
  paternal_surname: string;
  maternal_surname?: string | null;

  phone?: string | null;
  email?: string | null;
  birth_date?: string | null;
  address?: string | null;

  sex?: Sex | null;
  is_active?: boolean;
}

export interface PersonFormValues {
  document_type: DocumentType;
  document_number: string;

  first_names: string;
  paternal_surname: string;
  maternal_surname?: string | null;

  phone?: string | null;
  email?: string | null;
  birth_date?: string | null;
  address?: string | null;

  sex?: Sex | null;
  is_active?: boolean;
}

export type UpdatePersonRequest  = Partial<CreatePersonRequest>;
