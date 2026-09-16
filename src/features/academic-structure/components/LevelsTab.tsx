import { useEffect, useState } from 'react';
import { useCreateLevel, useDeleteLevel, useLevels, useUpdateLevel } from '../hooks/useAcademicStructure';
import { Button } from '@/components/ui/button';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { EducationalLevel } from '../types/academic-structure.types';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Controller, useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { levelSchema, type LevelFormData } from '../schemas/academic-structure.schema';
import { zodResolver } from '@hookform/resolvers/zod';

export const LevelsTab = () => {
    const { data: levels = [], isLoading } = useLevels()
    const { mutate: create, isPending: isCreating } = useCreateLevel()
    const { mutate: update, isPending: isUpdating } = useUpdateLevel()
    const { mutate: remove, isPending: isRemoving } = useDeleteLevel()

    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<EducationalLevel | null>(null)
    const [deleting, setDeleting] = useState<EducationalLevel | null>(null)

    const form = useForm<LevelFormData>({
        resolver: zodResolver(levelSchema),
        defaultValues: { code: '', name: '', order: 1 },
    })

    useEffect(() => {
        if (editing) form.reset({ code: editing.code, name: editing.name, order: editing.order })
        else form.reset({ code: '', name: '', order: (levels.length || 0) + 1 })
    }, [editing, formOpen])

    const onSubmit = (data: LevelFormData) => {
        if (editing) {
            update({ id: editing.id, payload: data }, { onSuccess: () => { setFormOpen(false); setEditing(null) } })
        } else {
            create(data, { onSuccess: () => setFormOpen(false) })
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                    {levels.length} nivel{levels.length !== 1 ? 'es' : ''} registrado{levels.length !== 1 ? 's' : ''}
                </p>
                <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true) }} className="gap-2 bg-phoenix-gold hover:bg-phoenix-orange text-obsidian">
                    <Plus className="h-4 w-4" /> Nuevo nivel
                </Button>
            </div>

            {/* Estado de carga */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-dashed border-border/60 text-muted-foreground gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-phoenix-gold border-t-transparent" />
                    <span className="text-xs">Cargando registros...</span>
                </div>
            )}

            {!isLoading && (
                <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium w-16">Orden</th>
                                <th className="text-left px-4 py-3 font-medium w-24">Código</th>
                                <th className="text-left px-4 py-3 font-medium">Nombre</th>
                                <th className="text-left px-4 py-3 font-medium">Grados</th>
                                <th className="text-right px-4 py-3 font-medium w-24">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {levels.map((level) => (
                                <tr key={level.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <Badge variant="outline" className="text-xs">{level.order}</Badge>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{level.code}</td>
                                    <td className="px-4 py-3 font-medium">{level.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">
                                        {level.grades?.length ?? 0} grado{(level.grades?.length ?? 0) !== 1 ? 's' : ''}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-phoenix-gold"
                                                onClick={() => { setEditing(level); setFormOpen(true) }}>
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive"
                                                onClick={() => setDeleting(level)}
                                                disabled={(level.grades?.length ?? 0) > 0}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Form Dialog */}
            <Dialog open={formOpen} onOpenChange={(v) => { if (!v) { setFormOpen(false); setEditing(null) } }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{editing ? `Editar ${editing.name}` : 'Nuevo nivel educativo'}</DialogTitle>
                        <DialogDescription>Niveles: Inicial, Primaria, Secundaria</DialogDescription>
                    </DialogHeader>
                    <form id="level-form" onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <Controller name="code" control={form.control} render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="lv-code">Código</FieldLabel>
                                    <Input {...field} id="lv-code" placeholder="PRI" />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )} />
                            <Controller name="name" control={form.control} render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="lv-name">Nombre</FieldLabel>
                                    <Input {...field} id="lv-name" placeholder="Primaria" />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )} />
                            <Controller name="order" control={form.control} render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="lv-order">Orden</FieldLabel>
                                    <Input {...field}
                                        id="lv-order"
                                        type="number"
                                        min={1}
                                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )} />
                        </FieldGroup>
                    </form>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setFormOpen(false); setEditing(null) }}>Cancelar</Button>
                        <Button type="submit" form="level-form" disabled={isCreating || isUpdating}
                            className="bg-phoenix-gold hover:bg-phoenix-orange text-obsidian">
                            {isCreating || isUpdating ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear nivel'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar nivel "{deleting?.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-white"
                            onClick={() => deleting && remove(deleting.id, { onSuccess: () => setDeleting(null) })}
                            disabled={isRemoving}>
                            {isRemoving ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
