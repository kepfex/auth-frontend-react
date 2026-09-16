// src/features/academic-structure/components/SectionsTab.tsx
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useSections, useCreateSection, useDeleteSection } from '../hooks/useAcademicStructure'
import { sectionSchema, type SectionFormData } from '../schemas/academic-structure.schema'
import type { Section } from '../types/academic-structure.types'

export const SectionsTab = () => {
    const { data: sections = [], isLoading } = useSections()
    const { mutate: create, isPending: isCreating } = useCreateSection()
    const { mutate: remove, isPending: isRemoving } = useDeleteSection()

    const [formOpen, setFormOpen] = useState(false)
    const [deleting, setDeleting] = useState<Section | null>(null)

    const form = useForm<SectionFormData>({
        resolver: zodResolver(sectionSchema),
        defaultValues: { name: '' },
    })

    const onSubmit = (data: SectionFormData) => {
        create(data, { onSuccess: () => { setFormOpen(false); form.reset() } })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Literales disponibles para asignar a aulas
                </p>
                <Button size="sm" onClick={() => setFormOpen(true)}
                    className="gap-2 bg-phoenix-gold hover:bg-phoenix-orange text-obsidian">
                    <Plus className="h-4 w-4" /> Nueva sección
                </Button>
            </div>

            {isLoading && <p className="text-sm text-muted-foreground text-center py-8">Cargando...</p>}

            {/* Grid de chips */}
            <div className="flex flex-wrap gap-3 p-4 rounded-xl border border-border min-h-24">
                {sections.map(section => (
                    <div key={section.id}
                        className="group flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border hover:border-phoenix-gold/50 transition-all">
                        <span className="font-semibold text-sm">{section.name}</span>
                        <button onClick={() => setDeleting(section)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}
                {sections.length === 0 && !isLoading && (
                    <p className="text-muted-foreground text-sm m-auto">Sin secciones registradas</p>
                )}
            </div>

            {/* Form Dialog */}
            <Dialog open={formOpen} onOpenChange={(v) => { if (!v) { setFormOpen(false); form.reset() } }}>
                <DialogContent className="sm:max-w-xs">
                    <DialogHeader>
                        <DialogTitle>Nueva sección</DialogTitle>
                        <DialogDescription>Ej: A, B, C, Solidaridad, Responsabilidad</DialogDescription>
                    </DialogHeader>
                    <form id="section-form" onSubmit={form.handleSubmit(onSubmit)}>
                        <Controller name="name" control={form.control} render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="sec-name">Literal / Nombre</FieldLabel>
                                <Input {...field} id="sec-name" placeholder="A" autoFocus />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )} />
                    </form>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setFormOpen(false); form.reset() }}>Cancelar</Button>
                        <Button type="submit" form="section-form" disabled={isCreating}
                            className="bg-phoenix-gold hover:bg-phoenix-orange text-obsidian">
                            {isCreating ? 'Creando...' : 'Crear sección'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar sección "{deleting?.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>No podrás eliminarla si está en uso en aulas habilitadas.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-white" disabled={isRemoving}
                            onClick={() => deleting && remove(deleting.id, { onSuccess: () => setDeleting(null) })}>
                            {isRemoving ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}