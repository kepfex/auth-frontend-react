import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { getApiError } from "@/shared/utils/api-error";

import { GuardianForm } from "./GuardianForm";
import { GuardianList } from "./GuardianList";
import { GuardianRelationEditForm } from "./GuardianRelationEditForm";
import {
  useDetachGuardianFromStudent,
  useStudentGuardians,
} from "../../hooks/useGuardians";
import { useGuardianRelationships } from "../../hooks/useGuardianRelationships";
import type { StudentGuardian } from "../../types/guardian.types";

interface GuardianManagerProps {
  studentId: number;
}

export const GuardianManager = ({ studentId }: GuardianManagerProps) => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingRelation, setEditingRelation] = useState<StudentGuardian | null>(null);
  const [relationToRemove, setRelationToRemove] = useState<StudentGuardian | null>(null);

  const { data: guardians = [], isLoading, isError, refetch } = useStudentGuardians(studentId);
  const { data: relationshipOptions = [], isLoading: relationshipsLoading, isError: relationshipsError } = useGuardianRelationships();
  const detachGuardian = useDetachGuardianFromStudent(studentId);

  const hasPrimaryGuardian = guardians.some((guardian) => guardian.is_primary);

  const closeForm = () => {
    setFormOpen(false);
    setEditingRelation(null);
  };

  const handleAdd = () => {
    setEditingRelation(null);
    setFormOpen(true);
  };

  const handleEdit = (relation: StudentGuardian) => {
    setEditingRelation(relation);
    setFormOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!relationToRemove) return;
    try {
      await detachGuardian.mutateAsync(relationToRemove.id);
      toast.success("Apoderado desvinculado correctamente");
      setRelationToRemove(null);
    } catch (error) {
      toast.error(getApiError(error, "No se pudo desvincular el apoderado").message);
    }
  };

  if (isLoading || relationshipsLoading) {
    return <div className="flex min-h-62.5 items-center justify-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }

  if (isError || relationshipsError) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="font-medium">No se pudo cargar la gestión de apoderados</p>
        <p className="mt-1 text-sm text-muted-foreground">Reintenta la consulta para continuar.</p>
        <Button variant="outline" className="mt-4" onClick={() => refetch()}>Reintentar</Button>
      </div>
    );
  }

  const removePerson = relationToRemove?.guardian.person;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Apoderados</CardTitle>
            <CardDescription>Gestiona las personas responsables del estudiante y su relación.</CardDescription>
          </div>
          <Button onClick={handleAdd}><Plus className="size-4" />Agregar apoderado</Button>
        </CardHeader>
        <CardContent>
          <GuardianList guardians={guardians} onEdit={handleEdit} onRemove={setRelationToRemove} />
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) closeForm(); else setFormOpen(true); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingRelation ? "Editar relación del apoderado" : "Agregar apoderado"}</DialogTitle>
            <DialogDescription>{editingRelation ? "Actualiza el parentesco y las preferencias de contacto." : "Busca a la persona y vincúlala como apoderado del estudiante."}</DialogDescription>
          </DialogHeader>

          {editingRelation ? (
            <GuardianRelationEditForm
              studentId={studentId}
              relation={editingRelation}
              options={relationshipOptions}
              onSuccess={closeForm}
              onCancel={closeForm}
            />
          ) : (
            <GuardianForm
              studentId={studentId}
              relationshipOptions={relationshipOptions}
              hasPrimaryGuardian={hasPrimaryGuardian}
              existingGuardianIds={guardians.map((item) => item.guardian_id)}
              onSuccess={closeForm}
              onCancel={closeForm}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={relationToRemove !== null} onOpenChange={(open) => { if (!open) setRelationToRemove(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desvincular apoderado?</AlertDialogTitle>
            <AlertDialogDescription>
              {removePerson ? `${removePerson.first_names} ${removePerson.paternal_surname} dejará de estar asociado a este estudiante. ` : ""}
              La persona y su registro de apoderado no serán eliminados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={detachGuardian.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={detachGuardian.isPending} onClick={(event) => { event.preventDefault(); void handleConfirmRemove(); }}>
              {detachGuardian.isPending && <Loader2 className="size-4 animate-spin" />}
              Desvincular
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
