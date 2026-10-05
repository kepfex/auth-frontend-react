import { useEffect, type ReactNode } from "react";
import { Controller, useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader2 } from "lucide-react";
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
  studentEditSchema,
  type StudentEditFormValues,
} from "../../schemas/student-edit.schema";

import {
  mapStudentEditToRequest,
  mapStudentToEditForm,
} from "../../utils/student.mapper";

import { useUpdateStudent } from "../../hooks/useStudents";

import type { Student } from "../../types/student.types";
import type { ErrorResponse } from "@/shared/types/shared.types";

import { getApiError } from "@/shared/utils/api-error";

// ─────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────

interface StudentEditSheetProps {
  student: Student;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─────────────────────────────────────────────────────
// Mapeo de errores Laravel → React Hook Form
// ─────────────────────────────────────────────────────

const SERVER_FIELD_MAP: Partial<
  Record<string, FieldPath<StudentEditFormValues>>
> = {
  "person.document_type": "person.document_type",
  "person.document_number": "person.document_number",
  "person.first_names": "person.first_names",
  "person.paternal_surname": "person.paternal_surname",
  "person.maternal_surname": "person.maternal_surname",
  "person.phone": "person.phone",
  "person.email": "person.email",
  "person.birth_date": "person.birth_date",
  "person.address": "person.address",
  "person.sex": "person.sex",
  "person.is_active": "person.is_active",

  student_code: "student.student_code",
  status: "student.status",
};

// ─────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────

export const StudentEditSheet = ({
  student,
  open,
  onOpenChange,
}: StudentEditSheetProps) => {
  const updateStudent = useUpdateStudent(student.id);

  const form = useForm<StudentEditFormValues>({
    resolver: zodResolver(studentEditSchema),
    defaultValues: mapStudentToEditForm(student),
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = form;

  // Cada vez que se abra el Sheet recuperamos los datos
  // actuales del Student almacenados en TanStack Query.
  useEffect(() => {
    if (!open) {
      return;
    }

    reset(mapStudentToEditForm(student));
  }, [open, student, reset]);

  // ───────────────────────────────────────────────────
  // Submit
  // ───────────────────────────────────────────────────

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateStudent.mutateAsync(mapStudentEditToRequest(values));

      toast.success("Estudiante actualizado correctamente");

      onOpenChange(false);
    } catch (error) {
      // ───────────────────────────────────────────────
      // Errores de validación Laravel
      // ───────────────────────────────────────────────

      if (
        axios.isAxiosError<ErrorResponse>(error) &&
        error.response?.status === 422
      ) {
        const serverErrors = error.response.data?.errors;

        if (serverErrors) {
          Object.entries(serverErrors).forEach(([field, messages]) => {
            const formField = SERVER_FIELD_MAP[field];
            const message = messages?.[0];

            if (!formField || !message) {
              return;
            }

            setError(formField, {
              type: "server",
              message,
            });
          });

          toast.error("Revisa los campos marcados antes de guardar.");

          return;
        }
      }

      // ───────────────────────────────────────────────
      // Otros errores API
      // ───────────────────────────────────────────────

      const apiError = getApiError(
        error,
        "No se pudo actualizar el estudiante",
      );

      toast.error(apiError.message);
    }
  });

  // ───────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <form onSubmit={onSubmit} className="flex min-h-full flex-col">
          {/* ─────────────────────────────────────── */}
          {/* Header */}
          {/* ─────────────────────────────────────── */}

          <SheetHeader>
            <SheetTitle>Editar estudiante</SheetTitle>

            <SheetDescription>
              Actualiza la información personal y los datos propios del
              estudiante.
            </SheetDescription>
          </SheetHeader>

          {/* ─────────────────────────────────────── */}
          {/* Content */}
          {/* ─────────────────────────────────────── */}

          <div className="flex-1 space-y-8 px-4 py-6">
            {/* ==================================== */}
            {/* DATOS DE IDENTIFICACIÓN */}
            {/* ==================================== */}

            <section className="space-y-4">
              <div>
                <h3 className="font-medium">Datos de identificación</h3>

