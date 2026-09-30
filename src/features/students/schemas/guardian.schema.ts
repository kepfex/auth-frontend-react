import { z } from "zod";

export const guardianSchema = z.object({
  occupation: z
    .string()
    .trim()
    .max(
      100,
      "La ocupación no puede superar 100 caracteres",
    )
    .optional()
    .or(z.literal("")),

  is_active: z.boolean(),
});

export const studentGuardianSchema = z.object({
  guardian_id: z
    .number()
    .int()
    .positive(),

  relationship: z
    .string()
    .min(1, "Selecciona el parentesco"),

  is_primary: z.boolean(),

  receives_notifications: z.boolean(),
});

export type GuardianFormValues =
  z.infer<typeof guardianSchema>;

export type StudentGuardianFormValues =
  z.infer<typeof studentGuardianSchema>;