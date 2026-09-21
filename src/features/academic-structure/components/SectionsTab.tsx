// src/features/academic-structure/components/SectionsTab.tsx
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HeartHandshakeIcon, PencilIcon, Plus, PlusIcon, SparklesIcon, TrashIcon, TypeIcon, X } from 'lucide-react'
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

    const letterSections = sections.filter(s => s.name.trim().length <= 2)
    const valueSections = sections.filter(s => s.name.trim().length > 2)

    const form = useForm<SectionFormData>({
        resolver: zodResolver(sectionSchema),
        defaultValues: { name: '' },
    })

    const onSubmit = (data: SectionFormData) => {
        create(data, { onSuccess: () => { setFormOpen(false); form.reset() } })
    }

    return (
        <div className="space-y-6 pt-1">
            {/* Barra superior de Secciones */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold text-slate-800 tracking-tight">Catálogo de Secciones</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-semibold border border-slate-200">
                            {sections.length} {sections.length === 1 ? 'sección' : 'secciones'}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500">
                        Literales alfabéticos y nombres temáticos disponibles para asociar a cada aula escolar.
                    </p>
                </div>

                <Button size="sm" onClick={() => setFormOpen(true)}
                    className="gap-2 bg-phoenix-gold hover:bg-phoenix-orange text-obsidian">
                    <PlusIcon className="h-4 w-4" /> Nueva sección
                </Button>
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
                                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">Literales Alfabéticos</h3>
                                    <p className="text-[11px] text-slate-500">
                                        Convención tradicional de letras mayúsculas (habitual en Primaria y Secundaria)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                {letterSections.map(sec => (
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
                                        <span className="text-[10px] font-medium text-slate-400">Sección</span>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => setFormOpen(true)}
                                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-400 hover:bg-amber-50/20 text-slate-400 hover:text-slate-900 transition-all cursor-pointer min-h-[90px]"
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
                                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">Nombres Temáticos y Valores</h3>
                                    <p className="text-[11px] text-slate-500">
                                        Virtudes o denominaciones personalizadas (frecuentes en Nivel Inicial o talleres)
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
                                                <h4 className="text-xs font-bold text-slate-900 truncate">{sec.name}</h4>
                                                <span className="text-[10px] text-slate-400 font-medium">Denominación formativa</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity shrink-0">
                                            <button
                                                type="button"
                                                // onClick={() => handleOpenEditSection(sec)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                                title="Editar"
                                            >
                                                <PencilIcon className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                // onClick={() => setDeletingSection(sec)}
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
                                    //   onClick={() => handleOpenCreateSection()}
                                    className="flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20 text-slate-400 hover:text-slate-900 transition-all cursor-pointer min-h-[58px]"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                    <span className="text-xs font-semibold">Añadir otro valor</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {sections.length === 0 && !isLoading && (
                <p className="text-muted-foreground text-sm m-auto">Sin secciones registradas</p>
            )}

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