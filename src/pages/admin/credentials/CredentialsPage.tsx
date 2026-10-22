import { useState } from "react";
import { RefreshCw, QrCode, Loader2, Users,  } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [gradeId, setGradeId] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: classrooms = [], isPending: loadingClassrooms } =
    useClassrooms();

  // Grados únicos dentro del contexto académico actual.
  const availableGrades = Array.from(
    new Map(
      classrooms.map((classroom) => [classroom.grade.id, classroom.grade]),
    ).values(),
  );

  // Secciones disponibles para el grado seleccionado.
  const availableClassrooms = gradeId
    ? classrooms.filter((classroom) => classroom.grade.id === gradeId)
    : [];

  const changeGrade = (value: string) => {
    setGradeId(Number(value));

    // Limpiar la sección seleccionada.
    setClassroomId(undefined);

    // Limpiar los estudiantes seleccionados.
    setSelectedIds([]);

    // Cerrar el modal de vista previa.
    setPreviewOpen(false);
  };

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
        description: `${validSelection.length} credencial${validSelection.length === 1 ? "" : "es"} ${validSelection.length === 1 ? "lista" : "listas"} para revisar.`,
        position: "top-center",
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
        <CardHeader className="flex items-center">
          <CardTitle>Seleccionar aula para </CardTitle>
          <Badge className="bg-slate-100 dark:bg-slate-800/80 ">
            {/* Año académico */}
            <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
              <span>{academicYearName || "Sin seleccionar"}</span>
            </span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            {/* Nivel educativo */}
            <span className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-100">
              <span>Nivel {levelName || "Sin seleccionar"}</span>
            </span>
          </Badge>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Grado */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Grado</label>

              <Select
                value={gradeId?.toString() ?? ""}
                onValueChange={changeGrade}
                disabled={!academicYearId || loadingClassrooms || isProcessing}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar grado" />
                </SelectTrigger>

                <SelectContent>
                  {availableGrades.map((grade) => (
                    <SelectItem key={grade.id} value={String(grade.id)}>
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sección */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sección</label>

              <Select
                value={classroomId?.toString() ?? ""}
                onValueChange={changeClassroom}
                disabled={!gradeId || loadingClassrooms || isProcessing}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar sección" />
                </SelectTrigger>

                <SelectContent>
                  {availableClassrooms.map((classroom) => (
                    <SelectItem key={classroom.id} value={String(classroom.id)}>
                      {classroom.section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {classroomId && (
        <Card className="print:hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex gap-2 items-center">
              <Users className="w-5"/>
              <span>Estudiantes matriculados</span>
              {students.length > 0 && (
                <Badge variant="info" className="font-mono">
                  {selectedStudents.length} seleccionados
                </Badge>
              )}
            </CardTitle>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPreviewOpen(false);
                void refetch();
              }}
              disabled={isFetching}
            >
              <RefreshCw className="size-4" />
              Actualizar
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {isPending ? (
              <div className="flex gap-5 flex-col">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div className="flex gap-4 justify-between" key={index}>
                    <div className="flex w-fit items-center gap-4">
                      <Skeleton className="size-10 shrink-0 rounded-full" />
                      <div className="grid gap-2">
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <p className="text-sm text-destructive">
                No se pudo consultar los estudiantes del aula.
              </p>
            ) : students.length === 0 ? (
              <EmptyState title=" No hay estudiantes matriculados en esta aula." />
            ) : (
              <>
                <div className="flex items-center gap-3 mb-0 p-3 bg-slate-200 rounded-sm">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      className="bg-white"
                      disabled={isProcessing}
                      checked={allSelected}
                      onCheckedChange={(value) => toggleAll(value === true)}
                    />
                    {/* Seleccionar todos los habilitados */}
                  </label>

                  <div className="flex-4">
                    <span className="font-bold">Estudiante</span>
                  </div>

                  <div className="flex-1 text-center">
                    <span className="font-bold">Estado QR</span>
                  </div>
                </div>

                <div className="divide-y divide-slate-300">
                  {students.map((student) => {
                    const eligible =
                      student.student_status === "activo" &&
                      student.qr?.is_active === true;

                    return (
                      <div
                        key={student.student_id}
                        className="flex items-center gap-3 p-3 last:border-b last:border-slate-300"
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

                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                          {student.full_name
                            .split(" ")
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join("")}
                        </div>

                        <div className="min-w-0 flex-4">
                          <p className="text-sm font-medium">
                            {student.full_name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {student.student_code}
                          </p>
                        </div>

                        <div className="flex-1 text-center">
                          <Badge variant={eligible ? "success" : "destructive"}>
                            {!student.qr
                              ? "Sin QR"
                              : !student.qr.is_active
                                ? "QR deshabilitado"
                                : student.student_status !== "activo"
                                  ? "Estudiante inactivo"
                                  : "QR habilitado"}
                          </Badge>
                        </div>
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
