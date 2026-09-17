import { useEffect, useState } from "react";
import {
  useCreateLevel,
  useDeleteLevel,
  useLevels,
  useUpdateLevel,
} from "../hooks/useAcademicStructure";
import { Button } from "@/components/ui/button";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  GraduationCapIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  TrashIcon,
} from "lucide-react";
import type { EducationalLevel } from "../types/academic-structure.types";
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  levelSchema,
  type LevelFormData,
} from "../schemas/academic-structure.schema";
import { zodResolver } from "@hookform/resolvers/zod";

export const LevelsTab = () => {
  const { data: levels = [], isLoading } = useLevels();
  const { mutate: create, isPending: isCreating } = useCreateLevel();
  const { mutate: update, isPending: isUpdating } = useUpdateLevel();
  const { mutate: remove, isPending: isRemoving } = useDeleteLevel();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EducationalLevel | null>(null);
  const [deleting, setDeleting] = useState<EducationalLevel | null>(null);

  const form = useForm<LevelFormData>({
    resolver: zodResolver(levelSchema),
    defaultValues: { code: "", name: "", order: 1 },
  });

  useEffect(() => {
    if (editing)
      form.reset({
        code: editing.code,
        name: editing.name,
        order: editing.order,
      });
    else form.reset({ code: "", name: "", order: (levels.length || 0) + 1 });
  }, [editing, formOpen]);

  const onSubmit = (data: LevelFormData) => {
    if (editing) {
      update(
        { id: editing.id, payload: data },
        {
          onSuccess: () => {
            setFormOpen(false);
            setEditing(null);
          },
        },
      );
    } else {
      create(data, { onSuccess: () => setFormOpen(false) });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-xs font-medium border border-slate-200">
          {levels.length} nivel{levels.length !== 1 ? "es" : ""} registrado
          {levels.length !== 1 ? "s" : ""}
        </p>
        {/* <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="gap-2 bg-phoenix-gold hover:bg-phoenix-orange text-obsidian"
        >
          <Plus className="h-4 w-4" /> Nuevo nivel
        </Button> */}
      </div>

      {/* Estado de carga */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-dashed border-border/60 text-muted-foreground gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-phoenix-gold border-t-transparent" />
          <span className="text-xs">Cargando registros...</span>
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((level) => {
            const gradesCount = level.grades?.length ?? 0;
            const formattedOrder = String(level.order).padStart(2, "0");
            return (
              <div
                id={level.code}
                className="group relative rounded-2xl border border-slate-200/80 bg-white p-5 hover:border-primary/60 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top: Orden, Código y Acciones */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center h-6 px-2 rounded-md bg-slate-100 text-[11px] font-mono font-semibold text-slate-600 border border-slate-200/60">
                        #{formattedOrder}
                      </span>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200/60 tracking-wider">
                        {level.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditing(level);
                          setFormOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Editar nivel"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleting(level)}
                        disabled={gradesCount > 0}
                        className={`p-1.5 rounded-lg transition-colors ${gradesCount > 0
                          ? "text-slate-300 cursor-not-allowed"
                          : "text-slate-500 hover:text-red-600 hover:bg-red-50"
                          }`}
                        title={
                          gradesCount > 0
                            ? "No puedes eliminar un nivel con grados asociados"
                            : "Eliminar nivel"
                        }
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Nombre del Nivel */}
                  <div className="mt-4">
                    <h3 className="text-base font-semibold text-slate-900 group-hover:text-primary transition-colors">
                      {level.name}
                    </h3>
                  </div>
                </div>

                {/* Footer de la tarjeta con métricas de Grados */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <GraduationCapIcon className="w-4 h-4 text-slate-400" />
                    <span>
                      {gradesCount} {gradesCount === 1 ? "grado" : "grados"}
                    </span>
                  </div>

                  {gradesCount === 0 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-full">
                      <AlertCircleIcon className="w-3 h-3" /> Sin grados
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-full">
                      <CheckCircleIcon className="w-3 h-3" /> Configurado
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Tarjeta de acción rápida (Dashed) */}
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="group flex flex-col items-center justify-center gap-2.5 min-h-40 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-5 text-slate-500 transition-all duration-200 hover:border-amber-400/80 hover:bg-amber-50/20 hover:text-slate-900"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm group-hover:bg-amber-400 group-hover:border-amber-400 group-hover:text-slate-900 transition-all">
              <PlusIcon className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold">Añadir nivel</p>
              <p className="text-[11px] text-slate-400">
                Crear un nuevo tramo académico
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={(v) => {
          if (!v) {
            setFormOpen(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="flex gap-4 items-center">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm shrink-0 flex items-center justify-center">
                <GraduationCapIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <DialogTitle className="font-semibold text-base sm:text-lg">
                  {editing
                    ? `Editar nivel ${editing.name}`
                    : "Nuevo nivel educativo"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Define la nomenclatura y la secuencia dentro de la estructura escolar.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form id="level-form"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FieldGroup>
              <div className="grid grid-cols-3 gap-3">
                <Controller
                  name="order"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="col-span-1">
                      <FieldLabel htmlFor="lv-order">Orden</FieldLabel>
                      <Input
                        {...field}
                        id="lv-order"
                        type="number"
                        min={1}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="code"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="col-span-2">
                      <FieldLabel htmlFor="lv-code">Código</FieldLabel>
                      <Input {...field} id="lv-code" placeholder="PRI, SEC, INI" />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="lv-name">Nombre Oficial</FieldLabel>
                    <Input {...field} id="lv-name"
                      placeholder="ej. Primaria, Secundaria, Inicial"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

            </FieldGroup>
          </form>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFormOpen(false);
                setEditing(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="level-form"
              disabled={isCreating || isUpdating}
              className="bg-phoenix-gold hover:bg-phoenix-orange text-obsidian"
            >
              {isCreating || isUpdating
                ? "Guardando..."
                : editing
                  ? "Guardar cambios"
                  : "Crear nivel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>
              ¿Eliminar nivel "{deleting?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant={'outline'} disabled={isRemoving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant={'destructive'}
              onClick={() =>
                deleting &&
                remove(deleting.id, { onSuccess: () => setDeleting(null) })
              }
              disabled={isRemoving}
            >
              {isRemoving ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
