import { z } from "zod";
const isoDay = z.iso.date();
export const createAssistantAssignmentSchema = z.object({
  employee_id: z.number().int().positive(),
  grade_section_id: z.number().int().positive(),
  start_date: isoDay,
  end_date: z.union([isoDay, z.null()]).optional(),
}).superRefine((data, ctx) => {
  if (data.end_date && data.end_date < data.start_date) {
    ctx.addIssue({ code: "custom", path: ["end_date"], message: "La fecha final debe ser igual o posterior al inicio" });
  }
});
export const finishAssistantAssignmentSchema = z.object({
  end_date: isoDay,
});
