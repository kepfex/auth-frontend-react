import { useState } from "react";
import {  RefreshCw, QrCode, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useAppContextStore } from "@/store/app-context.store";
import { useClassrooms } from "@/features/classrooms/hooks/useClassrooms";

import { useCredentialStudents } from "@/features/credential-print/hooks/useCredentialStudents";
import type { CredentialStudent } from "@/features/credential-print/types/credential-print.types";
import { toast } from "sonner";
import axios from "axios";
import { CredentialPreviewDialog } from "@/features/credential-print/components/CredentialPreviewDialog";

export function CredentialsPage() {
  const academicYear = useAppContextStore((state) => state.academicYear);

  const educationalLevel = useAppContextStore(
    (state) => state.educationalLevel,
  );

  // Al cambiar de año o nivel, React reconstruye
  // el contenido y limpia la selección anterior.
  const contextKey = `${academicYear?.id ?? 0}:${educationalLevel?.id ?? 0}`;

  return (
    <CredentialWorkspace
      key={contextKey}
      academicYearId={academicYear?.id}
      academicYearName={academicYear?.name ?? ""}
      levelName={educationalLevel?.name ?? ""}
    />
  );
}

interface WorkspaceProps {
  academicYearId?: number;
  academicYearName: string;
  levelName: string;
}

function getCredentialErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "Ocurrió un error inesperado. Intenta nuevamente.";
  }

  if (!error.response) {
    return "No se pudo conectar con el servidor. Comprueba la conexión e inténtalo nuevamente.";
  }

  switch (error.response.status) {
    case 401:
      return "Tu sesión ha expirado. Inicia sesión nuevamente.";

    case 403:
      return "No tienes permisos para consultar estas credenciales.";

    case 404:
      return "El aula o los registros solicitados no están disponibles.";

    case 422:
      return "Los filtros enviados no son válidos. Verifica el año y el aula.";

    case 429:
      return "Se realizaron demasiadas solicitudes. Intenta nuevamente en unos momentos.";

    default:
      if (error.response.status >= 500) {
        return "El servidor presentó un problema. No se realizó la impresión.";
      }

      return "No se pudieron consultar las credenciales escolares.";
  }
}

