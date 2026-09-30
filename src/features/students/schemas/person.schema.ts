import z from "zod";

export const documentTypeSchema = z.enum(["DNI", "CE", "PASSPORT"]);

export const sexSchema = z.enum(["M", "F"]);

export const personSchema = z
  .object({
    document_type: documentTypeSchema,

    document_number: z
      .string()
      .trim()
      .min(1, "El número de documento es obligatorio")
      .max(20, "El documento no puede superar 20 caracteres"),

    first_names: z
      .string()
      .trim()
      .min(1, "Los nombres son obligatorios")
      .max(100),

    paternal_surname: z
      .string()
      .trim()
      .min(1, "El apellido paterno es obligatorio")
      .max(100),

    maternal_surname: z
      .string()
      .trim()
      .min(1, "El apellido materno es obligatorio")
      .max(100),

    phone: z.string().trim().max(20).optional().or(z.literal("")),

    email: z
      .union([z.literal(""), z.email("Ingresa un correo válido")])
      .optional(),

    birth_date: z.string().optional().or(z.literal("")),

    address: z.string().trim().max(255).optional().or(z.literal("")),

    sex: sexSchema.optional(),

    is_active: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.document_type === "DNI" && !/^\d{8}$/.test(data.document_number)) {
      ctx.addIssue({
        code: "custom",
        path: ["document_number"],
        message: "El DNI debe contener ocho dígitos",
      });
    }

    if (
      data.birth_date &&
      new Date(`${data.birth_date}T00:00:00`) > new Date()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["birth_date"],
        message: "La fecha de nacimiento no puede ser futura",
      });
    }
  });

export type PersonFormValues = z.infer<typeof personSchema>;
