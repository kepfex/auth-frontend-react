import type { EnrollmentFormValues } from "../schemas/enrollment.schema";
import type { CreateEnrollmentRequest } from "../types/enrollment.types";

export const mapEnrollmentFormToRequest = (
  values: EnrollmentFormValues,
): CreateEnrollmentRequest => {
  return {
    student_id: values.student_id,

    academic_year_id: values.academic_year_id,

    grade_section_id: values.grade_section_id,

    enrollment_date: values.enrollment_date,

    observations: values.observations?.trim() || null,
  };
};
