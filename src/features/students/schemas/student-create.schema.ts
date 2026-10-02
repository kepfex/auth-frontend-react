import z from "zod";
import { personSchema } from "./person.schema";
import { studentSchema } from "./student.schema";

export const studentCreateSchema = z.object({
  person: personSchema,
  student: studentSchema,
});

export type StudentCreateFormValues = z.infer<typeof studentCreateSchema>;

export const STUDENT_CREATE_DEFAULT_VALUES: StudentCreateFormValues = {
  person: {
    document_type: "DNI",
    document_number: "",
    first_names: "",
    paternal_surname: "",
    maternal_surname: "",
    phone: "",
    email: "",
    birth_date: "",
    address: "",
    sex: undefined,
    is_active: true,
  },

  student: {
    student_code: "",
    status: "activo",
  },
};
