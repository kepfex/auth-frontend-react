import { z } from "zod";

export const studentStatusSchema = z.enum([
  "activo",
  "inactivo",
  "egresado",
]);

export const studentSchema = z.object({
  student_code: z
    .string()
    .trim()
    .min(1, "El código del estudiante es obligatorio")
    .max(
      25,
      "El código no puede superar 25 caracteres",
    ),

  status: studentStatusSchema,
});

export type StudentFormValues =
  z.infer<typeof studentSchema>;