function CredentialWorkspace({
  academicYearId,
  academicYearName,
  levelName,
}: WorkspaceProps) {
  const [classroomId, setClassroomId] = useState<number | undefined>();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: classrooms = [], isPending: loadingClassrooms } =
    useClassrooms();

  const { data, isPending, isFetching, isError, refetch } =
    useCredentialStudents(academicYearId, classroomId);

  const students = data?.students ?? [];

  const isEligible = (student: CredentialStudent): boolean =>
    student.student_status === "activo" && student.qr?.is_active === true;

  const eligibleStudents = students.filter(isEligible);

  const eligibleIds = eligibleStudents.map((student) => student.student_id);

  const selectedStudents = eligibleStudents.filter((student) =>
    selectedIds.includes(student.student_id),
  );

  const allSelected =
    eligibleIds.length > 0 &&
    eligibleIds.every((id) => selectedIds.includes(id));

  const toggleStudent = (studentId: number, checked: boolean) => {
    setSelectedIds((previous) =>
      checked
        ? [...new Set([...previous, studentId])]
        : previous.filter((id) => id !== studentId),
    );

    setPreviewOpen(false);
  };

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? eligibleIds : []);
    setPreviewOpen(false);
  };

  const changeClassroom = (value: string) => {
    setClassroomId(value ? Number(value) : undefined);
    setSelectedIds([]);
    setPreviewOpen(false);
  };

  const preparePreview = async () => {
    // Comprobar nuevamente los datos antes de preparar
    // las credenciales. Si una tarjeta fue desactivada,
    // dejará de estar disponible.

    // si un estudiante fue retirado, desactivado o su QR quedó inhabilitado,
    // actualizaremos la selección y pediremos al usuario que vuelva a preparar
    // la vista previa.

    if (isProcessing || selectedIds.length === 0) return;

    setIsProcessing(true);
    setPreviewOpen(false);

    try {
      // Forzar una consulta actualizada desde Laravel.
      const result = await refetch();

      if (result.isError || !result.data) {
        toast.error("No se pudo preparar la vista previa", {
          description: getCredentialErrorMessage(result.error),
        });
        return;
      }

      const validIds = new Set(
        result.data.students
          .filter(isEligible)
          .map((student) => student.student_id),
      );

      const validSelection = selectedIds.filter((id) => validIds.has(id));

      if (validSelection.length !== selectedIds.length) {
        setSelectedIds(validSelection);

        toast.warning("La selección fue actualizada", {
          description:
            "Algunos estudiantes ya no tienen un QR habilitado o una matrícula elegible.",
        });

        // Solicitar una nueva revisión del usuario.
        return;
      }

      if (validSelection.length === 0) {
        toast.warning("No hay credenciales disponibles", {
          description: "Selecciona al menos un estudiante con QR habilitado.",
        });
        return;
      }

      setPreviewOpen(true);

      toast.success("Vista previa preparada", {
        description: `${validSelection.length} credencial(es) listas para revisar.`,
      });
    } catch (error) {
      toast.error("No se pudo preparar la vista previa", {
        description: getCredentialErrorMessage(error),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <h1 className="text-2xl font-bold tracking-tight">
          Credenciales escolares
        </h1>

        <p className="text-sm text-muted-foreground">
          Selecciona alumnos matriculados y prepara sus tarjetas de
          identificación usando sus códigos QR.
        </p>
      </div>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Seleccionar aula</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Año académico</p>
              <p className="font-medium">
                {academicYearName || "Sin seleccionar"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Nivel educativo</p>
              <p className="font-medium">{levelName || "Sin seleccionar"}</p>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="credential-classroom"
                className="text-sm font-medium"
              >
                Grado y sección
              </label>

              <select
                id="credential-classroom"
                value={classroomId ?? ""}
                onChange={(event) => changeClassroom(event.target.value)}
                disabled={!academicYearId || loadingClassrooms || isProcessing}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Seleccionar aula</option>

                {classrooms.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.grade.name} · {classroom.section.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {classroomId && (
        <Card className="print:hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Estudiantes matriculados</CardTitle>

            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              <RefreshCw className="size-4" />
              Actualizar
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {isPending ? (
              <p className="text-sm text-muted-foreground">
                Cargando estudiantes...
              </p>
            ) : isError ? (
              <p className="text-sm text-destructive">
                No se pudo consultar los estudiantes del aula.
              </p>
            ) : students.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay estudiantes matriculados en esta aula.
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      disabled={isProcessing}
                      checked={allSelected}
                      onCheckedChange={(value) => toggleAll(value === true)}
                    />
                    Seleccionar todos los habilitados
                  </label>

                  <Badge variant="secondary">
                    {selectedStudents.length} seleccionados
                  </Badge>
                </div>

                <div className="divide-y rounded-lg border">
                  {students.map((student) => {
                    const eligible =
                      student.student_status === "activo" &&
                      student.qr?.is_active === true;

                    return (
                      <div
                        key={student.student_id}
                        className="flex items-center gap-3 p-3"
                      >
                        <Checkbox
                          checked={
                            eligible && selectedIds.includes(student.student_id)
                          }
                          disabled={!eligible || isProcessing}
                          onCheckedChange={(value) =>
                            toggleStudent(student.student_id, value === true)
                          }
                        />

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">
                            {student.full_name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {student.student_code}
                          </p>
                        </div>

                        <Badge variant={eligible ? "secondary" : "destructive"}>
                          {!student.qr
                            ? "Sin QR"
                            : !student.qr.is_active
                              ? "QR deshabilitado"
                              : student.student_status !== "activo"
                                ? "Estudiante inactivo"
                                : "QR habilitado"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>

                <Button
                  type="button"
                  disabled={
                    selectedStudents.length === 0 || isFetching || isProcessing
                  }
                  onClick={() => void preparePreview()}
                >
                  {isProcessing ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <QrCode className="size-4" />
                  )}

                  {isProcessing
                    ? "Verificando credenciales..."
                    : "Preparar vista previa"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {data && (
        <CredentialPreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          data={data}
          students={selectedStudents}
          academicYearName={academicYearName}
          onInvalidated={() => {
            setSelectedIds([]);
            void refetch();
          }}
        />
      )}
    </div>
  );
}
