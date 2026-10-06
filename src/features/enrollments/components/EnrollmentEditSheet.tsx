import {
  useState,
} from "react";

import axios from "axios";

import {
  Controller,
  useForm,
  useWatch,
  type FieldPath,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  AlertCircle,
  Loader2,
  School,
  Users,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import {
  Separator,
} from "@/components/ui/separator";

import {
  enrollmentEditSchema,
  type EnrollmentEditFormValues,
} from "../schemas/enrollment-edit.schema";

import {
  useClassroomEnrollmentCount,
  useUpdateEnrollment,
} from "../hooks/useEnrollments";

import {
  useEnrollmentStatuses,
} from "../hooks/useEnrollmentStatuses";

import type {
  Enrollment,
} from "../types/enrollment.types";

import {
  useGrades,
} from "@/features/academic-structure/hooks/useAcademicStructure";

import {
  useClassrooms,
} from "@/features/classrooms/hooks/useClassrooms";

import type {
  ErrorResponse,
} from "@/shared/types/shared.types";

import {
  getApiError,
} from "@/shared/utils/api-error";


// ─────────────────────────────────────────────────────
// Props del Sheet
// ─────────────────────────────────────────────────────

interface EnrollmentEditSheetProps {
  enrollment: Enrollment | null;
  open: boolean;

  onOpenChange: (
    open: boolean,
  ) => void;
}


// ─────────────────────────────────────────────────────
// Props del formulario interno
// ─────────────────────────────────────────────────────

interface EnrollmentEditFormProps {
  enrollment: Enrollment;

  onClose: () => void;
}


// ─────────────────────────────────────────────────────
// Laravel → React Hook Form
// ─────────────────────────────────────────────────────

const SERVER_FIELD_MAP: Partial<
  Record<
    string,
    FieldPath<EnrollmentEditFormValues>
  >
> = {
  grade_section_id:
    "grade_section_id",

  enrollment_date:
    "enrollment_date",

  status:
    "status",

  observations:
    "observations",
};


// ─────────────────────────────────────────────────────
// Formulario interno
// ─────────────────────────────────────────────────────

function EnrollmentEditForm({
  enrollment,
  onClose,
}: EnrollmentEditFormProps) {
  const updateEnrollment =
    useUpdateEnrollment(
      enrollment.id,
    );

  const {
    data: statuses = [],
  } = useEnrollmentStatuses();

  const {
    data: allGrades = [],
  } = useGrades();

  const {
    data: allClassrooms = [],
    isLoading:
      isLoadingClassrooms,
  } = useClassrooms();

  // ───────────────────────────────────────────────────
  // Grado actual
  // ───────────────────────────────────────────────────

  const [
    gradeId,
    setGradeId,
  ] = useState<number>(
    enrollment.grade_section.grade.id,
  );

  // ───────────────────────────────────────────────────
  // Formulario
  // ───────────────────────────────────────────────────

  const form =
    useForm<EnrollmentEditFormValues>({
      resolver:
        zodResolver(
          enrollmentEditSchema,
        ),

      defaultValues: {
        grade_section_id:
          enrollment.grade_section_id,

        enrollment_date:
          enrollment.enrollment_date,

        status:
          enrollment.status,

        observations:
          enrollment.observations ?? "",
      },
    });

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    clearErrors,

    formState: {
      errors,
    },
  } = form;

  const gradeSectionId =
    useWatch({
      control,
      name: "grade_section_id",
    });

  // ───────────────────────────────────────────────────
  // Nivel educativo de la matrícula
  // ───────────────────────────────────────────────────

  const educationalLevelId =
    enrollment.grade_section
      .grade
      .educational_level
      ?.id;

  // ───────────────────────────────────────────────────
  // Grados disponibles
  // ───────────────────────────────────────────────────

  const grades =
    educationalLevelId
      ? allGrades.filter(
          (grade) =>
            grade.educational_level_id ===
            educationalLevelId,
        )
      : [];

  // ───────────────────────────────────────────────────
  // Aulas del grado seleccionado
  // ───────────────────────────────────────────────────

  const classrooms =
    gradeId
      ? allClassrooms.filter(
          (classroom) =>
            classroom.grade.id ===
              gradeId &&
            classroom.is_active,
        )
      : [];

  const selectedClassroom =
    gradeSectionId > 0
      ? allClassrooms.find(
          (classroom) =>
            classroom.id ===
            gradeSectionId,
        )
      : undefined;

  // ───────────────────────────────────────────────────
  // Conteo de matriculados del aula
  // ───────────────────────────────────────────────────

  const {
    data: currentEnrollmentCount,
    isLoading:
      isLoadingEnrollmentCount,
  } =
    useClassroomEnrollmentCount(
      enrollment.academic_year_id,

      gradeSectionId > 0
        ? gradeSectionId
        : undefined,
    );

  const capacity =
    selectedClassroom?.capacity;

  const capacityReached =
    typeof currentEnrollmentCount ===
      "number" &&
    typeof capacity ===
      "number" &&
    currentEnrollmentCount >=
      capacity;

  // ───────────────────────────────────────────────────
  // Cambio de grado
  // ───────────────────────────────────────────────────

  const handleGradeChange = (
    value: string,
  ) => {
    const nextGradeId =
      Number(value);

    setGradeId(
      nextGradeId,
    );

    /*
     * El aula depende del grado.
     * Si cambia el grado,
     * limpiamos el aula seleccionada.
     */
    setValue(
      "grade_section_id",
      0,
    );

    clearErrors(
      "grade_section_id",
    );
  };

  // ───────────────────────────────────────────────────
  // Submit
  // ───────────────────────────────────────────────────

  const onSubmit =
    handleSubmit(
      async (values) => {
        try {
          await updateEnrollment.mutateAsync(
            {
              grade_section_id:
                values.grade_section_id,

              enrollment_date:
                values.enrollment_date,

              status:
                values.status,

              observations:
                values.observations
                  ?.trim() ||
                null,
            },
          );

          toast.success(
            "Matrícula actualizada correctamente",
          );

          onClose();
        } catch (error) {
          // ───────────────────────────────────────────
          // Laravel 422
          // ───────────────────────────────────────────

          if (
            axios.isAxiosError<ErrorResponse>(
              error,
            ) &&
            error.response?.status ===
              422
          ) {
            const serverErrors =
              error.response.data
                ?.errors;

            if (serverErrors) {
              Object.entries(
                serverErrors,
              ).forEach(
                ([
                  field,
                  messages,
                ]) => {
                  const formField =
                    SERVER_FIELD_MAP[
                      field
                    ];

                  const message =
                    messages?.[0];

                  if (
                    !formField ||
                    !message
                  ) {
                    return;
                  }

                  setError(
                    formField,
                    {
                      type: "server",
                      message,
                    },
                  );
                },
              );

              toast.error(
                "Revisa los campos marcados.",
              );

              return;
            }
          }

          // ───────────────────────────────────────────
          // Error general
          // ───────────────────────────────────────────

          const apiError =
            getApiError(
              error,
              "No se pudo actualizar la matrícula",
            );

          toast.error(
            apiError.message,
          );
        }
      },
    );

  // ───────────────────────────────────────────────────
  // Datos del estudiante
  // ───────────────────────────────────────────────────

  const person =
    enrollment.student.person;

  const studentName = [
    person.paternal_surname,
    person.maternal_surname,
    person.first_names,
  ]
    .filter(Boolean)
    .join(" ");

  // ───────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────

  return (
    <form
      onSubmit={onSubmit}
      className="flex min-h-full flex-col"
    >
      {/* Header */}

      <SheetHeader>
        <SheetTitle>
          Gestionar matrícula
        </SheetTitle>

        <SheetDescription>
          Actualiza aula, estado,
          fecha u observaciones de
          la matrícula existente.
        </SheetDescription>
      </SheetHeader>

      {/* Content */}

      <div className="flex-1 space-y-8 px-4 py-6">
        {/* Estudiante */}

        <section className="space-y-3">
          <div>
            <h3 className="font-medium">
              Estudiante
            </h3>

            <p className="text-sm text-muted-foreground">
              El estudiante y el año
              académico no pueden
              modificarse.
            </p>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="font-medium">
              {studentName}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {
                person.document_type
              }{" "}
              {
                person.document_number
              }
              {" · "}
              {
                enrollment.student
                  .student_code
              }
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Año lectivo:{" "}
              <strong>
                {
                  enrollment
                    .academic_year
                    .name
                }
              </strong>
            </p>
          </div>
        </section>

        <Separator />

        {/* Ubicación académica */}

        <section className="space-y-4">
          <div>
            <h3 className="font-medium">
              Ubicación académica
            </h3>

            <p className="text-sm text-muted-foreground">
              Un cambio de aula
              actualiza la misma
              matrícula y no crea una
              matrícula adicional.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Grado */}

            <div className="space-y-2">
              <Label>
                Grado
              </Label>

              <Select
                value={
                  gradeId.toString()
                }
                disabled={
                  updateEnrollment
                    .isPending
                }
                onValueChange={
                  handleGradeChange
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar grado" />
                </SelectTrigger>

                <SelectContent>
                  {grades.map(
                    (grade) => (
                      <SelectItem
                        key={grade.id}
                        value={grade.id.toString()}
                      >
                        {grade.name}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Aula */}

            <div className="space-y-2">
              <Label>
                Aula
              </Label>

              <Controller
                control={control}
                name="grade_section_id"
                render={({
                  field,
                }) => (
                  <Select
                    value={
                      field.value > 0
                        ? field.value.toString()
                        : ""
                    }
                    disabled={
                      !gradeId ||
                      isLoadingClassrooms ||
                      updateEnrollment
                        .isPending
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
                      <SelectValue placeholder="Seleccionar aula" />
                    </SelectTrigger>

                    <SelectContent>
                      {classrooms.map(
                        (
                          classroom,
                        ) => (
                          <SelectItem
                            key={
                              classroom.id
                            }
                            value={classroom.id.toString()}
                          >
                            {
                              classroom
                                .section
                                .name
                            }
                            {" · "}
                            {
                              classroom.shift
                            }
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                )}
              />

              {errors
                .grade_section_id
                ?.message && (
                <p className="text-sm text-destructive">
                  {
                    errors
                      .grade_section_id
                      .message
                  }
                </p>
              )}
            </div>
          </div>

          {/* Información del aula */}

          {selectedClassroom && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <School className="size-5 text-primary" />
                  </div>

                  <div>
                    <p className="font-medium">
                      {
                        selectedClassroom
                          .grade.name
                      }{" "}
                      {
                        selectedClassroom
                          .section.name
                      }
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Turno:{" "}
                      {
                        selectedClassroom
                          .shift
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="size-4 text-muted-foreground" />

                  {isLoadingEnrollmentCount ? (
                    <span className="text-muted-foreground">
                      Calculando...
                    </span>
                  ) : (
                    <span>
                      <strong>
                        {
                          currentEnrollmentCount ??
                          0
                        }
                      </strong>
                      {" / "}
                      {
                        selectedClassroom.capacity
                      }
                    </span>
                  )}
                </div>
              </div>

              {capacityReached && (
                <Alert className="mt-4">
                  <AlertCircle className="size-4" />

                  <AlertTitle>
                    Capacidad referencial
                    alcanzada
                  </AlertTitle>

                  <AlertDescription>
                    La capacidad del aula
                    es referencial y no
                    impide guardar este
                    cambio.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </section>

        <Separator />

        {/* Estado */}

        <section className="space-y-4">
          <div>
            <h3 className="font-medium">
              Estado académico
            </h3>

            <p className="text-sm text-muted-foreground">
              Define la situación
              actual de esta matrícula.
            </p>
          </div>

          <Controller
            control={control}
            name="status"
            render={({
              field,
              fieldState,
            }) => (
              <div className="space-y-2">
                <Label>
                  Estado
                </Label>

                <Select
                  value={
                    field.value
                  }
                  disabled={
                    updateEnrollment
                      .isPending
                  }
                  onValueChange={
                    field.onChange
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {statuses.map(
                      (option) => (
                        <SelectItem
                          key={
                            option.value
                          }
                          value={
                            option.value
                          }
                        >
                          {
                            option.label
                          }
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>

                {fieldState.error
                  ?.message && (
                  <p className="text-sm text-destructive">
                    {
                      fieldState.error
                        .message
                    }
                  </p>
                )}
              </div>
            )}
          />
        </section>

        <Separator />

        {/* Información adicional */}

        <section className="space-y-4">
          <div>
            <h3 className="font-medium">
              Información adicional
            </h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-enrollment-date">
              Fecha de matrícula
            </Label>

            <Input
              id="edit-enrollment-date"
              type="date"
              disabled={
                updateEnrollment
                  .isPending
              }
              {...register(
                "enrollment_date",
              )}
            />

            {errors
              .enrollment_date
              ?.message && (
              <p className="text-sm text-destructive">
                {
                  errors
                    .enrollment_date
                    .message
                }
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-enrollment-observations">
              Observaciones
            </Label>

            <textarea
              id="edit-enrollment-observations"
              rows={5}
              disabled={
                updateEnrollment
                  .isPending
              }
              className="flex w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Observaciones de la matrícula..."
              {...register(
                "observations",
              )}
            />

            {errors
              .observations
              ?.message && (
              <p className="text-sm text-destructive">
                {
                  errors
                    .observations
                    .message
                }
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Footer */}

      <SheetFooter>
        <Button
          type="button"
          variant="outline"
          disabled={
            updateEnrollment
              .isPending
          }
          onClick={onClose}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          disabled={
            updateEnrollment
              .isPending
          }
        >
          {updateEnrollment.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar cambios"
          )}
        </Button>
      </SheetFooter>
    </form>
  );
}


// ─────────────────────────────────────────────────────
// Sheet público
// ─────────────────────────────────────────────────────

export function EnrollmentEditSheet({
  enrollment,
  open,
  onOpenChange,
}: EnrollmentEditSheetProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-xl"
      >
        {enrollment && (
          <EnrollmentEditForm
            key={enrollment.id}
            enrollment={enrollment}
            onClose={() =>
              onOpenChange(false)
            }
          />
        )}
      </SheetContent>
    </Sheet>
  );
}