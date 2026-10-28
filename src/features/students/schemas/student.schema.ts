import { z } from "zod";

export const studentStatusSchema = z.enum([
  "activo",
  "inactivo",
  "egresado",
]);

export const studentSchema = z.object({

  status: studentStatusSchema,
});

export type StudentFormValues =
  z.infer<typeof studentSchema>;