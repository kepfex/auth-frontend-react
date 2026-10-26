import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFinishAssistantAssignment } from "../hooks/useAssistantAssignments";
import { finishAssistantAssignmentSchema } from "../schemas/assistant-assignment.schema";
import type { AssistantAssignment } from "../types/assistant-assignment.types";

interface Props { assignment: AssistantAssignment | null; onOpenChange: (open: boolean) => void }
export function AssistantAssignmentFinishDialog({ assignment, onOpenChange }: Props) {
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const mutation = useFinishAssistantAssignment();
  useEffect(() => { setEndDate(""); setError(""); }, [assignment?.id]);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError("");
    if (!assignment) return;
    const parsed = finishAssistantAssignmentSchema.safeParse({ end_date: endDate });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Fecha inválida."); return; }
    try {
      await mutation.mutateAsync({ id: assignment.id, payload: parsed.data });
      toast.success("Asignación finalizada; se conserva el historial.");
      onOpenChange(false);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const data = e.response?.data as { errors?: Record<string, string[]>; message?: string } | undefined;
        setError(data?.errors?.end_date?.[0] ?? data?.message ?? "No se pudo finalizar.");
      } else setError("No se pudo finalizar.");
    }
  };
  const today = new Date();
  const localToday = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  return <Dialog open={!!assignment} onOpenChange={(next) => { if (!next && !mutation.isPending) onOpenChange(false); }}>
    <DialogContent><DialogHeader><DialogTitle>Finalizar asignación</DialogTitle><DialogDescription>Se establecerá una fecha final sin eliminar el historial. No puedes utilizar fechas futuras ni ampliar la fecha final existente.</DialogDescription></DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2"><Label htmlFor="finish-date">Fecha de finalización *</Label><Input id="finish-date" type="date" min={assignment?.start_date} max={assignment?.end_date && assignment.end_date < localToday ? assignment.end_date : localToday} value={endDate} onChange={(e) => setEndDate(e.target.value)}/></div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>Cancelar</Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Finalizando…" : "Confirmar finalización"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
