import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { AcademicYear } from "../types/academic-year.types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

interface Props {
    years: AcademicYear[]
    onEdit: (year: AcademicYear) => void
    onDelete: (year: AcademicYear) => void
}

export const AcademicYearTable = ({ years, onEdit, onDelete }: Props) => {
  return (
    <div className="bg-white overflow-hidden">
        <Table>
            <TableHeader>
                <TableRow className="border-b border-slate-100 dark:border-zinc-800/60 bg-slate-50/75 dark:bg-zinc-900/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    <TableHead className="w-24">Año</TableHead>
                    <TableHead>Fecha inicio</TableHead>
                    <TableHead>Fecha fin</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right w-28">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {years.map((year) => (
                    <TableRow key={year.id} className="">
                        <TableCell className="font-semibold text-base">
                            {year.name}
                        </TableCell>
                        <TableCell className="">
                            {year.start_date}
                        </TableCell>
                        <TableCell className="">
                            {year.end_date}
                        </TableCell>
                        <TableCell>
                            {year.is_active ? (
                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                                        Activo
                                </Badge>
                            ) : (
                                <Badge className="bg-muted text-muted-foreground border-0">
                                        Inactivo
                                </Badge>
                            )}
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                                <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 hover:text-phoenix-gold"
                                        onClick={() => onEdit(year)}
                                        title="Editar"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 hover:text-destructive"
                                        onClick={() => onDelete(year)}
                                        title="Eliminar"
                                        disabled={year.is_active} // no se puede eliminar el activo
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
  )
}
