import z from "zod";

// ─────────────────────────────────────────────────────
// Evento
// ─────────────────────────────────────────────────────

export const attendanceScheduleEventFormSchema = z.object({
  event_type: z.enum(["entry", "exit"]),

  expected_time: z.string().regex(/^\d{2}:\d{2}$/, "Ingresa una hora válida"),

  tolerance_minutes: z
    .number()
    .int()
    .min(0, "La tolerancia no puede ser negativa")
    .max(180, "La tolerancia máxima es 180 minutos"),

  window_before_minutes: z
    .number()
    .int()
    .min(0, "La ventana no puede ser negativa")
    .max(360, "La ventana máxima es 360 minutos"),

  window_after_minutes: z
    .number()
    .int()
    .min(0, "La ventana no puede ser negativa")
    .max(360, "La ventana máxima es 360 minutos"),
});

// ─────────────────────────────────────────────────────
// Día
// ─────────────────────────────────────────────────────

export const attendanceScheduleDayFormSchema = z.object({
  day_of_week: z.number().int().min(1).max(7),

  enabled: z.boolean(),

  events: z.array(attendanceScheduleEventFormSchema),
});

// ─────────────────────────────────────────────────────
// Formulario
// ─────────────────────────────────────────────────────

export const attendanceScheduleFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(150, "El nombre no puede superar los 150 caracteres"),

    scope: z.enum(["level", "classroom"]),

    grade_section_id: z.number().int().positive().nullable(),

    valid_from: z.string().min(1, "La fecha inicial es obligatoria"),

    valid_until: z.string().min(1, "La fecha final es obligatoria"),

    is_active: z.boolean(),

    days: z.array(attendanceScheduleDayFormSchema).length(7),
  })
  .superRefine((data, ctx) => {
    // ─────────────────────────────────────────────
    // Aula obligatoria cuando scope = classroom
    // ─────────────────────────────────────────────

    if (data.scope === "classroom" && !data.grade_section_id) {
      ctx.addIssue({
        code: "custom",

        path: ["grade_section_id"],

        message: "Selecciona el aula a la que se aplicará el horario",
      });
    }

    // ─────────────────────────────────────────────
    // Vigencia
    // ─────────────────────────────────────────────

    if (
      data.valid_from &&
      data.valid_until &&
      data.valid_until < data.valid_from
    ) {
      ctx.addIssue({
        code: "custom",

        path: ["valid_until"],

        message: "La fecha final debe ser igual o posterior a la inicial",
      });
    }

    // ─────────────────────────────────────────────
    // Debe existir al menos un día habilitado
    // ─────────────────────────────────────────────

    const enabledDays = data.days.filter((day) => day.enabled);

    if (enabledDays.length === 0) {
      ctx.addIssue({
        code: "custom",

        path: ["days"],

        message: "Configura al menos un día de asistencia",
      });
    }

    // ─────────────────────────────────────────────
    // Validaciones por día
    // ─────────────────────────────────────────────

    data.days.forEach((day, dayIndex) => {
      if (!day.enabled) {
        return;
      }

      if (day.events.length < 2) {
        ctx.addIssue({
          code: "custom",

          path: ["days", dayIndex, "events"],

          message: "El día debe tener al menos una entrada y una salida",
        });

        return;
      }

      if (day.events.length % 2 !== 0) {
        ctx.addIssue({
          code: "custom",

          path: ["days", dayIndex, "events"],

          message: "Los eventos deben formar pares de entrada y salida",
        });
      }

      day.events.forEach((event, eventIndex) => {
        const expectedType = eventIndex % 2 === 0 ? "entry" : "exit";

        if (event.event_type !== expectedType) {
          ctx.addIssue({
            code: "custom",

            path: ["days", dayIndex, "events", eventIndex, "event_type"],

            message: "Los eventos deben alternarse entre entrada y salida",
          });
        }

        if (
          eventIndex > 0 &&
          event.expected_time <= day.events[eventIndex - 1].expected_time
        ) {
          ctx.addIssue({
            code: "custom",

            path: ["days", dayIndex, "events", eventIndex, "expected_time"],

            message: "La hora debe ser posterior al evento anterior",
          });
        }
      });
    });
  });

export type AttendanceScheduleFormValues = z.infer<
  typeof attendanceScheduleFormSchema
>;
