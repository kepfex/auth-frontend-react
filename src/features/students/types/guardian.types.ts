import type { CreatePersonRequest, Person } from "./person.types";

export interface Guardian {
  id: number;
  person_id: number;

  occupation: string | null;
  is_active: boolean;

  person: Person;

  created_at: string;
}

interface GuardianBaseRequest {
  occupation?: string | null;
  is_active?: boolean;
}

export interface CreateGuardianWithPersonRequest
  extends GuardianBaseRequest {
  person: CreatePersonRequest;
  person_id?: never;
}

export interface CreateGuardianWithPersonIdRequest
  extends GuardianBaseRequest {
  person_id: number;
  person?: never;
}

export type CreateGuardianRequest =
  | CreateGuardianWithPersonRequest
  | CreateGuardianWithPersonIdRequest;

export interface UpdateGuardianRequest {
  occupation?: string | null;
  is_active?: boolean;
}

export type GuardianRelationship =
  | "padre"
  | "madre"
  | "abuelo"
  | "abuela"
  | "tío"
  | "tía"
  | "hermano/a"
  | "tutor_legal"
  | "otro";
  
export interface StudentGuardian {
  id: number;

  student_id: number;
  guardian_id: number;

  relationship: GuardianRelationship;
  relationship_label: string;

  is_primary: boolean;
  receives_notifications: boolean;

  guardian: Guardian;
}

export interface CreateStudentGuardianRequest {
  guardian_id: number;
  relationship: GuardianRelationship;
  is_primary?: boolean;
  receives_notifications?: boolean;
}

export interface UpdateStudentGuardianRequest {
  relationship?: GuardianRelationship;
  is_primary?: boolean;
  receives_notifications?: boolean;
}