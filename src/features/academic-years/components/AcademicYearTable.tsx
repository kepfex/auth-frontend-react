import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { AcademicYear } from "../types/academic-year.types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { formatDateLong } from "@/shared/utils/date"

interface Props {
    years: AcademicYear[]
    onEdit: (year: AcademicYear) => void
    onDelete: (year: AcademicYear) => void
}

export const AcademicYearTable = ({ years, onEdit, onDelete }: Props) => {
  return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Año</TableHead>
                    <TableHead>Fecha inicio</TableHead>
                    <TableHead>Fecha fin</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {years.map((year) => (
                    <TableRow key={year.id}>
                        <TableCell className="font-semibold text-foreground">
                            {year.name}
                        </TableCell>
                        <TableCell className="">
                            {formatDateLong(year.start_date)}
                        </TableCell>
                        <TableCell className="">
                            {formatDateLong(year.end_date)}
                        </TableCell>
                        <TableCell>
                            {year.is_active ? (
                                <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                        Activo
                                </Badge>
                            ) : (
                                <Badge className="border-muted-foreground/20 bg-muted text-muted-foreground">
                                        Inactivo
                                </Badge>
                            )}
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                                <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 hover:text-primary"
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
  )
}
