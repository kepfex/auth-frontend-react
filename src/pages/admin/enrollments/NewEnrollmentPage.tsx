import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Loader2,
  School,
  Users,
} from "lucide-react";

import axios from "axios";

import { useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Badge } from "@/components/ui/badge";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Separator } from "@/components/ui/separator";

import { EnrollmentStudentSearch } from "@/features/enrollments/components/EnrollmentStudentSearch";

import {
  useClassroomEnrollmentCount,
  useCreateEnrollment,
  useStudentEnrollments,
} from "@/features/enrollments/hooks/useEnrollments";

import { enrollmentSchema } from "@/features/enrollments/schemas/enrollment.schema";

import type { EnrollmentFormValues } from "@/features/enrollments/schemas/enrollment.schema";

import { mapEnrollmentFormToRequest } from "@/features/enrollments/utils/enrollment.mapper";

import { useGrades } from "@/features/academic-structure/hooks/useAcademicStructure";

import { useClassrooms } from "@/features/classrooms/hooks/useClassrooms";

import type { Student } from "@/features/students/types/student.types";

import type { AcademicYear } from "@/features/academic-years/types/academic-year.types";

import type { EducationalLevel } from "@/features/academic-structure/types/academic-structure.types";

import type { ErrorResponse } from "@/shared/types/shared.types";

import { getApiErrorMessage } from "@/utils/api-error";

import { useAppContextStore } from "@/store/app-context.store";

// ─────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────

