import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFinishAssistantAssignment } from "../hooks/useAssistantAssignments";
import { finishAssistantAssignmentSchema } from "../schemas/assistant-assignment.schema";
import type { AssistantAssignment } from "../types/assistant-assignment.types";

interface Props {
  assignment: AssistantAssignment | null;
  onOpenChange: (open: boolean) => void;
}

function getToday(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

export function AssistantAssignmentFinishDialog({
  assignment,
  onOpenChange,
}: Props) {
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const mutation = useFinishAssistantAssignment();
  const today = getToday();
  const maxDate =
    assignment?.end_date && assignment.end_date < today
      ? assignment.end_date
      : today;
  const alreadyFinished = Boolean(
    assignment?.end_date && assignment.end_date < today,
  );
  const cannotFinish = Boolean(
    assignment &&
    (alreadyFinished || !assignment.is_active || assignment.start_date > today),
  );

  useEffect(() => {
    setEndDate("");
    setDateError("");
    setGeneralError("");
  }, [assignment?.id]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!assignment || mutation.isPending || cannotFinish) return;
    setDateError("");
    setGeneralError("");
    const parsed = finishAssistantAssignmentSchema.safeParse({
      end_date: endDate,
    });
    if (!parsed.success) {
      setDateError(
        parsed.error.issues[0]?.message ?? "Indica una fecha válida.",
      );
      return;
    }
    if (endDate < assignment.start_date || endDate > maxDate) {
      setDateError(
        `Selecciona una fecha entre ${assignment.start_date} y ${maxDate}.`,
      );
      return;
    }
    try {
      await mutation.mutateAsync({ id: assignment.id, payload: parsed.data });
      toast.success("Asignación finalizada; se conserva el historial.");
      onOpenChange(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as
          | { errors?: Record<string, string[]>; message?: string }
          | undefined;
        setDateError(data?.errors?.end_date?.[0] ?? "");
        setGeneralError(
          data?.errors?.assignment?.[0] ??
            (error.response?.status === 422
              ? "No se puede finalizar esta asignación."
              : (data?.message ?? "No se pudo finalizar.")),
        );
      } else {
        setGeneralError("No se pudo finalizar. Inténtalo nuevamente.");
      }
    }
  };

  return (
    <Dialog
      open={!!assignment}
      onOpenChange={(next) => {
        if (!next && !mutation.isPending) onOpenChange(false);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finalizar asignación</DialogTitle>
          <DialogDescription>
            Define el último día de responsabilidad del auxiliar. El historial
            se conservará.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="finish-date">Fecha de finalización *</Label>
            <Input
              id="finish-date"
              type="date"
              min={assignment?.start_date}
              max={maxDate}
              value={endDate}
              disabled={mutation.isPending || cannotFinish}
              aria-invalid={!!dateError}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDateError("");
                setGeneralError("");
              }}
            />
            {dateError && (
              <p className="text-xs text-destructive">{dateError}</p>
            )}
          </div>
          {cannotFinish && (
            <p className="text-sm text-muted-foreground">
              La asignación no está habilitada para finalizarse: ya terminó, fue
              deshabilitada o aún no comenzó.
            </p>
          )}
          {generalError && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {generalError}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending || cannotFinish}>
              {mutation.isPending ? "Finalizando…" : "Confirmar finalización"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
