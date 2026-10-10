import z from "zod";

const overrideEventSchema = z.object({
  event_type: z.enum(["entry", "exit"]),

  expected_time: z.string().regex(/^\d{2}:\d{2}$/, "Ingresa una hora válida"),

  tolerance_minutes: z.number().int().min(0).max(180),

  window_before_minutes: z.number().int().min(0).max(360),

  window_after_minutes: z.number().int().min(0).max(360),
});

export const attendanceCalendarExceptionFormSchema = z
  .object({
    type: z.enum(["non_working", "schedule_override"]),

    scope: z.enum(["institution", "level", "classroom"]),

    grade_section_id: z.number().int().positive().nullable(),

    date: z.string().min(1, "La fecha es obligatoria"),

    name: z
      .string()
      .trim()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(150, "El nombre no puede superar los 150 caracteres"),

    reason: z
      .string()
      .trim()
      .max(2000, "El motivo no puede superar los 2000 caracteres")
      .nullable(),

    is_active: z.boolean(),

    schedule_name: z.string().trim().max(150),

    events: z.array(overrideEventSchema),
  })
  .superRefine((data, ctx) => {
    /*
     * Aula
     */
    if (data.scope === "classroom" && !data.grade_section_id) {
      ctx.addIssue({
        code: "custom",

        path: ["grade_section_id"],

        message: "Selecciona el aula correspondiente",
      });
    }

    /*
     * Override institucional no permitido
     * en el dominio actual.
     */
    if (data.type === "schedule_override" && data.scope === "institution") {
      ctx.addIssue({
        code: "custom",

        path: ["scope"],

        message: "Un horario excepcional debe aplicarse a un nivel o aula",
      });
    }

    if (data.type !== "schedule_override") {
      return;
    }

    if (data.schedule_name.length < 3) {
      ctx.addIssue({
        code: "custom",

        path: ["schedule_name"],

        message: "Indica un nombre para el horario excepcional",
      });
    }

    if (data.events.length < 2 || data.events.length % 2 !== 0) {
      ctx.addIssue({
        code: "custom",

        path: ["events"],

        message: "El horario debe contener pares de entrada y salida",
      });
    }

    data.events.forEach((event, index) => {
      const expectedType = index % 2 === 0 ? "entry" : "exit";

      if (event.event_type !== expectedType) {
        ctx.addIssue({
          code: "custom",

          path: ["events", index, "event_type"],

          message: "Los eventos deben alternarse entre entrada y salida",
        });
      }

      if (
        index > 0 &&
        event.expected_time <= data.events[index - 1].expected_time
      ) {
        ctx.addIssue({
          code: "custom",

          path: ["events", index, "expected_time"],

          message: "La hora debe ser posterior al evento anterior",
        });
      }
    });
  });

export type AttendanceCalendarExceptionFormValues = z.infer<
  typeof attendanceCalendarExceptionFormSchema
>;
