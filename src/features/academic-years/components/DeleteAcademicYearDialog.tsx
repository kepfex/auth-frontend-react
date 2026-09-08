import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@/components/ui/alert-dialog"
import type { AcademicYear } from "../types/academic-year.types"
import { useDeleteAcademicYear } from "../hooks/useAcademicYears"
import { Trash2Icon } from "lucide-react"

interface Props {
    year: AcademicYear | null
    onClose: () => void
}

export const DeleteAcademicYearDialog = ({ year, onClose }: Props) => {
    const { mutate: remove, isPending } = useDeleteAcademicYear()

    const handleConfirm = () => {
        if (!year) return
        remove(year.id, { onSuccess: onClose })
    }

    return (
        <AlertDialog open={!!year} onOpenChange={(v) => !v && onClose()}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <Trash2Icon />
                    </AlertDialogMedia>
                    <AlertDialogTitle>
                        ¿Eliminar año académico {year?.name}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer.
                        Asegúrate de que no tenga estudiantes, asistencias u otros registros asociados.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel variant={"outline"} disabled={isPending}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                    variant={"destructive"}
                        onClick={handleConfirm}
                        disabled={isPending}
                    >
                        {isPending ? 'Eliminando...' : 'Sí, eliminar'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
