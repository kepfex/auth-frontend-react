import { z } from "zod";

export const enrollmentSchema = z.object({
  student_id: z
    .number({
      error: "Debe seleccionar un estudiante.",
    })
    .int()
    .positive("Debe seleccionar un estudiante."),

  academic_year_id: z
    .number({
      error: "Debe seleccionar un año académico.",
    })
    .int()
    .positive("Debe seleccionar un año académico."),

  grade_section_id: z
    .number({
      error: "Debe seleccionar un aula.",
    })
    .int()
    .positive("Debe seleccionar un aula."),

  enrollment_date: z.string().min(1, "La fecha de matrícula es obligatoria."),

  observations: z
    .string()
    .max(2000, "Las observaciones no pueden superar los 2000 caracteres.")
    .optional(),
});

export type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;
