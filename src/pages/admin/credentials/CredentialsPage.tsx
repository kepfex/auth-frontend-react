import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Printer, RefreshCw, QrCode } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useAppContextStore } from "@/store/app-context.store";
import { useClassrooms } from "@/features/classrooms/hooks/useClassrooms";

import { useCredentialStudents } from "@/features/credential-print/hooks/useCredentialStudents";
import { SchoolCredential } from "@/features/credential-print/components/SchoolCredential";

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

function CredentialWorkspace({
  academicYearId,
  academicYearName,
  levelName,
}: WorkspaceProps) {
  const [classroomId, setClassroomId] = useState<number | undefined>();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const queryClient = useQueryClient();

  const { data: classrooms = [], isPending: loadingClassrooms } =
    useClassrooms();

  const { data, isPending, isFetching, isError, refetch } =
    useCredentialStudents(academicYearId, classroomId);

  const students = data?.students ?? [];

  const eligibleStudents = students.filter(
    (student) =>
      student.student_status === "activo" && student.qr?.is_active === true,
  );

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

    setShowPreview(false);
  };

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? eligibleIds : []);
    setShowPreview(false);
  };

  const changeClassroom = (value: string) => {
    setClassroomId(value ? Number(value) : undefined);
    setSelectedIds([]);
    setShowPreview(false);
  };

  const preparePreview = async () => {
    // Comprobar nuevamente los datos antes de preparar
    // las credenciales. Si una tarjeta fue desactivada,
    // dejará de estar disponible.
    const result = await refetch();

    if (!result.data || result.isError) return;

    const stillEligible = result.data.students
      .filter(
        (student) =>
          student.student_status === "activo" && student.qr?.is_active === true,
      )
      .map((student) => student.student_id);

    const validSelected = selectedIds.filter((id) =>
      stillEligible.includes(id),
    );

    setSelectedIds(validSelected);
    setShowPreview(validSelected.length > 0);
  };

  const printCredentials = async () => {
    if (!academicYearId || !classroomId || selectedIds.length === 0) {
      return;
    }

    // Se vuelve a verificar el estado desde Laravel
    // antes de abrir el diálogo de impresión.
    const result = await queryClient.fetchQuery({
      queryKey: ["credential-print", academicYearId, classroomId],
      queryFn: () =>
        import("@/features/credential-print/api/credential-print.api").then(
          ({ credentialPrintApi }) =>
            credentialPrintApi.getStudents(academicYearId, classroomId),
        ),
      staleTime: 0,
    });

    const validIds = result.students
      .filter(
        (student) =>
          student.student_status === "activo" && student.qr?.is_active === true,
      )
      .map((student) => student.student_id);

    const nextSelection = selectedIds.filter((id) => validIds.includes(id));

    if (nextSelection.length !== selectedIds.length) {
      setSelectedIds(nextSelection);
      setShowPreview(false);
      return;
    }

    window.print();
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
                disabled={!academicYearId || loadingClassrooms}
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
                          disabled={!eligible}
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
                  disabled={selectedStudents.length === 0 || isFetching}
                  onClick={() => void preparePreview()}
                >
                  <QrCode className="size-4" />
                  Preparar vista previa
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {showPreview && selectedStudents.length > 0 && data && (
        <section className="space-y-4">
          <div className="flex items-center justify-between print:hidden">
            <div>
              <h2 className="text-lg font-semibold">Vista previa</h2>

              <p className="text-sm text-muted-foreground">
                {selectedStudents.length} credenciales listas
              </p>
            </div>

            <Button
              onClick={() => void printCredentials()}
              disabled={isFetching}
            >
              <Printer className="size-4" />
              Imprimir
            </Button>
          </div>

          <div
            id="credential-print-root"
            className="credential-print-grid grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {selectedStudents.map((student) => (
              <SchoolCredential
                key={student.student_id}
                student={student}
                academicYear={academicYearName}
                level={data.level}
                grade={data.grade}
                section={data.section}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
