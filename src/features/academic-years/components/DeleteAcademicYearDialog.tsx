import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import type { AcademicYear } from "../types/academic-year.types"
import { useDeleteAcademicYear } from "../hooks/useAcademicYears"

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
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ¿Eliminar año académico {year?.name}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará el período{' '}
                        <strong>{year?.name}</strong> ({year?.start_date} — {year?.end_date}) del sistema.
                        Asegúrate de que no tenga estudiantes, asistencias u otros registros asociados.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isPending}
                        className="bg-destructive hover:bg-destructive/90 text-white"
                    >
                        {isPending ? 'Eliminando...' : 'Sí, eliminar'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
