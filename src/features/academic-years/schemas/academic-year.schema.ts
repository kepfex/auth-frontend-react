import z from "zod";

export const academicYearSchema = z.object({
    name: z
        .string()
        .min(4, 'El año debe tener 4 dígitos')
        .max(4, 'El año debe tener 4 dígitos')
        .regex(/^\d{4}$/, 'Solo se permiten 4 dígitos numéricos')
        .refine(
            (value) => {
                const year = parseInt(value);
                return year >= 2000 && year <= 2100;
            },
            {message: 'El año no es válido.'}
        ),
    start_date: z.string().min(1, 'La fecha de inicio es obligatoria'),
    end_date: z.string().min(1, 'La fecha de fin es obligatoria'),
    is_active: z.boolean().optional().default(false),
})
.refine((data) => data.end_date > data.start_date, {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio.',
    path: ['end_date'], // Indica que el error se asocia con la propiedad 'end_date'
})

export type AcademicYearFormData = z.infer<typeof academicYearSchema>