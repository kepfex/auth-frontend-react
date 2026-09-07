import { zodResolver } from "@hookform/resolvers/zod";
import type { AcademicYear } from "../types/academic-year.types";
import { Controller, useForm } from "react-hook-form";
import {
  academicYearSchema,
  type AcademicYearFormData,
} from "../schemas/academic-year.schema";
import {
  useCreateAcademicYear,
  useUpdateAcademicYear,
} from "../hooks/useAcademicYears";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarClock, CalendarPlus, CalendarRange } from "lucide-react";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  open: boolean;
  onClose: () => void;
  editingYear?: AcademicYear | null; // null = crear, objeto = editar
}

export const AcademicYearFormDialog = ({
  open,
  onClose,
  editingYear,
}: Props) => {
  const isEditing = !!editingYear;
  const { mutate: create, isPending: isCreating } = useCreateAcademicYear();
  const { mutate: update, isPending: isUpdating } = useUpdateAcademicYear();
  const isPending = isCreating || isUpdating;

  const form = useForm<AcademicYearFormData>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      name: "",
      start_date: "",
      end_date: "",
      is_active: false,
    },
  });
  const { reset } = form;

  // Cuando se abre para editar, precarga los valores
  useEffect(() => {
    if (!open) return;

    if (editingYear) {
      reset({
        name: editingYear.name,
        start_date: editingYear.start_date,
        end_date: editingYear.end_date,
        is_active: editingYear.is_active,
      });
    } else {
      reset({ name: "", start_date: "", end_date: "", is_active: false });
    }
  }, [open, editingYear, reset]);

  const onSubmit = (data: AcademicYearFormData) => {
    if (isEditing && editingYear) {
      update({ id: editingYear.id, payload: data }, { onSuccess: onClose });
    } else {
      create(data, { onSuccess: onClose });
    }
  };
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="">
          <div className="flex gap-4 items-center">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm shrink-0 flex items-center justify-center">
              {isEditing ? (
                <CalendarRange className="w-5 h-5" />
              ) : (
                <CalendarPlus className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <DialogTitle className="font-semibold text-base sm:text-lg">
                {isEditing
                  ? `Editar año ${editingYear?.name}`
                  : "Nuevo año académico"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing
                  ? "Modifica los datos del año académico seleccionado."
                  : "Registra un nuevo período lectivo en el sistema."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form id="academic-year-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Nombre / Año */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="ay-name">Año</FieldLabel>

                  <InputWithIcon
                    icon={CalendarClock}
                    {...field}
                    id="ay-name"
                    placeholder=""
                    maxLength={4}
                    aria-invalid={fieldState.invalid}
                    className="w-1/2"
                  />
                  <FieldDescription className="text-[11px] text-slate-400 dark:text-slate-500">
                    4 dígitos numéricos. Ej: 2026
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Fecha inicio */}
              <Controller
                name="start_date"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="ay-start">Fecha de inicio</FieldLabel>
                    <Input
                      {...field}
                      id="ay-start"
                      type="date"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Fecha fin */}
              <Controller
                name="end_date"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="ay-end">Fecha de fin</FieldLabel>
                    <Input
                      {...field}
                      id="ay-end"
                      type="date"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            {/* Estado activo */}
            {isEditing && (
              <Controller
                name="is_active"
                control={form.control}
                render={({ field }) => (
                  <FieldLabel className="border-zinc-400 dark:border-lead-gray">
                    <Field orientation="horizontal">
                      <Checkbox
                        id="ay-active"
                        name="ay-active"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <FieldContent>
                        <FieldTitle>Marcar como año activo</FieldTitle>
                        <FieldDescription className="text-[10px]">
                          El año activo es el contexto predeterminado para las
                          matrículas, horarios y toma de asistencia.
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                  </FieldLabel>
                )}
              />
            )}
          </FieldGroup>
        </form>

        <DialogFooter className="mt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isPending}
            className="bg-white border-slate-300 dark:border-slate-800 flex items-center justify-end gap-2.5"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="academic-year-form"
            disabled={isPending}
            className="bg-phoenix-gold hover:bg-phoenix-orange text-obsidian"
          >
            {isPending
              ? isEditing
                ? "Guardando..."
                : "Creando..."
              : isEditing
                ? "Guardar cambios"
                : "Crear año"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
