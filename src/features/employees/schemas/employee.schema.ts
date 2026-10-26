import { z } from "zod";
import { personSchema } from "@/features/students/schemas/person.schema";

const employeePersonSchema = personSchema.safeExtend({
  maternal_surname: z.string().trim().max(100).nullable().optional(),
});
const initialPositions = z.array(z.number().int().positive()).min(1, "Selecciona al menos un cargo").max(20)
  .refine((ids) => new Set(ids).size === ids.length, "No repitas cargos");
export const employeeWithExistingPersonSchema = z.object({ person_id: z.number().int().positive(), position_ids: initialPositions });
export const employeeWithNewPersonSchema = z.object({ person: employeePersonSchema, position_ids: initialPositions });
export const createEmployeeSchema = z.union([employeeWithExistingPersonSchema, employeeWithNewPersonSchema]);
export const syncEmployeePositionsSchema = z.object({
  position_ids: z.array(z.number().int().positive()).max(20).refine((ids) => new Set(ids).size === ids.length, "No repitas cargos"),
});
export const employeeStatusSchema = z.object({ is_active: z.boolean() });
