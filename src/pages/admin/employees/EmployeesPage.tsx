import { useState } from "react";
import { Loader2, Plus, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { useDebounce } from "@/hooks/useDebounce";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { usePositions } from "@/features/positions/hooks/usePositions";
import { EmployeeCreateDialog } from "@/features/employees/components/EmployeeCreateDialog";
import { Link } from "react-router-dom";

export function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [position, setPosition] = useState("all");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const delayedSearch = useDebounce(search, 400);
  const positions = usePositions();
  const employees = useEmployees({
    search: delayedSearch.trim() || undefined,
    is_active: status === "all" ? undefined : status === "active",
    position_id: position === "all" ? undefined : Number(position),
    page,
    per_page: 15,
  });
  const data = employees.data;
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Empleados</h1>
          <p className="text-sm text-muted-foreground">
            Registra personal y consulta sus cargos institucionales.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" /> Nuevo empleado
        </Button>
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Empleados registrados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_200px_auto]">
            <Input
              aria-label="Buscar empleados"
              placeholder="DNI, código o nombre…"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={position}
              onValueChange={(value) => {
                setPosition(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los cargos</SelectItem>
                {positions.data?.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => employees.refetch()}
              disabled={employees.isFetching}
              aria-label="Actualizar listado"
            >
              <RefreshCcw
                className={
                  employees.isFetching ? "size-4 animate-spin" : "size-4"
                }
              />
            </Button>
          </div>
          {employees.isLoading ? (
            <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Cargando empleados…
            </div>
          ) : employees.isError ? (
            <div className="rounded-md border p-6 text-sm text-destructive">
              No se pudo cargar el listado.{" "}
              <Button
                variant="outline"
                size="sm"
                onClick={() => employees.refetch()}
              >
                Reintentar
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Cargos</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.length ? (
                    data.data.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-mono text-xs">
                          <Link
                            to={`/admin/employees/${employee.id}`}
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            {employee.employee_code}
                          </Link>
                        </TableCell>
                        <TableCell className="font-medium">
                          {[
                            employee.person?.first_names,
                            employee.person?.paternal_surname,
                            employee.person?.maternal_surname,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        </TableCell>
                        <TableCell>
                          {employee.person?.document_number ?? "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {employee.positions?.length ? (
                              employee.positions.map((p) => (
                                <Badge variant="secondary" key={p.id}>
                                  {p.name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground">
                                Sin cargos
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={employee.is_active ? "default" : "outline"}
                          >
                            {employee.is_active ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-28 text-center text-muted-foreground"
                      >
                        No se encontraron empleados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          {data && data.meta.total > 0 && (
            <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>
                Mostrando {data.meta.from ?? 0}–{data.meta.to ?? 0} de{" "}
                {data.meta.total} empleados
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1 || employees.isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </Button>
                <span>
                  Página {data.meta.current_page} de {data.meta.last_page}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= data.meta.last_page || employees.isFetching}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <EmployeeCreateDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
