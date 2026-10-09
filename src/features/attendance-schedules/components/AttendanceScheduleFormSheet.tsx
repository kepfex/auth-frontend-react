import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type UseFormReturn,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  CalendarDays,
  Clock3,
  Plus,
  School,
  Trash2,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Button,
} from "@/components/ui/button";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

import {
  Input,
} from "@/components/ui/input";

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

import {
  Switch,
} from "@/components/ui/switch";

import {
  useClassrooms,
} from "@/features/classrooms/hooks/useClassrooms";

import {
  useAppContextStore,
} from "@/store/app-context.store";

import {
  getApiErrorMessage,
} from "@/utils/api-error";

import {
  toast,
} from "sonner";

import {
  useCreateAttendanceSchedule,
  useUpdateAttendanceSchedule,
} from "../hooks/useAttendanceSchedules";

import {
  useWeekdays,
} from "../hooks/useAttendanceCatalogs";

import {
  attendanceScheduleFormSchema,
  type AttendanceScheduleFormValues,
} from "../schemas/attendance-schedule.schema";

import type {
  AttendanceSchedule,
  AttendanceScheduleEventRequest,
  CreateAttendanceScheduleRequest,
  UpdateAttendanceScheduleRequest,
} from "../types/attendance-schedule.types";

// ─────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────

interface AttendanceScheduleFormSheetProps {
  open: boolean;

  onOpenChange: (
    open: boolean,
  ) => void;

  schedule:
    | AttendanceSchedule
    | null;
}

// ─────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────

const DAY_NUMBERS = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
] as const;

const createDefaultPair =
  (
    entryTime = "08:00",
    exitTime = "15:00",
  ) => [
    {
      event_type:
        "entry" as const,

      expected_time:
        entryTime,

      tolerance_minutes:
        10,

      window_before_minutes:
        60,

      window_after_minutes:
        60,
    },

    {
      event_type:
        "exit" as const,

      expected_time:
        exitTime,

      tolerance_minutes:
        0,

      window_before_minutes:
        60,

      window_after_minutes:
        60,
    },
  ];

const addMinutesToTime = (
  time: string,
  minutes: number,
): string => {
  const [
    hours,
    mins,
  ] = time
    .split(":")
    .map(Number);

  const total =
    hours * 60 +
    mins +
    minutes;

  const normalized =
    Math.min(
      total,
      23 * 60 + 59,
    );

  const nextHours =
    Math.floor(
      normalized / 60,
    );

  const nextMinutes =
    normalized % 60;

  return `${String(
    nextHours,
  ).padStart(
    2,
    "0",
  )}:${String(
    nextMinutes,
  ).padStart(
    2,
    "0",
  )}`;
};

const buildDefaultValues = (
  schedule:
    | AttendanceSchedule
    | null,

  academicYear: {
    name: string;
    start_date: string;
    end_date: string;
  },

  educationalLevel: {
    name: string;
  },
): AttendanceScheduleFormValues => {
  const groupedEvents =
    new Map<
      number,
      AttendanceSchedule["events"]
    >();

  if (schedule) {
    schedule.events.forEach(
      (event) => {
        const current =
          groupedEvents.get(
            event.day_of_week,
          ) ?? [];

        current.push(
          event,
        );

        groupedEvents.set(
          event.day_of_week,
          current,
        );
      },
    );
  }

  const days =
    DAY_NUMBERS.map(
      (
        day,
      ) => {
        const existing =
          groupedEvents
            .get(day)
            ?.sort(
              (
                a,
                b,
              ) =>
                a.sequence -
                b.sequence,
            );

        if (
          existing &&
          existing.length >
            0
        ) {
          return {
            day_of_week:
              day,

            enabled:
              true,

            events:
              existing.map(
                (
                  event,
                ) => ({
                  event_type:
                    event.event_type,

                  expected_time:
                    event.expected_time,

                  tolerance_minutes:
                    event.tolerance_minutes,

                  window_before_minutes:
                    event.window_before_minutes,

                  window_after_minutes:
                    event.window_after_minutes,
                }),
              ),
          };
        }

        /*
         * Para un nuevo horario dejamos
         * lunes-viernes activos por comodidad.
         *
         * Sábado y domingo quedan disponibles
         * pero desactivados.
         */
        return {
          day_of_week:
            day,

          enabled:
            schedule
              ? false
              : day <= 5,

          events:
            createDefaultPair(),
        };
      },
    );

  return {
    name:
      schedule?.name ??
      `Horario regular ${educationalLevel.name} ${academicYear.name}`,

    scope:
      schedule
        ?.grade_section_id
        ? "classroom"
        : "level",

    grade_section_id:
      schedule
        ?.grade_section_id ??
      null,

    valid_from:
      schedule
        ?.valid_from ??
      academicYear.start_date,

    valid_until:
      schedule
        ?.valid_until ??
      academicYear.end_date,

    is_active:
      schedule
        ?.is_active ??
      true,

    days,
  };
};

