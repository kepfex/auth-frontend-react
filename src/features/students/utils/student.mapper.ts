import type { Student, UpdateStudentRequest } from "../types/student.types";

import type { StudentEditFormValues } from "../schemas/student-edit.schema";

export const mapStudentToEditForm = (
  student: Student,
): StudentEditFormValues => ({
  person: {
    document_type: student.person.document_type,

    document_number: student.person.document_number,

    first_names: student.person.first_names,

    paternal_surname: student.person.paternal_surname,

    maternal_surname: student.person.maternal_surname ?? "",

    phone: student.person.phone ?? "",

    email: student.person.email ?? "",

    birth_date: student.person.birth_date ?? "",

    address: student.person.address ?? "",

    sex: student.person.sex ?? undefined,

    is_active: student.person.is_active,
  },

  student: {
    student_code: student.student_code,

    status: student.status,
  },
});

export const mapStudentEditToRequest = (
  values: StudentEditFormValues,
): UpdateStudentRequest => ({
  student_code: values.student.student_code.trim(),

  status: values.student.status,

  person: {
    document_type: values.person.document_type,

    document_number: values.person.document_number.trim(),

    first_names: values.person.first_names.trim(),

    paternal_surname: values.person.paternal_surname.trim(),

    maternal_surname: values.person.maternal_surname?.trim() || null,

    phone: values.person.phone?.trim() || null,

    email: values.person.email?.trim() || null,

    birth_date: values.person.birth_date || null,

    address: values.person.address?.trim() || null,

    sex: values.person.sex ?? null,

    is_active: values.person.is_active,
  },
});
