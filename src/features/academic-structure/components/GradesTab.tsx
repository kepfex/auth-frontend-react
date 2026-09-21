import { useEffect, useState } from "react";
import {
  useCreateGrade,
  useDeleteGrade,
  useGrades,
  useLevels,
  useUpdateGrade,
} from "../hooks/useAcademicStructure";
import type { Grade } from "../types/academic-structure.types";
import { Controller, useForm } from "react-hook-form";
import {
  gradeSchema,
  type GradeFormData,
} from "../schemas/academic-structure.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Layers, ListOrdered, Pencil, Plus, Trash2, Trash2Icon } from "lucide-react";
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

export const GradesTab = () => {
  const { data: levels = [] } = useLevels();
  const { data: grades = [], isLoading: isLoadingGrades } = useGrades();
  const { mutate: create, isPending: isCreating } = useCreateGrade();
  const { mutate: update, isPending: isUpdating } = useUpdateGrade();
  const { mutate: remove, isPending: isRemoving } = useDeleteGrade();

  // Estados interactivos para filtros y modales
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Grade | null>(null);
  const [deleting, setDeleting] = useState<Grade | null>(null);
  
  // Estado del formulario
  const form = useForm<GradeFormData>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      educational_level_id: 0,
      code: "",
      name: "",
      order: 1,
    },
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        educational_level_id: editing.educational_level_id,
        code: editing.code,
        name: editing.name,
        order: editing.order,
      });
    }
  }, [editing, formOpen]);

  const handleOpenCreateForLevel = (levelId?: number) => {
    setEditing(null);
    const targetLvlId =
      levelId ?? (filterLevel !== "all" ? Number(filterLevel) : levels[0]?.id ?? 1);
    const targetLvl = levels.find((l) => l.id === targetLvlId);
    const countInLevel = grades.filter(
      (g) => g.educational_level_id === targetLvlId
    ).length;
    const nextOrder = countInLevel + 1;

    form.reset({
      educational_level_id: targetLvlId,
      order: nextOrder,
      code: targetLvl ? `${targetLvl.code}-${String(nextOrder).padStart(2, "0")}` : "",
      name: "",
    });
    setFormOpen(true);
  };

  const filteredLevels =
    filterLevel == "all"
      ? levels
      : levels.filter(lvl => filterLevel === String(lvl.id))

  const onSubmit = (data: GradeFormData) => {
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
    <div className="space-y-6 pt-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-800 tracking-tight">
              Grados Escolares
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-xs font-medium border border-slate-200">
              {grades.length} {grades.length === 1 ? "grado" : "grados"}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Administra los grados formativos divididos por cada nivel educativo.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="gap-2 bg-phoenix-gold hover:bg-phoenix-orange text-obsidian"
        >
          <Plus className="h-4 w-4" /> Nuevo grado
        </Button>
      </div>

      {isLoadingGrades && (
        <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-dashed border-border/60 text-muted-foreground gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-phoenix-gold border-t-transparent" />
          <span className="text-xs">Cargando registros...</span>
        </div>
      )}

      {!isLoadingGrades && grades.length !== 0 && (
        <>
          {/* Píldoras de Filtro (Segmented Pills) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
            {/* Píldoras de Nivel */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
              {/* Píldora "Todos" */}
              <button
                onClick={() => setFilterLevel("all")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${filterLevel === "all"
                  ? "bg-amber-500 text-slate-950 font-semibold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
              >
                <span>Todos</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md font-mono text-[10px] ${filterLevel === "all"
                    ? "bg-amber-600/30 text-slate-950 font-bold"
                    : "bg-slate-200/80 text-slate-600"
                    }`}
                >
                  {grades.length}
                </span>
              </button>

              {/* Píldora para cada nivel disponible */}
              {levels.map((lvl) => {
                const count = grades.filter((g) => g.educational_level_id === lvl.id).length;
                const isSelected = filterLevel === String(lvl.id);
                return (
                  <button
                    key={lvl.id}
                    onClick={() => setFilterLevel(String(lvl.id))}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${isSelected
                      ? "bg-amber-500 text-slate-950 font-semibold shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                  >
                    <span>{lvl.name}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-md font-mono text-[10px] ${isSelected
                        ? "bg-amber-600/30 text-slate-950 font-bold"
                        : "bg-slate-200/80 text-slate-600"
                        }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contenedores agrupados por nivel */}
          <div className="space-y-4">
            {filteredLevels.map(level => {
              const lvlGrades = grades.filter(g => g.educational_level_id === level.id)

              return (
                <div
                  key={level.id}
                  className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs transition-all hover:border-amber-400/50"
                >
                  {/* Cabecera del nivel */}
                  <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/50 tracking-wider">
                        {level.code}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                        {level.name}
                      </h3>
                      <span className="text-xs text-slate-500 font-normal">
                        — {lvlGrades.length} {lvlGrades.length === 1 ? "grado" : "grados"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenCreateForLevel(level.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 stroke-[2.5]" />
                      <span>Añadir a {level.name}</span>
                    </button>
                  </div>

                  {/* Estado vacío o listado de grados */}
                  {lvlGrades.length === 0 ? (
                    <div className="py-8 px-6 text-center space-y-2">
                      <div className="w-10 h-10 mx-auto rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 flex items-center justify-center border border-amber-200/50 dark:border-amber-800/40">
                        <Layers className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        No hay grados registrados en {level.name}
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        Comienza definiendo los cursos o años lectivos para este nivel.
                      </p>
                      <div className="pt-1">
                        <button
                          type="button"
                          // onClick={() => handleOpenCreateForLevel(level.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition-all"
                        >
                          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span>Crear primer grado</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {lvlGrades.map((grade) => {
                        const formattedOrder = String(grade.order).padStart(2, "0");
                        return (
                          <div
                            key={grade.id}
                            className="px-5 py-3 hover:bg-amber-50/25 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-4 group"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300 shrink-0 border border-slate-200/70 dark:border-slate-700">
                                #{formattedOrder}
                              </span>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 tracking-wide">
                                    {grade.code}
                                  </span>
                                  <span className="text-slate-300 dark:text-slate-600">•</span>
                                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                                    {grade.name}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  Bloque curricular de {level.name}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                              <button
                                type="button"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors"
                                onClick={() => {
                                  setEditing(grade);
                                  setFormOpen(true);
                                }}
                                title="Editar grado"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
                                onClick={() => setDeleting(grade)}
                                title="Eliminar grado"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
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
                <ListOrdered className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <DialogTitle className="font-semibold text-base sm:text-lg">
                  {editing
                    ? `Editar ${editing.name}`
                    : "Nuevo grado escolar"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  El código debe ser único dentro de la estructura escolar.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form id="grade-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="educational_level_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Nivel educativo</FieldLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map((l) => (
                          <SelectItem key={l.id} value={String(l.id)}>
                            {l.name} ({l.code})
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
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Controller
                    name="order"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="gr-order">
                          Orden
                        </FieldLabel>
                        <Input
                          {...field}
                          id="gr-order"
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
                </div>
                <div className="col-span-2">
                  <Controller
                    name="code"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="gr-code">Código</FieldLabel>
                        <Input {...field} id="gr-code" placeholder="PRI-01" />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </div>

              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="gr-name">Nombre del grado</FieldLabel>
                    <Input {...field} id="gr-name" placeholder="ej. Primero, 3 años, Primer Año" />
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
              disabled={isCreating || isUpdating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="grade-form"
              disabled={isCreating || isUpdating}
              className="bg-phoenix-gold hover:bg-phoenix-orange text-obsidian"
            >
              {isCreating || isUpdating
                ? "Guardando..."
                : editing
                  ? "Guardar cambios"
                  : "Crear grado"}
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
              ¿Eliminar grado "{deleting?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente. No se puede eliminar si tiene aulas
              habilitadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant={"outline"} disabled={isRemoving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant={"destructive"}
              disabled={isRemoving}
              onClick={() =>
                deleting &&
                remove(deleting.id, { onSuccess: () => setDeleting(null) })
              }
            >
              {isRemoving ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
};
