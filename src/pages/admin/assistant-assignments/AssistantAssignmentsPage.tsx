import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Plus, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppContextStore } from "@/store/app-context.store";
import { useClassrooms } from "@/features/classrooms/hooks/useClassrooms";
import { useAssistantAssignments } from "@/features/assistant-assignments/hooks/useAssistantAssignments";
import { AssistantAssignmentCreateDialog } from "@/features/assistant-assignments/components/AssistantAssignmentCreateDialog";
import { AssistantAssignmentFinishDialog } from "@/features/assistant-assignments/components/AssistantAssignmentFinishDialog";
import type { AssistantAssignment } from "@/features/assistant-assignments/types/assistant-assignment.types";

function localDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
function statusOf(item: AssistantAssignment, today: string): string {
  if (!item.is_active) return "Inactiva";
  if (item.start_date > today) return "Programada";
  if (item.end_date && item.end_date < today) return "Finalizada";
  return "Vigente";
}
function nameOf(item: AssistantAssignment): string {
  return (
    [
      item.employee?.person?.first_names,
      item.employee?.person?.paternal_surname,
      item.employee?.person?.maternal_surname,
    ]
      .filter(Boolean)
      .join(" ") || `Empleado #${item.employee_id}`
  );
}

export function AssistantAssignmentsPage() {
  const academicYear = useAppContextStore((s) => s.academicYear);
  const level = useAppContextStore((s) => s.educationalLevel);
  const classrooms = useClassrooms();
  const [classroomFilter, setClassroomFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [finishing, setFinishing] = useState<AssistantAssignment | null>(null);
  const today = localDate();

  useEffect(() => {
    setClassroomFilter("all");
    setPage(1);
  }, [academicYear?.id, level?.id]);
  useEffect(() => {
    setPage(1);
  }, [classroomFilter, periodFilter]);

  // API de asignaciones filtra por año; el nivel se resuelve por las aulas
  // del contexto global. En un nivel con más de 100 aulas hay que ampliar
  // la consulta del backend para filtrar el nivel de forma paginada.

  const filters = {
    academic_year_id: academicYear?.id,
    educational_level_id: level?.id,

    grade_section_id:
      classroomFilter === "all" ? undefined : Number(classroomFilter),

    effective_on: periodFilter === "effective" ? today : undefined,

    page,
    per_page: 15,
  };

  const assignments = useAssistantAssignments(filters, !!academicYear?.id);
  const rows = assignments.data?.data ?? [];

  const classroomOptions = classrooms.data ?? [];
  const canFinish = (item: AssistantAssignment) =>
    item.is_active &&
    item.start_date <= today &&
    (!item.end_date || item.end_date >= today);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Asignaciones de auxiliares
          </h1>
          <p className="text-sm text-muted-foreground">
            Administra los responsables de cada grado y sección y consulta su
            historial.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          disabled={!academicYear || classroomOptions.length === 0}
        >
          <Plus className="mr-2 size-4" />
          Nueva asignación
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Asignaciones por aula</CardTitle>
          <p className="text-sm text-muted-foreground">
            Año: {academicYear?.name ?? "Sin seleccionar"} · Nivel:{" "}
            {level?.name ?? "Todos los niveles"}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!academicYear ? (
            <p className="rounded-md border p-6 text-sm text-muted-foreground">
              Selecciona un año académico en la barra superior para consultar
              las asignaciones.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <div className="min-w-[200px] flex-1">
                  <Select
                    value={classroomFilter}
                    onValueChange={setClassroomFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Aula" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        Todas las aulas del contexto
                      </SelectItem>
                      {classroomOptions.map((classroom) => (
                        <SelectItem
                          key={classroom.id}
                          value={String(classroom.id)}
                        >
                          {classroom.grade.name} · {classroom.section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-[180px]">
                  <Select value={periodFilter} onValueChange={setPeriodFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todo el historial</SelectItem>
                      <SelectItem value="effective">Vigentes hoy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Actualizar asignaciones"
                  onClick={() => assignments.refetch()}
                  disabled={assignments.isFetching}
                >
                  <RefreshCcw
                    className={`size-4 ${assignments.isFetching ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
              {assignments.isError ? (
                <p className="rounded-md border p-5 text-sm text-destructive">
                  No se pudieron cargar los datos. Comprueba la API e inténtalo
                  nuevamente.
                </p>
              ) : assignments.isLoading ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Cargando asignaciones…
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Auxiliar</TableHead>
                      <TableHead>Aula</TableHead>
                      <TableHead>Inicio</TableHead>
                      <TableHead>Fin</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length ? (
                      rows.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Link
                              to={`/admin/employees/${item.employee_id}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {nameOf(item)}
                            </Link>
                            <p className="font-mono text-xs text-muted-foreground">
                              {item.employee?.employee_code}
                            </p>
                          </TableCell>
                          <TableCell>
                            {item.grade_section?.grade?.name ?? "Grado"} ·{" "}
                            {item.grade_section?.section?.name ??
                              item.grade_section_id}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {item.start_date}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {item.end_date ?? "Sin fecha"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                statusOf(item, today) === "Vigente"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {statusOf(item, today)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {canFinish(item) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setFinishing(item)}
                              >
                                <CalendarClock className="mr-1 size-4" />
                                Finalizar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-28 text-center text-muted-foreground"
                        >
                          No se encontraron asignaciones en este contexto.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
              {assignments.data && assignments.data.meta.total > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                  <span>
                    Página {assignments.data.meta.current_page} de{" "}
                    {assignments.data.meta.last_page} ·{" "}
                    {assignments.data.meta.total} registros encontrados{" "}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page <= 1 || assignments.isFetching}
                      onClick={() => setPage((n) => n - 1)}
                    >
                      Anterior
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={
                        page >= assignments.data.meta.last_page ||
                        assignments.isFetching
                      }
                      onClick={() => setPage((n) => n + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      <AssistantAssignmentCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      <AssistantAssignmentFinishDialog
        assignment={finishing}
        onOpenChange={(open) => {
          if (!open) setFinishing(null);
        }}
      />
    </div>
  );
}
