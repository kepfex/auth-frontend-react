import { z } from "zod";

import {
  personSchema,
} from "./person.schema";

export const studentEditSchema =
  z.object({
    person: personSchema,

    student: z.object({
      student_code: z
        .string()
        .trim()
        .min(
          1,
          "El código del estudiante es obligatorio",
        )
        .max(
          50,
          "El código no puede superar los 50 caracteres",
        ),

      status: z.enum([
        "activo",
        "inactivo",
        "egresado",
      ]),
    }),
  });

export type StudentEditFormValues =
  z.infer<
    typeof studentEditSchema
  >;