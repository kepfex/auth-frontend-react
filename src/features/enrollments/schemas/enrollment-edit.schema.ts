import { z } from "zod";

export const enrollmentEditSchema = z.object({
  grade_section_id: z
    .number({
      error: "Debe seleccionar un aula.",
    })
    .int()
    .positive("Debe seleccionar un aula."),

  enrollment_date: z.string().min(1, "La fecha de matrícula es obligatoria."),

  status: z.enum(["matriculado", "culminado", "retirado", "trasladado"]),

  observations: z
    .string()
    .max(2000, "Las observaciones no pueden superar los 2000 caracteres.")
    .optional(),
});

export type EnrollmentEditFormValues = z.infer<typeof enrollmentEditSchema>;
