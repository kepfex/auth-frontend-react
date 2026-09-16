import z from "zod";

export const levelSchema = z.object({
    code: z.string()
        .min(1, 'Código requerido')
        .max(10, 'Máx. 10 caracteres'),
    name: z.string()
        .min(2, 'Nombre requerido')
        .max(50, 'Máx. 50 caracteres'),
    order: z.number({ error: 'El orden es requerido', })
        .int('El orden debe ser un número entero')
        .min(1, 'El orden debe ser mayor a 0'),
})

export const gradeSchema = z.object({
    educational_level_id: z.number()
        .min(1, 'Selecciona un nivel'),
    code: z.string()
        .min(1, 'Código requerido')
        .max(20, 'Máx. 20 caracteres'),
    name: z.string()
        .min(2, 'Nombre requerido')
        .max(50, 'Máx. 50 caracteres'),
    order: z.number({
        error: (issue) =>
            issue.input === undefined || Number.isNaN(issue.input)
                ? 'El orden es requerido'
                : 'El orden debe ser un número',
    })
        .int('El orden debe ser un número entero')
        .min(1, 'El orden debe ser mayor a 0'),
})

export const sectionSchema = z.object({
    name: z.string().min(1, 'Nombre requerido').max(50, 'Máx. 50 caracteres'),
})

export type LevelFormData = z.infer<typeof levelSchema>
export type GradeFormData = z.infer<typeof gradeSchema>
export type SectionFormData = z.infer<typeof sectionSchema>