                <p className="text-sm text-muted-foreground">
                  Documento e información básica de la persona.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Tipo de documento */}

                <Controller
                  control={control}
                  name="person.document_type"
                  render={({ field, fieldState }) => (
                    <FormField
                      label="Tipo de documento"
                      error={fieldState.error?.message}
                    >
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="DNI">DNI</SelectItem>

                          <SelectItem value="CE">
                            Carné de extranjería
                          </SelectItem>

                          <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  )}
                />

                {/* Número de documento */}

                <FormField
                  label="Número de documento"
                  error={errors.person?.document_number?.message}
                >
                  <Input
                    {...register("person.document_number")}
                    placeholder="Número de documento"
                  />
                </FormField>
              </div>
            </section>

            {/* ==================================== */}
            {/* INFORMACIÓN PERSONAL */}
            {/* ==================================== */}

            <section className="space-y-4">
              <div>
                <h3 className="font-medium">Información personal</h3>

                <p className="text-sm text-muted-foreground">
                  Nombres, apellidos y datos personales.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Nombres */}

                <FormField
                  label="Nombres"
                  error={errors.person?.first_names?.message}
                >
                  <Input
                    {...register("person.first_names")}
                    placeholder="Nombres"
                  />
                </FormField>

                {/* Apellido paterno */}

                <FormField
                  label="Apellido paterno"
                  error={errors.person?.paternal_surname?.message}
                >
                  <Input
                    {...register("person.paternal_surname")}
                    placeholder="Apellido paterno"
                  />
                </FormField>

                {/* Apellido materno */}

                <FormField
                  label="Apellido materno"
                  error={errors.person?.maternal_surname?.message}
                >
                  <Input
                    {...register("person.maternal_surname")}
                    placeholder="Apellido materno"
                  />
                </FormField>

                {/* Sexo */}

                <Controller
                  control={control}
                  name="person.sex"
                  render={({ field, fieldState }) => (
                    <FormField label="Sexo" error={fieldState.error?.message}>
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="M">Masculino</SelectItem>

                          <SelectItem value="F">Femenino</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  )}
                />

                {/* Fecha de nacimiento */}

                <FormField
                  label="Fecha de nacimiento"
                  error={errors.person?.birth_date?.message}
                >
                  <Input type="date" {...register("person.birth_date")} />
                </FormField>
              </div>
            </section>

            {/* ==================================== */}
            {/* CONTACTO */}
            {/* ==================================== */}

            <section className="space-y-4">
              <div>
                <h3 className="font-medium">Información de contacto</h3>

                <p className="text-sm text-muted-foreground">
                  Teléfono, correo electrónico y residencia.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Teléfono */}

                <FormField
                  label="Teléfono"
                  error={errors.person?.phone?.message}
                >
                  <Input {...register("person.phone")} placeholder="Teléfono" />
                </FormField>

                {/* Email */}

                <FormField
                  label="Correo electrónico"
                  error={errors.person?.email?.message}
                >
                  <Input
                    type="email"
                    {...register("person.email")}
                    placeholder="correo@ejemplo.com"
                  />
                </FormField>

                {/* Dirección */}

                <div className="sm:col-span-2">
                  <FormField
                    label="Dirección"
                    error={errors.person?.address?.message}
                  >
                    <Input
                      {...register("person.address")}
                      placeholder="Dirección"
                    />
                  </FormField>
                </div>
              </div>
            </section>

            {/* ==================================== */}
            {/* DATOS DEL ESTUDIANTE */}
            {/* ==================================== */}

            <section className="space-y-4">
              <div>
                <h3 className="font-medium">Datos del estudiante</h3>

                <p className="text-sm text-muted-foreground">
                  Información propia de su registro como estudiante.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Código */}

                <FormField
                  label="Código de estudiante"
                  error={errors.student?.student_code?.message}
                >
                  <Input
                    {...register("student.student_code")}
                    placeholder="Código del estudiante"
                  />
                </FormField>

                {/* Estado */}

                <Controller
                  control={control}
                  name="student.status"
                  render={({ field, fieldState }) => (
                    <FormField label="Estado" error={fieldState.error?.message}>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="activo">Activo</SelectItem>

                          <SelectItem value="inactivo">Inactivo</SelectItem>

                          <SelectItem value="egresado">Egresado</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  )}
                />
              </div>
            </section>
          </div>

          {/* ─────────────────────────────────────── */}
          {/* Footer */}
          {/* ─────────────────────────────────────── */}

          <SheetFooter className="border-t">
            <Button
              type="button"
              variant="outline"
              disabled={updateStudent.isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={updateStudent.isPending}>
              {updateStudent.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Guardar cambios
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

// ─────────────────────────────────────────────────────
// FormField auxiliar
// ─────────────────────────────────────────────────────

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

const FormField = ({ label, error, children }: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {children}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