const getToday = (): string => {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// ─────────────────────────────────────────────────────
// Formulario interno
// ─────────────────────────────────────────────────────
//
// Está separado dentro del mismo archivo
// intencionalmente.
//
// La página le asignará una key basada en:
// academicYear + educationalLevel.
//
// Si el contexto global cambia,
// React desmontará este formulario y creará
// uno limpio para el nuevo contexto.
// ─────────────────────────────────────────────────────

interface NewEnrollmentFormProps {
  academicYear: AcademicYear;
  educationalLevel: EducationalLevel;
}

function NewEnrollmentForm({
  academicYear,
  educationalLevel,
}: NewEnrollmentFormProps) {
  const navigate = useNavigate();

  const [studentSearch, setStudentSearch] = useState("");

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  /*
   * gradeId es solamente una
   * decisión visual del formulario.
   *
   * Enrollment NO guarda grade_id:
   * guarda grade_section_id.
   */
  const [gradeId, setGradeId] = useState<number | undefined>(undefined);

  // ───────────────────────────────────────────────────
  // Formulario
  // ───────────────────────────────────────────────────

  const form = useForm<EnrollmentFormValues>({
    resolver: zodResolver(enrollmentSchema),

    defaultValues: {
      student_id: 0,

      academic_year_id: academicYear.id,

      grade_section_id: 0,

      enrollment_date: getToday(),

      observations: "",
    },
  });

  const gradeSectionId = useWatch({
    control: form.control,
    name: "grade_section_id",
  });

  // ───────────────────────────────────────────────────
  // Estructura académica
  // ───────────────────────────────────────────────────

  const { data: allGrades = [] } = useGrades();

  /*
   * Este hook ya trabaja con:
   *
   * academicYear global
   * +
   * educationalLevel global.
   */
  const { data: allClassrooms = [], isLoading: isLoadingClassrooms } =
    useClassrooms();

  const grades = allGrades.filter(
    (grade) => grade.educational_level_id === educationalLevel.id,
  );

  const classrooms = gradeId
    ? allClassrooms.filter(
        (classroom) => classroom.grade.id === gradeId && classroom.is_active,
      )
    : [];

  const selectedClassroom =
    gradeSectionId > 0
      ? allClassrooms.find((classroom) => classroom.id === gradeSectionId)
      : undefined;

  // ───────────────────────────────────────────────────
  // Historial del estudiante
  // ───────────────────────────────────────────────────

  const {
    data: studentEnrollments = [],
    isLoading: isLoadingStudentEnrollments,
  } = useStudentEnrollments(selectedStudent?.id ?? null);

  const existingEnrollment = studentEnrollments.find(
    (enrollment) => enrollment.academic_year_id === academicYear.id,
  );

  // ───────────────────────────────────────────────────
  // Ocupación del aula
  // ───────────────────────────────────────────────────

  const { data: currentEnrollmentCount, isLoading: isLoadingEnrollmentCount } =
    useClassroomEnrollmentCount(
      academicYear.id,
      gradeSectionId > 0 ? gradeSectionId : undefined,
    );

  const capacity = selectedClassroom?.capacity;

  const capacityReached =
    typeof currentEnrollmentCount === "number" &&
    typeof capacity === "number" &&
    currentEnrollmentCount >= capacity;

  // ───────────────────────────────────────────────────
  // Crear matrícula
  // ───────────────────────────────────────────────────

  const createEnrollment = useCreateEnrollment();

  // ───────────────────────────────────────────────────
  // Seleccionar estudiante
  // ───────────────────────────────────────────────────

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);

    form.setValue("student_id", student.id, {
      shouldValidate: true,
    });

    form.clearErrors("student_id");
  };

  const handleClearStudent = () => {
    setSelectedStudent(null);

    setStudentSearch("");

    form.setValue("student_id", 0);

    form.clearErrors("student_id");
  };

  // ───────────────────────────────────────────────────
  // Seleccionar grado
  // ───────────────────────────────────────────────────

  const handleGradeChange = (value: string) => {
    const nextGradeId = Number(value);

    setGradeId(nextGradeId);

    /*
     * El aula depende del grado.
     */
    form.setValue("grade_section_id", 0);

    form.clearErrors("grade_section_id");
  };

  // ───────────────────────────────────────────────────
  // Errores Laravel 422
  // ───────────────────────────────────────────────────

  const applyServerErrors = (error: unknown) => {
    if (!axios.isAxiosError<ErrorResponse>(error)) {
      return;
    }

    const errors = error.response?.data?.errors;

    if (!errors) {
      return;
    }

    const fields: Array<keyof EnrollmentFormValues> = [
      "student_id",
      "academic_year_id",
      "grade_section_id",
      "enrollment_date",
      "observations",
    ];

    fields.forEach((field) => {
      const message = errors[field]?.[0];

      if (!message) {
        return;
      }

      form.setError(field, {
        type: "server",
        message,
      });
    });
  };

  // ───────────────────────────────────────────────────
  // Submit
  // ───────────────────────────────────────────────────

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!selectedStudent) {
      form.setError("student_id", {
        type: "manual",
        message: "Debe seleccionar un estudiante.",
      });

      return;
    }

    /*
     * UX preventiva.
     *
     * El backend sigue siendo quien
     * garantiza definitivamente la
     * restricción UNIQUE.
     */
    if (existingEnrollment) {
      toast.error(
        "El estudiante ya cuenta con una matrícula para este año académico.",
      );

      return;
    }

    try {
      const payload = mapEnrollmentFormToRequest(values);

      await createEnrollment.mutateAsync(payload);

      toast.success("Matrícula registrada correctamente");

      navigate("/admin/enrollments", {
        replace: true,
      });
    } catch (error) {
      applyServerErrors(error);

      toast.error(
        getApiErrorMessage(error, "No se pudo registrar la matrícula"),
      );
    }
  });

  const canSubmit = Boolean(
    selectedStudent &&
    gradeSectionId > 0 &&
    !existingEnrollment &&
    !isLoadingStudentEnrollments,
  );

  // ───────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contexto académico */}

      <Card>
        <CardHeader>
          <CardTitle>Contexto académico</CardTitle>

          <CardDescription>
            La matrícula se registrará utilizando el contexto seleccionado en la
            barra superior.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-2 px-3 py-1.5">
              <CalendarDays className="size-4" />
              Año lectivo:
              <strong>{academicYear.name}</strong>
            </Badge>

            <Badge variant="outline" className="gap-2 px-3 py-1.5">
              <GraduationCap className="size-4" />
              Nivel:
              <strong>{educationalLevel.name}</strong>
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 1. Estudiante */}

      <Card>
        <CardHeader>
          <CardTitle>1. Estudiante</CardTitle>

          <CardDescription>
            Busca al estudiante por DNI, código, nombres o apellidos.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <EnrollmentStudentSearch
            search={studentSearch}
            selectedStudent={selectedStudent}
            disabled={createEnrollment.isPending}
            onSearchChange={setStudentSearch}
            onSelect={handleSelectStudent}
            onClear={handleClearStudent}
          />

          {form.formState.errors.student_id?.message && (
            <p className="text-sm text-destructive">
              {form.formState.errors.student_id.message}
            </p>
          )}

          {selectedStudent && isLoadingStudentEnrollments && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Verificando matrícula del estudiante...
            </div>
          )}

          {existingEnrollment && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />

              <AlertTitle>El estudiante ya está matriculado</AlertTitle>

              <AlertDescription>
                Ya existe una matrícula para el año académico{" "}
                {academicYear.name}. Debes gestionar esa matrícula existente en
                lugar de crear una nueva.
              </AlertDescription>
            </Alert>
          )}

          {selectedStudent &&
            !existingEnrollment &&
            !isLoadingStudentEnrollments && (
              <Alert>
                <CheckCircle2 className="size-4" />

                <AlertTitle>Estudiante disponible</AlertTitle>

                <AlertDescription>
                  No tiene matrícula registrada para {academicYear.name}.
                </AlertDescription>
              </Alert>
            )}
        </CardContent>
      </Card>

      {/* 2. Ubicación académica */}

      <Card>
        <CardHeader>
          <CardTitle>2. Ubicación académica</CardTitle>

          <CardDescription>
            Selecciona el grado y aula donde se matriculará el estudiante.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Grado */}

            <div className="space-y-2">
              <Label>Grado</Label>

              <Select
                value={gradeId?.toString() ?? ""}
                disabled={createEnrollment.isPending}
                onValueChange={handleGradeChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar grado" />
                </SelectTrigger>

                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id.toString()}>
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Aula */}

            <div className="space-y-2">
              <Label>Aula</Label>

              <Select
                value={gradeSectionId > 0 ? gradeSectionId.toString() : ""}
                disabled={
                  !gradeId || isLoadingClassrooms || createEnrollment.isPending
                }
                onValueChange={(value) => {
                  form.setValue("grade_section_id", Number(value), {
                    shouldValidate: true,
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar aula" />
                </SelectTrigger>

                <SelectContent>
                  {classrooms.map((classroom) => (
                    <SelectItem
                      key={classroom.id}
                      value={classroom.id.toString()}
                    >
                      {classroom.section.name}
                      {" · "}
                      {classroom.shift}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {form.formState.errors.grade_section_id?.message && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.grade_section_id.message}
                </p>
              )}
            </div>
          </div>

          {/* Información del aula */}

          {selectedClassroom && (
            <>
              <Separator />

              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <School className="size-5 text-primary" />
                    </div>

                    <div>
                      <p className="font-medium">
                        {selectedClassroom.grade.name}{" "}
                        {selectedClassroom.section.name}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Turno: {selectedClassroom.shift}
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
                        <strong>{currentEnrollmentCount ?? 0}</strong>
                        {" / "}
                        {selectedClassroom.capacity} matriculados
                      </span>
                    )}
                  </div>
                </div>

                {capacityReached && (
                  <Alert className="mt-4">
                    <AlertCircle className="size-4" />

                    <AlertTitle>Capacidad referencial alcanzada</AlertTitle>

                    <AlertDescription>
                      El aula tiene {currentEnrollmentCount} matrícula(s)
                      activa(s) para una capacidad referencial de{" "}
                      {selectedClassroom.capacity}. Esto no impide registrar la
                      matrícula.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 3. Datos de matrícula */}

      <Card>
        <CardHeader>
          <CardTitle>3. Datos de matrícula</CardTitle>

          <CardDescription>
            Completa la fecha y, opcionalmente, alguna observación.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="enrollment_date">Fecha de matrícula</Label>

            <Input
              id="enrollment_date"
              type="date"
              disabled={createEnrollment.isPending}
              {...form.register("enrollment_date")}
            />

            {form.formState.errors.enrollment_date?.message && (
              <p className="text-sm text-destructive">
                {form.formState.errors.enrollment_date.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observaciones</Label>

            <textarea
              id="observations"
              rows={4}
              disabled={createEnrollment.isPending}
              placeholder="Observaciones opcionales sobre la matrícula..."
              className="flex w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              {...form.register("observations")}
            />

            <div className="flex justify-between gap-4">
              {form.formState.errors.observations?.message ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.observations.message}
                </p>
              ) : (
                <span />
              )}

              <span className="text-xs text-muted-foreground">
                Máximo 2000 caracteres
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {createEnrollment.isPending ? (
          <Button type="button" variant="outline" disabled>
            Cancelar
          </Button>
        ) : (
          <Button type="button" variant="outline" asChild>
            <Link to="/admin/enrollments">Cancelar</Link>
          </Button>
        )}

        <Button
          type="submit"
          disabled={!canSubmit || createEnrollment.isPending}
        >
          {createEnrollment.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <BookOpen className="size-4" />
              Matricular estudiante
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────
// Página
// ─────────────────────────────────────────────────────

export function NewEnrollmentPage() {
  const academicYear = useAppContextStore((state) => state.academicYear);

  const educationalLevel = useAppContextStore(
    (state) => state.educationalLevel,
  );

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link to="/admin/enrollments">
            <ArrowLeft className="size-4" />
            Volver a matrículas
          </Link>
        </Button>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Nueva matrícula
          </h1>

          <p className="text-sm text-muted-foreground">
            Selecciona un estudiante y asígnalo a un aula dentro del contexto
            académico actual.
          </p>
        </div>
      </div>

      {/* Contexto inexistente */}

      {!academicYear || !educationalLevel ? (
        <Alert>
          <AlertCircle className="size-4" />

          <AlertTitle>Contexto académico incompleto</AlertTitle>

          <AlertDescription>
            Selecciona un año académico y nivel educativo desde la barra
            superior antes de registrar una matrícula.
          </AlertDescription>
        </Alert>
      ) : (
        /*
         * Si cambia año o nivel global,
         * key cambia.
         *
         * El formulario se reinicia
         * completamente y evitamos
         * estados académicos mezclados.
         */
        <NewEnrollmentForm
          key={`${academicYear.id}:${educationalLevel.id}`}
          academicYear={academicYear}
          educationalLevel={educationalLevel}
        />
      )}
    </div>
  );
}
