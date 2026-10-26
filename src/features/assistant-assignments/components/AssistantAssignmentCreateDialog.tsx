import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { usePositions } from "@/features/positions/hooks/usePositions";
import { useClassrooms } from "@/features/classrooms/hooks/useClassrooms";
import { useCreateAssistantAssignment } from "../hooks/useAssistantAssignments";
import { createAssistantAssignmentSchema } from "../schemas/assistant-assignment.schema";

const getError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    return Object.values(body?.errors ?? {})[0]?.[0] ?? body?.message ?? "No se pudo registrar la asignación.";
  }
  return "No se pudo registrar la asignación.";
};

interface Props { open: boolean; onOpenChange: (open: boolean) => void }
export function AssistantAssignmentCreateDialog({ open, onOpenChange }: Props) {
  const [employeeId, setEmployeeId] = useState("");
  const [classroomId, setClassroomId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const positions = usePositions();
  const assistantPosition = positions.data?.find((item) => item.code === "AUXILIAR_EDUCACION");
  const employees = useEmployees({ position_id: assistantPosition?.id, is_active: true, per_page: 100 }, open && !!assistantPosition);
  const classrooms = useClassrooms();
  const mutation = useCreateAssistantAssignment();
  const availableClassrooms = useMemo(() => (classrooms.data ?? []).filter((item) => item.is_active), [classrooms.data]);

  useEffect(() => {
    if (!open) { setEmployeeId(""); setClassroomId(""); setStartDate(""); setEndDate(""); setError(""); }
  }, [open]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const result = createAssistantAssignmentSchema.safeParse({
      employee_id: Number(employeeId), grade_section_id: Number(classroomId),
      start_date: startDate, end_date: endDate || null,
    });
    if (!result.success) { setError(result.error.issues[0]?.message ?? "Revisa el formulario."); return; }
    try {
      await mutation.mutateAsync(result.data);
      toast.success("Asignación registrada correctamente.");
      onOpenChange(false);
    } catch (e) { setError(getError(e)); }
  };

  return <Dialog open={open} onOpenChange={(next) => { if (!mutation.isPending) onOpenChange(next); }}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
      <DialogHeader><DialogTitle>Asignar auxiliar a un aula</DialogTitle><DialogDescription>La asignación se registrará en el año académico y nivel seleccionados en la barra superior.</DialogDescription></DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2"><Label>Auxiliar de Educación *</Label>
          <Select value={employeeId} onValueChange={setEmployeeId} disabled={employees.isLoading || !assistantPosition}>
            <SelectTrigger><SelectValue placeholder={employees.isLoading ? "Cargando auxiliares…" : "Seleccionar auxiliar"}/></SelectTrigger>
            <SelectContent>{employees.data?.data.map((employee) => <SelectItem key={employee.id} value={String(employee.id)}>{[employee.person?.first_names, employee.person?.paternal_surname, employee.person?.maternal_surname].filter(Boolean).join(" ")} · {employee.employee_code}</SelectItem>)}</SelectContent>
          </Select>
          {!assistantPosition && !positions.isLoading && <p className="text-xs text-destructive">No se encontró el cargo activo AUXILIAR_EDUCACION en el catálogo.</p>}
          {employees.data && employees.data.meta.last_page > 1 && <p className="text-xs text-amber-700">Hay más de 100 auxiliares. Esta selección muestra solo la primera página; se necesitará un buscador paginado.</p>}
        </div>
        <div className="space-y-2"><Label>Grado y sección *</Label>
          <Select value={classroomId} onValueChange={setClassroomId} disabled={classrooms.isLoading || availableClassrooms.length === 0}>
            <SelectTrigger><SelectValue placeholder={classrooms.isLoading ? "Cargando aulas…" : "Seleccionar aula"}/></SelectTrigger>
            <SelectContent>{availableClassrooms.map((classroom) => <SelectItem key={classroom.id} value={String(classroom.id)}>{classroom.grade.name} · Sección {classroom.section.name} · {classroom.shift}</SelectItem>)}</SelectContent>
          </Select>
          {classrooms.isError && <p className="text-xs text-destructive">No se pudieron cargar las aulas del contexto seleccionado.</p>}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="assignment-start">Inicio *</Label><Input id="assignment-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}/></div>
          <div className="space-y-2"><Label htmlFor="assignment-end">Fin (opcional)</Label><Input id="assignment-end" type="date" min={startDate || undefined} value={endDate} onChange={(e) => setEndDate(e.target.value)}/></div>
        </div>
        {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
        <DialogFooter><Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit" disabled={mutation.isPending || !assistantPosition || availableClassrooms.length === 0}>{mutation.isPending ? "Guardando…" : "Registrar asignación"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
