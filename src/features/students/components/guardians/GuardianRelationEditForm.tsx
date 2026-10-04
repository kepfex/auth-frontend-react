import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getApiError } from "@/shared/utils/api-error";

import { useUpdateStudentGuardian } from "../../hooks/useGuardians";
import type { GuardianRelationshipOption } from "../../types/catalog.types";
import type { StudentGuardian } from "../../types/guardian.types";
import { guardianRelationshipSchema } from "../../schemas/guardian-create.schema";

const relationEditSchema = z.object({
  relationship: guardianRelationshipSchema,
  is_primary: z.boolean(),
  receives_notifications: z.boolean(),
});

type RelationEditValues = z.infer<typeof relationEditSchema>;

interface Props {
  studentId: number;
  relation: StudentGuardian;
  options: GuardianRelationshipOption[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const GuardianRelationEditForm = ({ studentId, relation, options, onSuccess, onCancel }: Props) => {
  const updateRelation = useUpdateStudentGuardian(studentId);
  const form = useForm<RelationEditValues>({
    resolver: zodResolver(relationEditSchema),
    defaultValues: {
      relationship: relation.relationship,
      is_primary: relation.is_primary,
      receives_notifications: relation.receives_notifications,
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await updateRelation.mutateAsync({ studentGuardianId: relation.id, payload: values });
      toast.success("Relación actualizada correctamente");
      onSuccess();
    } catch (error) {
      toast.error(getApiError(error, "No se pudo actualizar la relación").message);
    }
  });

  const person = relation.guardian.person;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="font-medium">{[person.first_names, person.paternal_surname, person.maternal_surname].filter(Boolean).join(" ")}</p>
        <p className="text-sm text-muted-foreground">{person.document_type} {person.document_number}</p>
      </div>

      <Controller control={form.control} name="relationship" render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label>Parentesco *</Label>
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger><SelectValue placeholder="Seleccionar parentesco" /></SelectTrigger>
            <SelectContent>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
          </Select>
          {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
        </div>
      )} />

      <Controller control={form.control} name="is_primary" render={({ field }) => (
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div><Label>Apoderado principal</Label><p className="text-sm text-muted-foreground">Será el contacto principal del estudiante.</p></div>
          <Switch checked={field.value} onCheckedChange={field.onChange} />
        </div>
      )} />

      <Controller control={form.control} name="receives_notifications" render={({ field }) => (
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div><Label>Recibir notificaciones</Label><p className="text-sm text-muted-foreground">Permite enviar comunicaciones relacionadas con el estudiante.</p></div>
          <Switch checked={field.value} onCheckedChange={field.onChange} />
        </div>
      )} />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={updateRelation.isPending}>
          {updateRelation.isPending && <Loader2 className="size-4 animate-spin" />}
          Guardar cambios
        </Button>
      </div>
    </form>
  );
};
