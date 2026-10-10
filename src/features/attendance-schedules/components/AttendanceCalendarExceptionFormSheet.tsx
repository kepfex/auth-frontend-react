import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarOff, Clock3, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useClassrooms } from "@/features/classrooms/hooks/useClassrooms";
import { useAppContextStore } from "@/store/app-context.store";
import { getApiErrorMessage } from "@/utils/api-error";
import { toast } from "sonner";
import {
  useCreateAttendanceCalendarException,
  useCreateScheduleOverrideException,
  useUpdateAttendanceCalendarException,
} from "../hooks/useAttendanceCalendarExceptions";

import type {
  AttendanceCalendarException,
  CreateAttendanceCalendarExceptionRequest,
  CreateScheduleOverrideExceptionRequest,
  UpdateAttendanceCalendarExceptionRequest,
} from "../types/attendance-schedule.types";
import {
  attendanceCalendarExceptionFormSchema,
  type AttendanceCalendarExceptionFormValues,
} from "../types/attendance-calendar-exception.schema";

// ─────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────

interface AttendanceCalendarExceptionFormSheetProps {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  exception: AttendanceCalendarException | null;
}

// ─────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────

const createPair = (entry = "08:00", exit = "13:00") => [
  {
    event_type: "entry" as const,

    expected_time: entry,

    tolerance_minutes: 10,

    window_before_minutes: 60,

    window_after_minutes: 60,
  },

  {
    event_type: "exit" as const,

    expected_time: exit,

    tolerance_minutes: 0,

    window_before_minutes: 60,

    window_after_minutes: 60,
  },
];

