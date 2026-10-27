import { useEffect, useMemo, useState, type FormEvent } from "react";
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
import { useAppContextStore } from "@/store/app-context.store";
import { useCreateAssistantAssignment } from "../hooks/useAssistantAssignments";
import { createAssistantAssignmentSchema } from "../schemas/assistant-assignment.schema";

type Field = "employee_id" | "grade_section_id" | "start_date" | "end_date";
type FieldErrors = Partial<Record<Field, string>>;
const fields: Field[] = ["employee_id", "grade_section_id", "start_date", "end_date"];

function parseApiError(error: unknown): { summary: string; fields: FieldErrors } {
  const fallback = "No se pudo registrar la asignación.";
  if (!axios.isAxiosError(error)) return { summary: fallback, fields: {} };
  const response = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
  const fieldErrors: FieldErrors = {};
  for (const field of fields) {
    const message = response?.errors?.[field]?.[0];
    if (message) fieldErrors[field] = message;
  }
  return {
    summary: error.response?.status === 422
      ? "Revisa los datos indicados y vuelve a intentarlo."
      : response?.message || fallback,
    fields: fieldErrors,
  };
}

interface Props { open: boolean; onOpenChange: (open: boolean) => void }

export function AssistantAssignmentCreateDialog({ open, onOpenChange }: Props) {
  const academicYear = useAppContextStore((state) => state.academicYear);
  const level = useAppContextStore((state) => state.educationalLevel);
  const [employeeId, setEmployeeId] = useState("");
  const [classroomId, setClassroomId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [summary, setSummary] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const positions = usePositions();
  const assistantPosition = positions.data?.find((item) => item.code === "AUXILIAR_EDUCACION" && item.is_active);
  const employees = useEmployees(
    { position_id: assistantPosition?.id, is_active: true, per_page: 100 },
    open && !!assistantPosition
  );
  const classrooms = useClassrooms();
  const mutation = useCreateAssistantAssignment();
  const availableClassrooms = useMemo(
    () => (classrooms.data ?? []).filter((item) => item.is_active),
    [classrooms.data]
  );

  useEffect(() => {
    if (!open) {
      setEmployeeId(""); setClassroomId(""); setStartDate(""); setEndDate("");
      setSummary(""); setErrors({});
    }
  }, [open]);

  useEffect(() => {
    // El contexto académico puede cambiar mientras el Dialog sigue abierto.
    setClassroomId("");
  }, [academicYear?.id, level?.id]);

  const clearFieldError = (field: Field) => {
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setSummary("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mutation.isPending) return;
    setSummary(""); setErrors({});
    const result = createAssistantAssignmentSchema.safeParse({
      employee_id: employeeId ? Number(employeeId) : 0,
      grade_section_id: classroomId ? Number(classroomId) : 0,
      start_date: startDate,
      end_date: endDate || null,
    });
    if (!result.success) {
      const next: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (fields.includes(field as Field) && !next[field as Field]) {
          next[field as Field] = issue.message;
        }
      }
      setErrors(next);
      setSummary("Completa los campos indicados.");
      return;
    }
    try {
      await mutation.mutateAsync(result.data);
      toast.success("Asignación registrada correctamente.");
      onOpenChange(false);
    } catch (error) {
      const parsed = parseApiError(error);
      setSummary(parsed.summary);
      setErrors(parsed.fields);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!mutation.isPending) onOpenChange(next); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Asignar auxiliar a un aula</DialogTitle>
          <DialogDescription>
            La asignación se registrará para {academicYear?.name ?? "el año seleccionado"} y {level?.name ?? "el nivel seleccionado"}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label>Auxiliar de Educación *</Label>
            <Select value={employeeId} onValueChange={(value) => { setEmployeeId(value); clearFieldError("employee_id"); }} disabled={mutation.isPending || positions.isLoading || employees.isLoading || employees.isError || !assistantPosition}>
              <SelectTrigger aria-invalid={!!errors.employee_id}><SelectValue placeholder={employees.isLoading ? "Cargando auxiliares…" : "Seleccionar auxiliar"} /></SelectTrigger>
              <SelectContent>
                {(employees.data?.data ?? []).map((employee) => (
                  <SelectItem key={employee.id} value={String(employee.id)}>
                    {[employee.person?.first_names, employee.person?.paternal_surname, employee.person?.maternal_surname].filter(Boolean).join(" ")} · {employee.employee_code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employee_id && <p className="text-xs text-destructive">{errors.employee_id}</p>}
            {positions.isError && <p className="text-xs text-destructive">No se pudieron cargar los cargos. <Button type="button" size="sm" variant="link" onClick={() => positions.refetch()}>Reintentar</Button></p>}
            {!assistantPosition && !positions.isLoading && !positions.isError && <p className="text-xs text-destructive">No existe un cargo activo AUXILIAR_EDUCACION.</p>}
            {employees.isError && <p className="text-xs text-destructive">Error al cargar auxiliares. <Button type="button" size="sm" variant="link" onClick={() => employees.refetch()}>Reintentar</Button></p>}
            {!employees.isLoading && !employees.isError && employees.data?.data.length === 0 && <p className="text-xs text-muted-foreground">No hay auxiliares activos disponibles.</p>}
            {employees.data && employees.data.meta.last_page > 1 && <p className="text-xs text-amber-700">La lista muestra solo los primeros 100 auxiliares. Se necesitará búsqueda paginada si hay más.</p>}
          </div>
          <div className="space-y-2">
            <Label>Grado y sección *</Label>
            <Select value={classroomId} onValueChange={(value) => { setClassroomId(value); clearFieldError("grade_section_id"); }} disabled={mutation.isPending || classrooms.isLoading || classrooms.isError || availableClassrooms.length === 0}>
              <SelectTrigger aria-invalid={!!errors.grade_section_id}><SelectValue placeholder={classrooms.isLoading ? "Cargando aulas…" : "Seleccionar aula"} /></SelectTrigger>
              <SelectContent>
                {availableClassrooms.map((classroom) => (
                  <SelectItem key={classroom.id} value={String(classroom.id)}>{classroom.grade.name} · Sección {classroom.section.name} · {classroom.shift}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.grade_section_id && <p className="text-xs text-destructive">{errors.grade_section_id}</p>}
            {classrooms.isError && <p className="text-xs text-destructive">No se pudieron cargar las aulas. <Button type="button" size="sm" variant="link" onClick={() => classrooms.refetch()}>Reintentar</Button></p>}
            {!classrooms.isLoading && !classrooms.isError && availableClassrooms.length === 0 && <p className="text-xs text-muted-foreground">No hay aulas activas en el contexto seleccionado.</p>}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="assignment-start">Inicio *</Label>
              <Input id="assignment-start" type="date" value={startDate} aria-invalid={!!errors.start_date} disabled={mutation.isPending} onChange={(e) => { setStartDate(e.target.value); clearFieldError("start_date"); }} />
              {errors.start_date && <p className="text-xs text-destructive">{errors.start_date}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignment-end">Fin (opcional)</Label>
              <Input id="assignment-end" type="date" min={startDate || undefined} value={endDate} aria-invalid={!!errors.end_date} disabled={mutation.isPending} onChange={(e) => { setEndDate(e.target.value); clearFieldError("end_date"); }} />
              {errors.end_date && <p className="text-xs text-destructive">{errors.end_date}</p>}
            </div>
          </div>
          {summary && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{summary}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={mutation.isPending || !assistantPosition || employees.isLoading || employees.isError || classrooms.isLoading || classrooms.isError || availableClassrooms.length === 0}>{mutation.isPending ? "Guardando…" : "Registrar asignación"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
