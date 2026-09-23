// src/features/academic-structure/components/SectionsTab.tsx
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HeartHandshakeIcon,
  PencilIcon,
  Plus,
  PlusIcon,
  SparklesIcon,
  Tag,
  Trash2Icon,
  TrashIcon,
  TypeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
  useSections,
  useCreateSection,
  useDeleteSection,
  useUpdateSection,
} from "../hooks/useAcademicStructure";
import {
  sectionSchema,
  type SectionFormData,
} from "../schemas/academic-structure.schema";
import type { Section } from "../types/academic-structure.types";
import { EmptyState } from "@/components/shared/EmptyState";

export const SectionsTab = () => {
  const EMPTY_SECTION_FORM: SectionFormData = {
    name: "",
  };
  const { data: sections = [], isLoading } = useSections();
  const { mutate: create, isPending: isCreating } = useCreateSection();
  const { mutate: update, isPending: isUpdating } = useUpdateSection();
  const { mutate: remove, isPending: isRemoving } = useDeleteSection();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Section | null>(null);
  const [deleting, setDeleting] = useState<Section | null>(null);

  const letterSections = sections.filter((s) => s.name.trim().length <= 2);
  const valueSections = sections.filter((s) => s.name.trim().length > 2);

  const form = useForm<SectionFormData>({
    resolver: zodResolver(sectionSchema),
    defaultValues: EMPTY_SECTION_FORM,
  });

  const handleOpenCreate = () => {
    setEditing(null);
    form.reset(EMPTY_SECTION_FORM);
    setFormOpen(true);
  };

  const handleOpenEdit = (section: Section) => {
    setEditing(section);

    form.reset({
      name: section.name,
    });

    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditing(null);
    form.reset(EMPTY_SECTION_FORM);
  };

  const onSubmit = (data: SectionFormData) => {
    if (editing) {
      update(
        { id: editing.id, payload: data },
        {
          onSuccess: handleCloseForm
        },
      );
    } else {
      create(data, {
        onSuccess: handleCloseForm
      });
    }
  };

  return (
    <div className="space-y-6 pt-1">
      {/* Barra superior de Secciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-800 tracking-tight">
              Catálogo de Secciones
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-semibold border border-slate-200">
              {sections.length}{" "}
              {sections.length === 1 ? "sección" : "secciones"}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Literales alfabéticos y nombres temáticos disponibles para asociar a
            cada aula escolar.
          </p>
        </div>

        {sections.length !== 0 && (
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="gap-2 bg-phoenix-gold hover:bg-phoenix-orange text-obsidian"
          >
            <PlusIcon className="h-4 w-4" /> Nueva sección
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-dashed border-border/60 text-muted-foreground gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-phoenix-gold border-t-transparent" />
          <span className="text-xs">Cargando registros...</span>
        </div>
      )}

      {!isLoading && sections.length !== 0 && (
        // Lista de secciones
        <div className="space-y-6">
          {/* BLOQUE 1: LITERALES ALFABÉTICOS (A, B, C...) */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-mono font-bold text-xs border border-amber-200">
                  <TypeIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Literales Alfabéticos
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Convención tradicional de letras mayúsculas (habitual en
                    Primaria y Secundaria)
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {letterSections.map((sec) => (
                  <div
                    key={sec.id}
                    className="group relative flex flex-col items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/40 hover:border-amber-400/80 hover:bg-amber-50/20 hover:shadow-xs transition-all"
                  >
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setDeleting(sec)}
                        className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-white transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="w-10 h-10 my-1 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-mono font-bold text-base text-slate-900 shadow-2xs group-hover:scale-105 group-hover:border-amber-400 transition-transform">
                      {sec.name}
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">
                      Sección
                    </span>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-400 hover:bg-amber-50/20 text-slate-400 hover:text-slate-900 transition-all cursor-pointer min-h-22.5"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span className="text-[11px] font-medium">Nueva</span>
                </button>
              </div>
            </div>
          </div>

          {/* BLOQUE 2: SECCIONES POR VALORES O NOMBRES */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-200">
                  <SparklesIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Nombres Temáticos y Valores
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Virtudes o denominaciones personalizadas (frecuentes en
                    Nivel Inicial o talleres)
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {valueSections.map((sec) => (
                  <div
                    key={sec.id}
                    className="group relative flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-400/80 hover:shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                        <HeartHandshakeIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {sec.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Denominación formativa
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(sec)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <PencilIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(sec)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20 text-slate-400 hover:text-slate-900 transition-all cursor-pointer min-h-14.5"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span className="text-xs font-semibold">
                    Añadir otro valor
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {sections.length === 0 && !isLoading && (
        <EmptyState
          title="Sin registros en esta lista"
          description="Comienza agregando los literales o nombres de sección que utilizará tu institución educativa."
          actionLabel="Agregar sección ahora"
          actionIcon={Plus}
          onAction={handleOpenCreate}
        />
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
                <Tag className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <DialogTitle className="font-semibold text-base sm:text-lg">
                  {editing
                    ? `Editar sección ${editing.name}`
                    : "Nueva sección escolar"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Define la nomenclatura y la secuencia dentro de la estructura
                  escolar. Ingresa una letra, texo o un valor formativo.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form id="section-form" onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="sec-name">Nombre o Literal</FieldLabel>
                  <Input
                    {...field}
                    id="sec-name"
                    placeholder="ej. A, B, Alegría, Fortaleza, Única"
                    autoFocus
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                  <p className="text-[11px] text-slate-400">
                    Si tiene 1 o 2 letras se clasificará como literal; si es una
                    palabra, como valor formativo.
                  </p>
                </Field>
              )}
            />
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
              form="section-form"
              disabled={isCreating || isUpdating}
              className="bg-phoenix-gold hover:bg-phoenix-orange text-obsidian"
            >
              {isCreating
                ? "Guardando..."
                : editing
                  ? "Guardar Cambios"
                  : "Crear sección"}
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
              ¿Eliminar sección "{deleting?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              No podrás eliminarla si está en uso en aulas habilitadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
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
    </div>
  );
};