const flattenEvents = (
  values: AttendanceScheduleFormValues,
): AttendanceScheduleEventRequest[] => {
  return values.days
    .filter(
      (day) =>
        day.enabled,
    )
    .flatMap(
      (day) =>
        day.events.map(
          (
            event,
            index,
          ) => ({
            day_of_week:
              day.day_of_week,

            sequence:
              index + 1,

            event_type:
              event.event_type,

            expected_time:
              event.expected_time,

            tolerance_minutes:
              event.tolerance_minutes,

            window_before_minutes:
              event.window_before_minutes,

            window_after_minutes:
              event.window_after_minutes,
          }),
        ),
    );
};

const normalizeScheduleEvents = (
  schedule: AttendanceSchedule,
): AttendanceScheduleEventRequest[] => {
  return [
    ...schedule.events,
  ]
    .sort(
      (
        a,
        b,
      ) =>
        a.day_of_week -
          b.day_of_week ||
        a.sequence -
          b.sequence,
    )
    .map(
      (
        event,
      ) => ({
        day_of_week:
          event.day_of_week,

        sequence:
          event.sequence,

        event_type:
          event.event_type,

        expected_time:
          event.expected_time,

        tolerance_minutes:
          event.tolerance_minutes,

        window_before_minutes:
          event.window_before_minutes,

        window_after_minutes:
          event.window_after_minutes,
      }),
    );
};

// ─────────────────────────────────────────────────────
// Editor de un día
// ─────────────────────────────────────────────────────

interface DayScheduleEditorProps {
  form: UseFormReturn<
    AttendanceScheduleFormValues
  >;

  dayIndex: number;

  label: string;
}