const addMinutesToTime = (time: string, minutes: number) => {
  const [hours, mins] = time.split(":").map(Number);

  const total = Math.min(
    hours * 60 + mins + minutes,

    23 * 60 + 59,
  );

  const h = Math.floor(total / 60);

  const m = total % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const buildDefaultValues = (
  exception: AttendanceCalendarException | null,

  academicYear: {
    name: string;
    start_date: string;
  },
): AttendanceCalendarExceptionFormValues => {
  if (exception) {
    return {
      type: exception.type,

      scope: exception.scope,

      grade_section_id: exception.grade_section_id,

      date: exception.date,

      name: exception.name,

      reason: exception.reason,

      is_active: exception.is_active,

      schedule_name: exception.override_schedule?.name ?? "",

      events:
        exception.override_schedule?.events
          ?.sort((a, b) => a.sequence - b.sequence)
          .map((event) => ({
            event_type: event.event_type,

            expected_time: event.expected_time,

            tolerance_minutes: event.tolerance_minutes,

            window_before_minutes: event.window_before_minutes,

            window_after_minutes: event.window_after_minutes,
          })) ?? createPair(),
    };
  }

  return {
    type: "non_working",

    scope: "level",

    grade_section_id: null,

    date: academicYear.start_date,

    name: "",

    reason: null,

    is_active: true,

    schedule_name: `Horario excepcional ${academicYear.name}`,

    events: createPair(),
  };
};

// ─────────────────────────────────────────────────────
// Content
// ─────────────────────────────────────────────────────

function FormContent({
  exception,
  onClose,
}: {
  exception: AttendanceCalendarException | null;

  onClose: () => void;
}) {
  const academicYear = useAppContextStore((state) => state.academicYear);

  const educationalLevel = useAppContextStore(
    (state) => state.educationalLevel,
  );

  const { data: classrooms = [] } = useClassrooms();

  if (!academicYear || !educationalLevel) {
    return null;
  }

  const form = useForm<AttendanceCalendarExceptionFormValues>({
    resolver: zodResolver(attendanceCalendarExceptionFormSchema),

    defaultValues: buildDefaultValues(exception, academicYear),
  });

  const type = useWatch({
    control: form.control,

    name: "type",
  });

  const scope = useWatch({
    control: form.control,

    name: "scope",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,

    name: "events",
  });

  const createException = useCreateAttendanceCalendarException();

  const createOverride = useCreateScheduleOverrideException();

  const updateException = useUpdateAttendanceCalendarException(
    exception?.id ?? 0,
  );

  const classroomOptions = classrooms.filter(
    (classroom) =>
      classroom.is_active &&
      classroom.grade.educational_level_id === educationalLevel.id,
  );

  const isPending =
    createException.isPending ||
    createOverride.isPending ||
    updateException.isPending;

  const handleTypeChange = (value: "non_working" | "schedule_override") => {
    form.setValue("type", value, {
      shouldDirty: true,

      shouldValidate: true,
    });

    /*
     * Override institucional no forma
     * parte del dominio actual.
     */
    if (
      value === "schedule_override" &&
      form.getValues("scope") === "institution"
    ) {
      form.setValue("scope", "level", {
        shouldDirty: true,
      });
    }
  };

  const handleScopeChange = (value: "institution" | "level" | "classroom") => {
    form.setValue("scope", value, {
      shouldDirty: true,

      shouldValidate: true,
    });

    if (value !== "classroom") {
      form.setValue("grade_section_id", null, {
        shouldValidate: true,
      });
    }
  };

  const addBlock = () => {
    const current = form.getValues("events");

    const lastTime = current.at(-1)?.expected_time ?? "12:00";

    append(
      createPair(
        addMinutesToTime(lastTime, 60),

        addMinutesToTime(lastTime, 180),
      ),
    );
  };

  const onSubmit = async (values: AttendanceCalendarExceptionFormValues) => {
    try {
      /*
        |--------------------------------------------------------------------------
        | Edición
        |--------------------------------------------------------------------------
        |
        | Backend permite editar solamente:
        |
        | name
        | reason
        | is_active
        |
        */

      if (exception) {
        const payload: UpdateAttendanceCalendarExceptionRequest = {};

        if (values.name !== exception.name) {
          payload.name = values.name;
        }

        if (values.reason !== exception.reason) {
          payload.reason = values.reason;
        }

        if (values.is_active !== exception.is_active) {
          payload.is_active = values.is_active;
        }

        if (Object.keys(payload).length === 0) {
          toast.info("No hay cambios por guardar");

          return;
        }

        await updateException.mutateAsync(payload);

        toast.success("Excepción actualizada correctamente");

        onClose();

        return;
      }

      /*
        |--------------------------------------------------------------------------
        | Día no lectivo
        |--------------------------------------------------------------------------
        */

      if (values.type === "non_working") {
        const payload: CreateAttendanceCalendarExceptionRequest = {
          academic_year_id: academicYear.id,

          educational_level_id:
            values.scope === "institution" ? null : educationalLevel.id,

          grade_section_id:
            values.scope === "classroom" ? values.grade_section_id : null,

          attendance_schedule_id: null,

          date: values.date,

          type: "non_working",

          name: values.name,

          reason: values.reason,

          is_active: values.is_active,
        };

        await createException.mutateAsync(payload);

        toast.success("Día no lectivo registrado correctamente");

        onClose();

        return;
      }

      /*
        |--------------------------------------------------------------------------
        | Horario excepcional
        |--------------------------------------------------------------------------
        */

      const payload: CreateScheduleOverrideExceptionRequest = {
        academic_year_id: academicYear.id,

        educational_level_id: educationalLevel.id,

        grade_section_id:
          values.scope === "classroom" ? values.grade_section_id : null,

        date: values.date,

        name: values.name,

        reason: values.reason,

        is_active: values.is_active,

        schedule: {
          name: values.schedule_name,

          events: values.events,
        },
      };

      await createOverride.mutateAsync(payload);

      toast.success("Horario excepcional creado correctamente");

      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo guardar la excepción"));
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4">
        <form
          id="attendance-calendar-exception-form"
          className="space-y-6 py-5"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {/* Tipo */}

          <Controller
            control={form.control}
            name="type"
            render={({ fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Tipo de excepción</FieldLabel>

                <Select
                  value={type}
                  disabled={Boolean(exception)}
                  onValueChange={(value: "non_working" | "schedule_override") =>
                    handleTypeChange(value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="non_working">Día no lectivo</SelectItem>

                    <SelectItem value="schedule_override">
                      Horario excepcional
                    </SelectItem>
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Un día no lectivo impide generar marcaciones. Un horario
                  excepcional reemplaza el horario regular solamente en la fecha
                  indicada.
                </FieldDescription>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Fecha */}

          <Controller
            control={form.control}
            name="date"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Fecha</FieldLabel>

                <Input
                  {...field}
                  type="date"
                  disabled={Boolean(exception)}
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Scope */}

          <Field>
            <FieldLabel>Aplicar a</FieldLabel>

            <Select
              value={scope}
              disabled={Boolean(exception)}
              onValueChange={(value: "institution" | "level" | "classroom") =>
                handleScopeChange(value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {type === "non_working" && (
                  <SelectItem value="institution">
                    Toda la institución
                  </SelectItem>
                )}

                <SelectItem value="level">{educationalLevel.name}</SelectItem>

                <SelectItem value="classroom">Un aula específica</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {/* Aula */}

          {scope === "classroom" && (
            <Controller
              control={form.control}
              name="grade_section_id"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Aula</FieldLabel>

                  <Select
                    value={field.value ? String(field.value) : ""}
                    disabled={Boolean(exception)}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un aula" />
                    </SelectTrigger>

                    <SelectContent>
                      {classroomOptions.map((classroom) => (
                        <SelectItem
                          key={classroom.id}
                          value={String(classroom.id)}
                        >
                          {classroom.grade.name} · {classroom.section.name} ·{" "}
                          {classroom.shift}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}

          {/* Nombre */}

          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Nombre</FieldLabel>

                <Input
                  {...field}
                  placeholder={
                    type === "non_working"
                      ? "Ej. Feriado nacional"
                      : "Ej. Salida anticipada 5° A"
                  }
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Motivo */}

          <Controller
            control={form.control}
            name="reason"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Motivo</FieldLabel>

                <Textarea
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="Descripción opcional"
                  rows={3}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Activo */}

          <Controller
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <Field orientation="horizontal" className="rounded-lg border p-4">
                <FieldContent>
                  <FieldLabel>Excepción activa</FieldLabel>

                  <FieldDescription>
                    Solo las excepciones activas afectan al motor de asistencia.
                  </FieldDescription>
                </FieldContent>

                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Field>
            )}
          />

          {/* Horario excepcional */}

          {type === "schedule_override" && !exception && (
            <div className="space-y-5 border-t pt-6">
              <div>
                <div className="flex items-center gap-2">
                  <Clock3 className="size-5" />

                  <h3 className="font-medium">Horario excepcional</h3>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  Este horario existirá únicamente durante la fecha
                  seleccionada.
                </p>
              </div>

              <Controller
                control={form.control}
                name="schedule_name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Nombre del horario</FieldLabel>

                    <Input {...field} placeholder="Ej. Horario especial 5° A" />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Bloques */}

              <div className="space-y-4">
                {Array.from({
                  length: Math.ceil(fields.length / 2),
                }).map((_, blockIndex) => {
                  const start = blockIndex * 2;

                  const pair = fields.slice(start, start + 2);

                  return (
                    <div
                      key={pair[0]?.id ?? blockIndex}
                      className="rounded-xl border p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">Bloque {blockIndex + 1}</p>

                          <p className="text-xs text-muted-foreground">
                            Entrada y salida.
                          </p>
                        </div>

                        {fields.length > 2 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => remove([start, start + 1])}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-4 xl:grid-cols-2">
                        {pair.map((item, pairIndex) => {
                          const index = start + pairIndex;

                          return (
                            <div
                              key={item.id}
                              className="rounded-lg border bg-muted/20 p-4"
                            >
                              <p className="mb-4 font-medium">
                                {item.event_type === "entry"
                                  ? "Entrada"
                                  : "Salida"}
                              </p>

                              <div className="grid gap-4 sm:grid-cols-2">
                                <Controller
                                  control={form.control}
                                  name={`events.${index}.expected_time`}
                                  render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                      <FieldLabel>Hora</FieldLabel>

                                      <Input {...field} type="time" />

                                      {fieldState.invalid && (
                                        <FieldError
                                          errors={[fieldState.error]}
                                        />
                                      )}
                                    </Field>
                                  )}
                                />

                                <Controller
                                  control={form.control}
                                  name={`events.${index}.tolerance_minutes`}
                                  render={({ field }) => (
                                    <Field>
                                      <FieldLabel>Tolerancia</FieldLabel>

                                      <Input
                                        type="number"
                                        min={0}
                                        max={180}
                                        value={field.value}
                                        onChange={(e) =>
                                          field.onChange(e.target.valueAsNumber)
                                        }
                                      />
                                    </Field>
                                  )}
                                />

                                <Controller
                                  control={form.control}
                                  name={`events.${index}.window_before_minutes`}
                                  render={({ field }) => (
                                    <Field>
                                      <FieldLabel>Ventana antes</FieldLabel>

                                      <Input
                                        type="number"
                                        min={0}
                                        max={360}
                                        value={field.value}
                                        onChange={(e) =>
                                          field.onChange(e.target.valueAsNumber)
                                        }
                                      />
                                    </Field>
                                  )}
                                />

                                <Controller
                                  control={form.control}
                                  name={`events.${index}.window_after_minutes`}
                                  render={({ field }) => (
                                    <Field>
                                      <FieldLabel>Ventana después</FieldLabel>

                                      <Input
                                        type="number"
                                        min={0}
                                        max={360}
                                        value={field.value}
                                        onChange={(e) =>
                                          field.onChange(e.target.valueAsNumber)
                                        }
                                      />
                                    </Field>
                                  )}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={addBlock}
              >
                <Plus className="size-4" />
                Agregar bloque
              </Button>
            </div>
          )}

          {/* Edición de override */}

          {exception?.type === "schedule_override" && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="font-medium">Horario excepcional</p>

              <p className="mt-1 text-sm text-muted-foreground">
                La estructura del horario no se modifica desde este formulario.
                Aquí solo se actualizan los datos administrativos de la
                excepción.
              </p>
            </div>
          )}
        </form>
      </div>

      <SheetFooter className="border-t">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={onClose}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          form="attendance-calendar-exception-form"
          disabled={isPending}
        >
          {isPending
            ? "Guardando..."
            : exception
              ? "Guardar cambios"
              : "Crear excepción"}
        </Button>
      </SheetFooter>
    </>
  );
}

// ─────────────────────────────────────────────────────
// Sheet
// ─────────────────────────────────────────────────────

export function AttendanceCalendarExceptionFormSheet({
  open,
  onOpenChange,
  exception,
}: AttendanceCalendarExceptionFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <SheetHeader className="border-b p-4">
          <div className="flex items-center gap-2">
            <CalendarOff className="size-5" />

            <SheetTitle>
              {exception ? "Editar excepción" : "Nueva excepción"}
            </SheetTitle>
          </div>

          <SheetDescription>
            Gestiona días no lectivos y horarios excepcionales.
          </SheetDescription>
        </SheetHeader>

        {open && (
          <FormContent
            key={exception?.id ?? "new-exception"}
            exception={exception}
            onClose={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
