import type { Grade } from "@/features/academic-structure/types/academic-structure.types";
import type { Classroom, CreateClassroomRequest } from "../types/classroom.types";
import { useAppContextStore } from "@/store/app-context.store";
import { useSections } from "@/features/academic-structure/hooks/useAcademicStructure";
import { useCreateClassroom, useUpdateClassroom } from "../hooks/useClassrooms";
import { Controller, useForm } from "react-hook-form";
import { classroomSchema, type ClassroomFormValues } from "../schemas/classroom.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface ClassroomFormSheetProps {
    open: boolean;

    onOpenChange: (
        open: boolean
    ) => void;

    grade: Grade | null;

    classroom?: Classroom | null;
}

export const ClassroomFormSheet = ({
    open,
    onOpenChange,
    grade,
    classroom,
}: ClassroomFormSheetProps) => {
    const academicYear =
        useAppContextStore(
            (state) => state.academicYear
        );

    const { data: sections = [] } =
        useSections();

    const createClassroom =
        useCreateClassroom();

    const updateClassroom =
        useUpdateClassroom();

    const isEditing =
        Boolean(classroom);

    const form =
        useForm<ClassroomFormValues>({
            resolver:
                zodResolver(classroomSchema),

            defaultValues: {
                section_id: 0,
                shift: "mañana",
                capacity: 30,
                is_active: true,
            },
        });

    useEffect(() => {
        if (!open) return;

        form.reset({
            section_id:
                classroom?.section.id ?? 0,

            shift:
                classroom?.shift ?? "mañana",

            capacity:
                classroom?.capacity ?? 30,

            is_active:
                classroom?.is_active ?? true,
        });
    }, [
        open,
        classroom,
        form,
    ]);

    const onSubmit = async (
        values: ClassroomFormValues
    ) => {
        if (!academicYear || !grade) {
            return;
        }

        const payload: CreateClassroomRequest = {
            academic_year_id:
                academicYear.id,

            grade_id: grade.id,

            section_id:
                values.section_id,

            shift: values.shift,

            capacity: values.capacity,

            is_active: values.is_active,
        };

        try {
            if (classroom) {
                await updateClassroom.mutateAsync({
                    id: classroom.id,
                    payload,
                });

                toast.success(
                    "Aula actualizada correctamente"
                );
            } else {
                await createClassroom.mutateAsync(
                    payload
                );

                toast.success(
                    "Aula habilitada correctamente"
                );
            }

            onOpenChange(false);
        } catch {
            toast.error(
                isEditing
                    ? "No se pudo actualizar el aula"
                    : "No se pudo habilitar el aula"
            );
        }
    };

    const isPending =
        createClassroom.isPending ||
        updateClassroom.isPending;

    return (
        <Sheet
            open={open}
            onOpenChange={onOpenChange}
        >
            <SheetContent className="sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>
                        {isEditing
                            ? "Editar aula"
                            : "Habilitar sección"}
                    </SheetTitle>

                    <SheetDescription>
                        Configura el aula para el año académico seleccionado.
                    </SheetDescription>
                </SheetHeader>

                <div className="px-4">
                    <div className="mb-6 rounded-lg bg-muted p-4 text-sm">
                        <div className="grid grid-cols-2 gap-3">
                            <span className="text-muted-foreground">
                                Año
                            </span>

                            <span className="font-medium">
                                {academicYear?.name}
                            </span>

                            <span className="text-muted-foreground">
                                Nivel
                            </span>

                            <span className="font-medium">
                                {grade?.educational_level?.name}
                            </span>

                            <span className="text-muted-foreground">
                                Grado
                            </span>

                            <span className="font-medium">
                                {grade?.name}
                            </span>
                        </div>
                    </div>

                    <form
                        id="classroom-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-5"
                    >
                        {/* Sección */}
                        <Controller
                            control={form.control}
                            name="section_id"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Sección</FieldLabel>

                                    <Select
                                        value={field.value ? String(field.value) : ""}
                                        onValueChange={(value) =>
                                            field.onChange(Number(value))
                                        }
                                    >
                                        <SelectTrigger
                                            className="w-full"
                                            aria-invalid={fieldState.invalid}
                                        >
                                            <SelectValue placeholder="Selecciona una sección" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {sections.map((section) => (
                                                <SelectItem
                                                    key={section.id}
                                                    value={String(section.id)}
                                                >
                                                    {section.name}
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

                        {/* Turno */}
                        <Controller
                            control={form.control}
                            name="shift"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Turno</FieldLabel>

                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger
                                            className="w-full"
                                            aria-invalid={fieldState.invalid}
                                        >
                                            <SelectValue />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="mañana">
                                                Mañana
                                            </SelectItem>

                                            <SelectItem value="tarde">
                                                Tarde
                                            </SelectItem>

                                            <SelectItem value="mañana y tarde">
                                                Mañana y tarde
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        {/* Capacidad */}
                        <Controller
                            control={form.control}
                            name="capacity"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="capacity">
                                        Capacidad
                                    </FieldLabel>

                                    <Input
                                        {...field}
                                        id="capacity"
                                        type="number"
                                        min={1}
                                        max={100}
                                        aria-invalid={fieldState.invalid}
                                    />

                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        {/* Estado */}
                        <Controller
                            control={form.control}
                            name="is_active"
                            render={({ field, fieldState }) => (
                                <Field
                                    orientation="horizontal"
                                    data-invalid={fieldState.invalid}
                                    className="rounded-lg border p-4"
                                >
                                    <FieldContent>
                                        <FieldLabel htmlFor="is_active">
                                            Aula activa
                                        </FieldLabel>

                                        <FieldDescription>
                                            Permite utilizar esta aula en el año académico.
                                        </FieldDescription>

                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </FieldContent>

                                    <Switch
                                        id="is_active"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        aria-invalid={fieldState.invalid}
                                    />
                                </Field>
                            )}
                        />
                    </form>
                </div>

                <SheetFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            onOpenChange(false)
                        }
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="submit"
                        form="classroom-form"
                        disabled={isPending}
                    >
                        {isPending
                            ? "Guardando..."
                            : isEditing
                                ? "Guardar cambios"
                                : "Habilitar aula"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};