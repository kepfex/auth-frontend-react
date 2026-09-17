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
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const GradesTab = () => {
  const { data: levels = [] } = useLevels();
  const { data: grades = [], isLoading } = useGrades();
  const { mutate: create, isPending: isCreating } = useCreateGrade();
  const { mutate: update, isPending: isUpdating } = useUpdateGrade();
  const { mutate: remove, isPending: isRemoving } = useDeleteGrade();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Grade | null>(null);
  const [deleting, setDeleting] = useState<Grade | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>("all");

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
    } else {
      form.reset({
        educational_level_id: levels[0]?.id ?? 0,
        code: "",
        name: "",
        order: 1,
      });
    }
  }, [editing, formOpen]);

  const filteredGrades =
    filterLevel === "all"
      ? grades
      : grades.filter((g) => g.educational_level_id === Number(filterLevel));

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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Filtro por nivel */}
        {/* <Select value={filterLevel} onValueChange={setFilterLevel}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Todos los niveles" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los niveles</SelectItem>
                        {levels.map(l => (
                            <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select> */}

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

      {isLoading && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Cargando...
        </p>
      )}

      {/* Barra de Navegación por Filtros de Píldora (Segmented Pills) + Buscador */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        {/* Píldoras de Nivel */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
          {/* Píldora "Todos" */}
          <button
            onClick={() => setFilterLevel("all")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              filterLevel === "all"
                ? "bg-amber-500 text-slate-950 font-semibold shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <span>Todos</span>
            <span
              className={`px-1.5 py-0.2 rounded-md font-mono text-[10px] ${
                filterLevel === "all"
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
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 font-semibold shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{lvl.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md font-mono text-[10px] ${
                    isSelected
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

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium w-16">Orden</th>
              <th className="text-left px-4 py-3 font-medium w-24">Código</th>
              <th className="text-left px-4 py-3 font-medium">Grado</th>
              <th className="text-left px-4 py-3 font-medium">Nivel</th>
              <th className="text-right px-4 py-3 font-medium w-24">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredGrades.map((grade) => (
              <tr
                key={grade.id}
                className="border-t border-border hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-xs">
                    {grade.order}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {grade.code}
                </td>
                <td className="px-4 py-3 font-medium">{grade.name}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="text-xs">
                    {grade.educational_level?.name ??
                      levels.find((l) => l.id === grade.educational_level_id)
                        ?.name ??
                      "—"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 hover:text-phoenix-gold"
                      onClick={() => {
                        setEditing(grade);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 hover:text-destructive"
                      onClick={() => setDeleting(grade)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredGrades.length === 0 && !isLoading && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground text-sm"
                >
                  Sin grados registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
            <DialogTitle>
              {editing ? `Editar ${editing.name}` : "Nuevo grado"}
            </DialogTitle>
            <DialogDescription>
              El código debe ser único en todo el sistema
            </DialogDescription>
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
                            {l.name}
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
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="gr-name">Nombre</FieldLabel>
                    <Input {...field} id="gr-name" placeholder="Primero" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="order"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="gr-order">
                      Orden dentro del nivel
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar grado "{deleting?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente. No se puede eliminar si tiene aulas
              habilitadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white"
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
