import { useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, BriefcaseBusiness, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { parsePositiveIntParam } from "@/shared/utils/route-params";
import { useEmployee, useUpdateEmployeeStatus } from "@/features/employees/hooks/useEmployees";
import { EmployeePositionsDialog } from "@/features/employees/components/EmployeePositionsDialog";

function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    return data?.errors?.is_active?.[0] ?? data?.message ?? "No se pudo modificar el estado del empleado.";
  }
  return "No se pudo modificar el estado del empleado.";
}

function Item({ label, value }: { label: string; value?: string | null }) {
  return <div className="space-y-1"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="text-sm font-medium">{value || "—"}</dd></div>;
}

export function EmployeeDetailPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const id = parsePositiveIntParam(employeeId);
  const employeeQuery = useEmployee(id ?? undefined);
  const statusMutation = useUpdateEmployeeStatus();
  const [positionsOpen, setPositionsOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusError, setStatusError] = useState("");

  if (id === null) return <div className="space-y-3 p-4"><p>Identificador de empleado no válido.</p><Button asChild variant="outline"><Link to="/admin/employees">Volver al listado</Link></Button></div>;
  if (employeeQuery.isLoading) return <div className="flex items-center gap-2 py-12 text-muted-foreground"><Loader2 className="size-4 animate-spin"/>Cargando empleado…</div>;
  if (employeeQuery.isError || !employeeQuery.data) return <div className="space-y-3 py-8"><p className="text-destructive">No se pudo consultar el empleado (o no existe).</p><Button variant="outline" onClick={() => employeeQuery.refetch()}>Reintentar</Button> <Button asChild variant="outline"><Link to="/admin/employees">Volver</Link></Button></div>;

  const employee = employeeQuery.data;
  const person = employee.person;
  const fullName = [person?.first_names, person?.paternal_surname, person?.maternal_surname].filter(Boolean).join(" ");
  const desiredStatus = !employee.is_active;

  const changeStatus = async () => {
    setStatusError("");
    try {
      await statusMutation.mutateAsync({ id: employee.id, payload: { is_active: desiredStatus } });
      toast.success(desiredStatus ? "Empleado activado." : "Empleado desactivado.");
      setStatusOpen(false);
    } catch (error) { setStatusError(errorMessage(error)); }
  };

  return <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
        <Button asChild variant="ghost" size="sm" className="-ml-2"><Link to="/admin/employees"><ArrowLeft className="mr-2 size-4"/>Volver a empleados</Link></Button>
        <h1 className="text-2xl font-bold tracking-tight">{fullName || "Detalle del empleado"}</h1>
        <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-sm text-muted-foreground">{employee.employee_code}</span><Badge variant={employee.is_active ? "default" : "outline"}>{employee.is_active ? "Activo" : "Inactivo"}</Badge></div>
      </div>
      <Button variant="outline" onClick={() => { setStatusError(""); setStatusOpen(true); }}>{employee.is_active ? "Desactivar empleado" : "Activar empleado"}</Button>
    </div>

    <div className="grid gap-5 lg:grid-cols-2">
      <Card><CardHeader><CardTitle className="text-base">Información personal</CardTitle></CardHeader><CardContent><dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Item label="Documento" value={[person?.document_type, person?.document_number].filter(Boolean).join(" ")}/>
        <Item label="Nombres" value={person?.first_names}/>
        <Item label="Apellido paterno" value={person?.paternal_surname}/>
        <Item label="Apellido materno" value={person?.maternal_surname}/>
        <Item label="Teléfono" value={person?.phone}/>
        <Item label="Correo electrónico" value={person?.email}/>
        <Item label="Fecha de nacimiento" value={person?.birth_date}/>
        <Item label="Dirección" value={person?.address}/>
      </dl><p className="mt-5 text-xs text-muted-foreground">Los datos personales se administran desde el módulo de personas. Este perfil no los modifica.</p></CardContent></Card>
      <Card><CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle className="flex items-center gap-2 text-base"><BriefcaseBusiness className="size-4"/>Cargos institucionales</CardTitle><Button size="sm" variant="outline" onClick={() => setPositionsOpen(true)} disabled={!employee.is_active}><Pencil className="mr-2 size-4"/>Editar cargos</Button></div></CardHeader><CardContent className="space-y-3">
        {employee.positions.length ? <div className="flex flex-wrap gap-2">{employee.positions.map((position) => <Badge key={position.id} variant="secondary">{position.name}</Badge>)}</div> : <p className="text-sm text-muted-foreground">Sin cargos asociados.</p>}
        {!employee.is_active && <p className="text-xs text-muted-foreground">Activa el empleado para poder editar sus cargos.</p>}
        <p className="text-xs text-muted-foreground">Si tiene aulas asignadas, el backend impedirá retirar el cargo Auxiliar mientras existan responsabilidades pendientes.</p>
      </CardContent></Card>
    </div>

    <EmployeePositionsDialog employee={employee} open={positionsOpen} onOpenChange={setPositionsOpen}/>
    <AlertDialog open={statusOpen} onOpenChange={(next) => { if (!statusMutation.isPending) setStatusOpen(next); }}><AlertDialogContent>
      <AlertDialogHeader><AlertDialogTitle>{desiredStatus ? "¿Activar este empleado?" : "¿Desactivar este empleado?"}</AlertDialogTitle><AlertDialogDescription>{desiredStatus ? "El perfil laboral volverá a estar activo." : "No podrá desactivarse mientras tenga asignaciones escolares vigentes o futuras."} Esta acción no cambia el estado de la persona.</AlertDialogDescription></AlertDialogHeader>
      {statusError && <p role="alert" className="text-sm text-destructive">{statusError}</p>}
      <AlertDialogFooter><AlertDialogCancel disabled={statusMutation.isPending}>Cancelar</AlertDialogCancel><AlertDialogAction disabled={statusMutation.isPending} onClick={(event) => { event.preventDefault(); void changeStatus(); }}>{statusMutation.isPending ? "Guardando…" : "Confirmar"}</AlertDialogAction></AlertDialogFooter>
    </AlertDialogContent></AlertDialog>
  </div>;
}
