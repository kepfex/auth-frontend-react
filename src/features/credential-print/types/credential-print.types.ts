export interface CredentialStudent {
  enrollment_id: number;
  student_id: number;
  student_code: string;
  student_status: "activo" | "inactivo" | "egresado";
  full_name: string;
  qr: {
    uuid: string;
    is_active: boolean;
  } | null;
}

export interface ClassroomCredentialData {
  academic_year_id: number;
  grade_section_id: number;
  grade: string;
  section: string;
  level: string;
  students: CredentialStudent[];
}
