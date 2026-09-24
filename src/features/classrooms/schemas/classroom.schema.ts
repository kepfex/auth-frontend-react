import z from "zod";

export const classroomSchema = z.object({
  section_id: z.coerce.number().int().positive("Selecciona una sección"),

  shift: z.enum(["mañana", "tarde", "mañana y tarde"]),

  capacity: z.coerce
    .number()
    .int()
    .min(1, "La capacidad debe ser mayor a 0")
    .max(100, "La capacidad máxima permitida es 100"),

  is_active: z.boolean(),
});

export type ClassroomFormValues = z.infer<typeof classroomSchema>