function DayScheduleEditor({
  form,
  dayIndex,
  label,
}: DayScheduleEditorProps) {
  const enabled =
    useWatch({
      control:
        form.control,

      name:
        `days.${dayIndex}.enabled`,
    });

  const {
    fields,
    append,
    remove,
  } =
    useFieldArray({
      control:
        form.control,

      name:
        `days.${dayIndex}.events`,
    });

  const handleEnabledChange =
    (
      checked: boolean,
    ) => {
      form.setValue(
        `days.${dayIndex}.enabled`,
        checked,
        {
          shouldDirty:
            true,

          shouldValidate:
            true,
        },
      );

      if (
        checked &&
        form.getValues(
          `days.${dayIndex}.events`,
        ).length === 0
      ) {
        form.setValue(
          `days.${dayIndex}.events`,
          createDefaultPair(),
          {
            shouldDirty:
              true,

            shouldValidate:
              true,
          },
        );
      }
    };

  const handleAddBlock =
    () => {
      const events =
        form.getValues(
          `days.${dayIndex}.events`,
        );

      const lastTime =
        events.at(-1)
          ?.expected_time ??
        "12:00";

      const entryTime =
        addMinutesToTime(
          lastTime,
          60,
        );

      const exitTime =
        addMinutesToTime(
          lastTime,
          180,
        );

      append(
        createDefaultPair(
          entryTime,
          exitTime,
        ),
      );
    };

  return (
    <AccordionItem
      value={`day-${dayIndex}`}
      className="px-4"
    >
      <AccordionTrigger className="hover:no-underline">
        <div className="flex flex-1 items-center gap-3 pr-3">
          <CalendarDays className="size-4 text-muted-foreground" />

          <span>
            {label}
          </span>

          <Badge
            variant={
              enabled
                ? "secondary"
                : "outline"
            }
          >
            {enabled
              ? "Configurado"
              : "Sin eventos"}
          </Badge>
        </div>
      </AccordionTrigger>

      <AccordionContent>
        <div className="space-y-5 pt-2">
          {/* Estado del día */}

          <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 p-4">
            <div>
              <p className="font-medium">
                Registrar asistencia este día
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Desactívalo si este horario no
                tiene eventos programados ese día.
              </p>
            </div>

            <Switch
              checked={
                enabled
              }
              onCheckedChange={
                handleEnabledChange
              }
            />
          </div>

          {enabled && (
            <>
              {/* Bloques */}

              <div className="space-y-4">
                {Array.from({
                  length:
                    Math.ceil(
                      fields.length /
                        2,
                    ),
                }).map(
                  (
                    _,
                    blockIndex,
                  ) => {
                    const startIndex =
                      blockIndex *
                      2;

                    const pair =
                      fields.slice(
                        startIndex,
                        startIndex +
                          2,
                      );

                    return (
                      <div
                        key={
                          pair[0]
                            ?.id ??
                          blockIndex
                        }
                        className="rounded-xl border bg-card p-4"
                      >
                        <div className="mb-4 flex items-center justify-between gap-4">
                          <div>
                            <p className="font-medium">
                              Bloque{" "}
                              {blockIndex +
                                1}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              Entrada y salida esperadas.
                            </p>
                          </div>

                          {fields.length >
                            2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                remove([
                                  startIndex,
                                  startIndex +
                                    1,
                                ])
                              }
                              title="Eliminar bloque"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid gap-4 xl:grid-cols-2">
                          {pair.map(
                            (
                              fieldArrayItem,
                              pairIndex,
                            ) => {
                              const eventIndex =
                                startIndex +
                                pairIndex;

                              const eventType =
                                fieldArrayItem
                                  .event_type;

                              return (
                                <div
                                  key={
                                    fieldArrayItem.id
                                  }
                                  className="rounded-lg border bg-background p-4"
                                >
                                  <div className="mb-4 flex items-center gap-2">
                                    <Clock3 className="size-4 text-muted-foreground" />

                                    <Badge
                                      variant={
                                        eventType ===
                                        "entry"
                                          ? "default"
                                          : "outline"
                                      }
                                    >
                                      {eventType ===
                                      "entry"
                                        ? "Entrada"
                                        : "Salida"}
                                    </Badge>
                                  </div>

                                  <div className="grid gap-4 sm:grid-cols-2">
                                    {/* Hora */}

                                    <Controller
                                      control={
                                        form.control
                                      }
                                      name={`days.${dayIndex}.events.${eventIndex}.expected_time`}
                                      render={({
                                        field,
                                        fieldState,
                                      }) => (
                                        <Field
                                          data-invalid={
                                            fieldState.invalid
                                          }
                                        >
                                          <FieldLabel>
                                            Hora esperada
                                          </FieldLabel>

                                          <Input
                                            {...field}
                                            type="time"
                                            aria-invalid={
                                              fieldState.invalid
                                            }
                                          />

                                          {fieldState.invalid && (
                                            <FieldError
                                              errors={[
                                                fieldState.error,
                                              ]}
                                            />
                                          )}
                                        </Field>
                                      )}
                                    />

                                    {/* Tolerancia */}

                                    <Controller
                                      control={
                                        form.control
                                      }
                                      name={`days.${dayIndex}.events.${eventIndex}.tolerance_minutes`}
                                      render={({
                                        field,
                                        fieldState,
                                      }) => (
                                        <Field
                                          data-invalid={
                                            fieldState.invalid
                                          }
                                        >
                                          <FieldLabel>
                                            Tolerancia
                                          </FieldLabel>

                                          <Input
                                            value={
                                              field.value
                                            }
                                            type="number"
                                            min={
                                              0
                                            }
                                            max={
                                              180
                                            }
                                            onChange={(
                                              event,
                                            ) =>
                                              field.onChange(
                                                event
                                                  .target
                                                  .valueAsNumber,
                                              )
                                            }
                                            aria-invalid={
                                              fieldState.invalid
                                            }
                                          />

                                          <FieldDescription>
                                            Minutos.
                                          </FieldDescription>

                                          {fieldState.invalid && (
                                            <FieldError
                                              errors={[
                                                fieldState.error,
                                              ]}
                                            />
                                          )}
                                        </Field>
                                      )}
                                    />

                                    {/* Ventana anterior */}

                                    <Controller
                                      control={
                                        form.control
                                      }
                                      name={`days.${dayIndex}.events.${eventIndex}.window_before_minutes`}
                                      render={({
                                        field,
                                        fieldState,
                                      }) => (
                                        <Field
                                          data-invalid={
                                            fieldState.invalid
                                          }
                                        >
                                          <FieldLabel>
                                            Ventana antes
                                          </FieldLabel>

                                          <Input
                                            value={
                                              field.value
                                            }
                                            type="number"
                                            min={
                                              0
                                            }
                                            max={
                                              360
                                            }
                                            onChange={(
                                              event,
                                            ) =>
                                              field.onChange(
                                                event
                                                  .target
                                                  .valueAsNumber,
                                              )
                                            }
                                            aria-invalid={
                                              fieldState.invalid
                                            }
                                          />

                                          <FieldDescription>
                                            Minutos antes.
                                          </FieldDescription>

                                          {fieldState.invalid && (
                                            <FieldError
                                              errors={[
                                                fieldState.error,
                                              ]}
                                            />
                                          )}
                                        </Field>
                                      )}
                                    />

                                    {/* Ventana posterior */}

                                    <Controller
                                      control={
                                        form.control
                                      }
                                      name={`days.${dayIndex}.events.${eventIndex}.window_after_minutes`}
                                      render={({
                                        field,
                                        fieldState,
                                      }) => (
                                        <Field
                                          data-invalid={
                                            fieldState.invalid
                                          }
                                        >
                                          <FieldLabel>
                                            Ventana después
                                          </FieldLabel>

                                          <Input
                                            value={
                                              field.value
                                            }
                                            type="number"
                                            min={
                                              0
                                            }
                                            max={
                                              360
                                            }
                                            onChange={(
                                              event,
                                            ) =>
                                              field.onChange(
                                                event
                                                  .target
                                                  .valueAsNumber,
                                              )
                                            }
                                            aria-invalid={
                                              fieldState.invalid
                                            }
                                          />

                                          <FieldDescription>
                                            Minutos después.
                                          </FieldDescription>

                                          {fieldState.invalid && (
                                            <FieldError
                                              errors={[
                                                fieldState.error,
                                              ]}
                                            />
                                          )}
                                        </Field>
                                      )}
                                    />
                                  </div>
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={
                  handleAddBlock
                }
              >
                <Plus className="size-4" />
                Agregar bloque de entrada y salida
              </Button>
            </>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// ─────────────────────────────────────────────────────
// Contenido interno
// ─────────────────────────────────────────────────────

interface AttendanceScheduleFormContentProps {
  schedule:
    | AttendanceSchedule
    | null;

  onClose: () => void;
}

function AttendanceScheduleFormContent({
  schedule,
  onClose,
}: AttendanceScheduleFormContentProps) {
  const academicYear =
    useAppContextStore(
      (state) =>
        state.academicYear,
    );

  const educationalLevel =
    useAppContextStore(
      (state) =>
        state.educationalLevel,
    );

  const {
    data: classrooms = [],
  } =
    useClassrooms();

  const {
    data: weekdays = [],
  } =
    useWeekdays();

  const createSchedule =
    useCreateAttendanceSchedule();

  const updateSchedule =
    useUpdateAttendanceSchedule(
      schedule?.id ??
        0,
    );

  if (
    !academicYear ||
    !educationalLevel
  ) {
    return null;
  }

  const form =
    useForm<AttendanceScheduleFormValues>({
      resolver:
        zodResolver(
          attendanceScheduleFormSchema,
        ),

      defaultValues:
        buildDefaultValues(
          schedule,
          academicYear,
          educationalLevel,
        ),
    });

  const scope =
    useWatch({
      control:
        form.control,

      name:
        "scope",
    });

  const classroomOptions =
    classrooms.filter(
      (classroom) =>
        classroom.is_active &&
        classroom.grade
          .educational_level_id ===
          educationalLevel.id,
    );

  /*
   * Si estamos editando un horario de un aula
   * que posteriormente quedó inactiva,
   * mantenemos esa aula visible.
   */
  if (
    schedule?.grade_section &&
    !classroomOptions.some(
      (classroom) =>
        classroom.id ===
        schedule.grade_section
          ?.id,
    )
  ) {
    classroomOptions.unshift(
      schedule.grade_section,
    );
  }

  const weekdayLabel =
    (
      day: number,
    ) =>
      weekdays.find(
        (weekday) =>
          weekday.value ===
          day,
      )?.label ??
      `Día ${day}`;

  const onSubmit =
    async (
      values: AttendanceScheduleFormValues,
    ) => {
      const events =
        flattenEvents(
          values,
        );

      try {
        if (schedule) {
          const payload: UpdateAttendanceScheduleRequest =
            {};

          if (
            values.name !==
            schedule.name
          ) {
            payload.name =
              values.name;
          }

          if (
            values.valid_from !==
            schedule.valid_from
          ) {
            payload.valid_from =
              values.valid_from;
          }

          if (
            values.valid_until !==
            schedule.valid_until
          ) {
            payload.valid_until =
              values.valid_until;
          }

          if (
            values.is_active !==
            schedule.is_active
          ) {
            payload.is_active =
              values.is_active;
          }

          const currentEvents =
            normalizeScheduleEvents(
              schedule,
            );

          if (
            JSON.stringify(
              events,
            ) !==
            JSON.stringify(
              currentEvents,
            )
          ) {
            payload.events =
              events;
          }

          if (
            Object.keys(
              payload,
            ).length === 0
          ) {
            toast.info(
              "No hay cambios por guardar",
            );

            return;
          }

          await updateSchedule.mutateAsync(
            payload,
          );

          toast.success(
            "Horario actualizado correctamente",
          );
        } else {
          const payload: CreateAttendanceScheduleRequest =
            {
              academic_year_id:
                academicYear.id,

              educational_level_id:
                educationalLevel.id,

              grade_section_id:
                values.scope ===
                "classroom"
                  ? values.grade_section_id
                  : null,

              name:
                values.name,

              schedule_type:
                "regular",

              valid_from:
                values.valid_from,

              valid_until:
                values.valid_until,

              is_active:
                values.is_active,

              events,
            };

          await createSchedule.mutateAsync(
            payload,
          );

          toast.success(
            "Horario creado correctamente",
          );
        }

        onClose();
      } catch (error) {
        toast.error(
          getApiErrorMessage(
            error,
            schedule
              ? "No se pudo actualizar el horario"
              : "No se pudo crear el horario",
          ),
        );
      }
    };

  const isPending =
    createSchedule.isPending ||
    updateSchedule.isPending;

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4">
        {/* Contexto */}

        <div className="mb-6 rounded-xl border bg-muted/40 p-4">
          <div className="flex items-center gap-2 font-medium">
            <School className="size-4" />
            Contexto académico
          </div>

          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">
                Año
              </span>

              <p className="font-medium">
                {academicYear.name}
              </p>
            </div>

            <div>
              <span className="text-muted-foreground">
                Nivel
              </span>

              <p className="font-medium">
                {educationalLevel.name}
              </p>
            </div>
          </div>
        </div>

        <form
          id="attendance-schedule-form"
          onSubmit={
            form.handleSubmit(
              onSubmit,
            )
          }
          className="space-y-6 pb-6"
        >
          {/* Nombre */}

          <Controller
            control={
              form.control
            }
            name="name"
            render={({
              field,
              fieldState,
            }) => (
              <Field
                data-invalid={
                  fieldState.invalid
                }
              >
                <FieldLabel>
                  Nombre del horario
                </FieldLabel>

                <Input
                  {...field}
                  placeholder="Ej. Horario regular Secundaria 2026"
                  aria-invalid={
                    fieldState.invalid
                  }
                />

                {fieldState.invalid && (
                  <FieldError
                    errors={[
                      fieldState.error,
                    ]}
                  />
                )}
              </Field>
            )}
          />

          {/* Scope */}

          <Controller
            control={
              form.control
            }
            name="scope"
            render={({
              field,
              fieldState,
            }) => (
              <Field
                data-invalid={
                  fieldState.invalid
                }
              >
                <FieldLabel>
                  Aplicar horario a
                </FieldLabel>

                <Select
                  value={
                    field.value
                  }
                  disabled={
                    Boolean(
                      schedule,
                    )
                  }
                  onValueChange={(
                    value,
                  ) => {
                    field.onChange(
                      value,
                    );

                    if (
                      value ===
                      "level"
                    ) {
                      form.setValue(
                        "grade_section_id",
                        null,
                        {
                          shouldValidate:
                            true,
                        },
                      );
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="level">
                      Todo el nivel educativo
                    </SelectItem>

                    <SelectItem value="classroom">
                      Un aula específica
                    </SelectItem>
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Un horario de aula tiene prioridad sobre
                  el horario general del nivel.
                </FieldDescription>

                {fieldState.invalid && (
                  <FieldError
                    errors={[
                      fieldState.error,
                    ]}
                  />
                )}
              </Field>
            )}
          />

          {/* Aula */}

          {scope ===
            "classroom" && (
            <Controller
              control={
                form.control
              }
              name="grade_section_id"
              render={({
                field,
                fieldState,
              }) => (
                <Field
                  data-invalid={
                    fieldState.invalid
                  }
                >
                  <FieldLabel>
                    Aula
                  </FieldLabel>

                  <Select
                    value={
                      field.value
                        ? String(
                            field.value,
                          )
                        : ""
                    }
                    disabled={
                      Boolean(
                        schedule,
                      )
                    }
                    onValueChange={(
                      value,
                    ) =>
                      field.onChange(
                        Number(
                          value,
                        ),
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un aula" />
                    </SelectTrigger>

                    <SelectContent>
                      {classroomOptions.map(
                        (
                          classroom,
                        ) => (
                          <SelectItem
                            key={
                              classroom.id
                            }
                            value={String(
                              classroom.id,
                            )}
                          >
                            {
                              classroom
                                .grade
                                .name
                            }{" "}
                            ·{" "}
                            {
                              classroom
                                .section
                                .name
                            }{" "}
                            ·{" "}
                            {
                              classroom.shift
                            }
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>

                  {classroomOptions.length ===
                    0 && (
                    <FieldDescription>
                      No hay aulas activas para este nivel
                      y año académico.
                    </FieldDescription>
                  )}

                  {fieldState.invalid && (
                    <FieldError
                      errors={[
                        fieldState.error,
                      ]}
                    />
                  )}
                </Field>
              )}
            />
          )}

          {/* Vigencia */}

          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={
                form.control
              }
              name="valid_from"
              render={({
                field,
                fieldState,
              }) => (
                <Field
                  data-invalid={
                    fieldState.invalid
                  }
                >
                  <FieldLabel>
                    Vigente desde
                  </FieldLabel>

                  <Input
                    {...field}
                    type="date"
                    aria-invalid={
                      fieldState.invalid
                    }
                  />

                  {fieldState.invalid && (
                    <FieldError
                      errors={[
                        fieldState.error,
                      ]}
                    />
                  )}
                </Field>
              )}
            />

            <Controller
              control={
                form.control
              }
              name="valid_until"
              render={({
                field,
                fieldState,
              }) => (
                <Field
                  data-invalid={
                    fieldState.invalid
                  }
                >
                  <FieldLabel>
                    Vigente hasta
                  </FieldLabel>

                  <Input
                    {...field}
                    type="date"
                    aria-invalid={
                      fieldState.invalid
                    }
                  />

                  {fieldState.invalid && (
                    <FieldError
                      errors={[
                        fieldState.error,
                      ]}
                    />
                  )}
                </Field>
              )}
            />
          </div>

          {/* Activo */}

          <Controller
            control={
              form.control
            }
            name="is_active"
            render={({
              field,
              fieldState,
            }) => (
              <Field
                orientation="horizontal"
                data-invalid={
                  fieldState.invalid
                }
                className="rounded-lg border p-4"
              >
                <FieldContent>
                  <FieldLabel>
                    Horario activo
                  </FieldLabel>

                  <FieldDescription>
                    Solo los horarios activos pueden ser
                    utilizados por el motor de asistencia.
                  </FieldDescription>
                </FieldContent>

                <Switch
                  checked={
                    field.value
                  }
                  onCheckedChange={
                    field.onChange
                  }
                />
              </Field>
            )}
          />

          {/* Editor semanal */}

          <div>
            <div className="mb-4">
              <h3 className="font-medium">
                Programación semanal
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Define las entradas y salidas esperadas
                para cada día.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border">
              <Accordion
                type="multiple"
                defaultValue={[
                  "day-0",
                ]}
              >
                {DAY_NUMBERS.map(
                  (
                    day,
                    index,
                  ) => (
                    <DayScheduleEditor
                      key={
                        day
                      }
                      form={
                        form
                      }
                      dayIndex={
                        index
                      }
                      label={
                        weekdayLabel(
                          day,
                        )
                      }
                    />
                  ),
                )}
              </Accordion>
            </div>

            {form.formState
              .errors.days
              ?.message && (
              <p className="mt-2 text-sm text-destructive">
                {
                  form
                    .formState
                    .errors
                    .days
                    .message
                }
              </p>
            )}
          </div>
        </form>
      </div>

      <SheetFooter className="border-t bg-background">
        <Button
          type="button"
          variant="outline"
          onClick={
            onClose
          }
          disabled={
            isPending
          }
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          form="attendance-schedule-form"
          disabled={
            isPending
          }
        >
          {isPending
            ? "Guardando..."
            : schedule
              ? "Guardar cambios"
              : "Crear horario"}
        </Button>
      </SheetFooter>
    </>
  );
}

// ─────────────────────────────────────────────────────
// Sheet público
// ─────────────────────────────────────────────────────

export function AttendanceScheduleFormSheet({
  open,
  onOpenChange,
  schedule,
}: AttendanceScheduleFormSheetProps) {
  return (
    <Sheet
      open={
        open
      }
      onOpenChange={
        onOpenChange
      }
    >
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <SheetHeader className="border-b p-4">
          <SheetTitle>
            {schedule
              ? "Editar horario"
              : "Nuevo horario"}
          </SheetTitle>

          <SheetDescription>
            Configura las jornadas y ventanas de
            marcación del horario regular.
          </SheetDescription>
        </SheetHeader>

        {/*
         * Importante:
         *
         * no sincronizamos RHF con useEffect.
         *
         * Al cerrar desaparece el contenido,
         * y al volver a abrir se monta con
         * nuevos defaultValues.
         */}
        {open && (
          <AttendanceScheduleFormContent
            key={
              schedule?.id ??
              "new-schedule"
            }
            schedule={
              schedule
            }
            onClose={() =>
              onOpenChange(
                false,
              )
            }
          />
        )}
      </SheetContent>
    </Sheet>
  );
}