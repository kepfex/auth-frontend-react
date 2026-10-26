import { z } from "zod";
import { personSchema } from "@/features/students/schemas/person.schema";

const positionIds = z.array(z.number().int().positive()).min(1, "Selecciona al menos un cargo").max(20)
  .refine((values) => new Set(values).size === values.length, "No repitas cargos");
export const employeeWithExistingPersonSchema = z.object({ person_id: z.number().int().positive(), position_ids: positionIds });
export const employeeWithNewPersonSchema = z.object({ person: personSchema, position_ids: positionIds });
export const createEmployeeSchema = z.union([employeeWithExistingPersonSchema, employeeWithNewPersonSchema]);
export const syncEmployeePositionsSchema = z.object({
  position_ids: z.array(z.number().int().positive()).max(20)
    .refine((values) => new Set(values).size === values.length, "No repitas cargos"),
});
export const employeeStatusSchema = z.object({ is_active: z.boolean() });
