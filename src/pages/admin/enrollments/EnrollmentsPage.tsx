import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, BookOpen, CalendarDays, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { EnrollmentFilters } from "@/features/enrollments/components/EnrollmentFilters";
import { EnrollmentTable } from "@/features/enrollments/components/EnrollmentTable";
import { EnrollmentTableSkeleton } from "@/features/enrollments/components/EnrollmentTableSkeleton";
import { useEnrollments } from "@/features/enrollments/hooks/useEnrollments";
import { useEnrollmentStatuses } from "@/features/enrollments/hooks/useEnrollmentStatuses";
import type { EnrollmentStatus } from "@/features/enrollments/types/enrollment.types";
import { useGrades } from "@/features/academic-structure/hooks/useAcademicStructure";
import { useClassrooms } from "@/features/classrooms/hooks/useClassrooms";
import { useAppContextStore } from "@/store/app-context.store";

// ─────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────

const parsePositiveInt = (value: string | null): number | undefined => {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

// ─────────────────────────────────────────────────────
// Página
// ─────────────────────────────────────────────────────

export function EnrollmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ───────────────────────────────────────────────────
  // Contexto global
  // ───────────────────────────────────────────────────

  const academicYear = useAppContextStore((state) => state.academicYear);

  const educationalLevel = useAppContextStore(
    (state) => state.educationalLevel,
  );

  // Limpieza de filtros locales si el contexto global cambia.

  // ───────────────────────────────────────────────────
  // Identificador del contexto actual
  // ───────────────────────────────────────────────────

  const contextKey =
    academicYear && educationalLevel
      ? `${academicYear.id}:${educationalLevel.id}`
      : null;

  const previousContextKeyRef = useRef<string | null>(null);

  const contextInitializedRef = useRef(false);

  // ───────────────────────────────────────────────────
  // Limpiar filtros dependientes al cambiar contexto
  // ───────────────────────────────────────────────────

  useEffect(() => {
    /*
     * Esperamos hasta tener un contexto
     * académico completo.
     */
    if (!contextKey) {
      return;
    }

    /*
     * Primera vez que recibimos un contexto.
     *
     * Solo lo almacenamos.
     * NO limpiamos la URL.
     */
    if (!contextInitializedRef.current) {
      contextInitializedRef.current = true;

      previousContextKeyRef.current = contextKey;

      return;
    }

    /*
     * El contexto sigue siendo exactamente
     * el mismo.
     */
    if (previousContextKeyRef.current === contextKey) {
      return;
    }

    /*
     * Aquí sí sabemos que ocurrió
     * un cambio real posterior.
     */
    previousContextKeyRef.current = contextKey;

    setSearchParams(
      (currentParams) => {
        const next = new URLSearchParams(currentParams);

        next.delete("grade");
        next.delete("classroom");
        next.delete("page");

        return next;
      },
      {
        replace: true,
      },
    );
  }, [contextKey, setSearchParams]);

  // ───────────────────────────────────────────────────
  // Parámetros locales de la página
  // ───────────────────────────────────────────────────
  //
  // Año y nivel NO pertenecen a la URL.
  // Ambos vienen exclusivamente del contexto global.
  //
  // ───────────────────────────────────────────────────

  const urlSearch = searchParams.get("search") ?? "";

  const gradeId = parsePositiveInt(searchParams.get("grade"));

  const classroomId = parsePositiveInt(searchParams.get("classroom"));

  const page = parsePositiveInt(searchParams.get("page")) ?? 1;

  const statusParam = searchParams.get("status");

  const status = statusParam ? (statusParam as EnrollmentStatus) : undefined;

  // ───────────────────────────────────────────────────
  // Búsqueda con debounce
  // ───────────────────────────────────────────────────

  const [searchInput, setSearchInput] = useState(urlSearch);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const normalized = searchInput.trim();

      if (normalized === urlSearch) {
        return;
      }

      const next = new URLSearchParams(searchParams);

      if (normalized) {
        next.set("search", normalized);
      } else {
        next.delete("search");
      }

      next.delete("page");

      setSearchParams(next);
    }, 400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchInput, urlSearch, searchParams, setSearchParams]);

  // ───────────────────────────────────────────────────
  // Datos académicos
  // ───────────────────────────────────────────────────

  const { data: allGrades = [] } = useGrades();

  /*
   * IMPORTANTE:
   *
   * useClassrooms() ya utiliza internamente:
   *
   * - academicYear global
   * - educationalLevel global
   *
   * Por eso NO necesitamos volver a filtrar
   * las aulas por nivel mediante otro selector.
   */
  const { data: allClassrooms = [] } = useClassrooms();

  const { data: statuses = [] } = useEnrollmentStatuses();

  // ───────────────────────────────────────────────────
  // Grados del nivel global seleccionado
  // ───────────────────────────────────────────────────

  const grades = educationalLevel
    ? allGrades.filter(
        (grade) => grade.educational_level_id === educationalLevel.id,
      )
    : [];

  // ───────────────────────────────────────────────────
  // Aulas disponibles para el grado seleccionado
  // ───────────────────────────────────────────────────
  //
  // useClassrooms() ya entrega las aulas del año
  // y nivel globales.
  //
  // Aquí solamente necesitamos aplicar el grado.
  // ───────────────────────────────────────────────────

  const classrooms = gradeId
    ? allClassrooms.filter((classroom) => classroom.grade.id === gradeId)
    : [];

  // ───────────────────────────────────────────────────
  // Parámetros de matrícula
  // ───────────────────────────────────────────────────

  const filters = {
    page,
    per_page: 15,

    search: urlSearch.trim() || undefined,

    academic_year_id: academicYear?.id,

    educational_level_id: educationalLevel?.id,

    grade_id: gradeId,

    grade_section_id: classroomId,

    status,
  };

  const { data, isLoading, isError } = useEnrollments(filters);

  // ───────────────────────────────────────────────────
  // Actualizar parámetros locales
  // ───────────────────────────────────────────────────

  const updateParams = (
    changes: Record<string, string | number | undefined>,
  ) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(changes).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        next.delete(key);
        return;
      }

      next.set(key, String(value));
    });

    setSearchParams(next);
  };

  // ───────────────────────────────────────────────────
  // Handlers
  // ───────────────────────────────────────────────────

  const handleGradeChange = (value?: number) => {
    updateParams({
      grade: value,

      // El aula pertenece al grado.
      classroom: undefined,

      page: undefined,
    });
  };

  const handleClassroomChange = (value?: number) => {
    updateParams({
      classroom: value,
      page: undefined,
    });
  };

  const handleStatusChange = (value?: string) => {
    updateParams({
      status: value,
      page: undefined,
    });
  };

  const handleClear = () => {
    setSearchInput("");

    /*
     * Solo limpiamos filtros locales.
     *
     * El año y nivel globales no se modifican.
     */
    setSearchParams({});
  };

  const handlePageChange = (newPage: number) => {
    updateParams({
      page: newPage === 1 ? undefined : newPage,
    });
  };

  // ───────────────────────────────────────────────────
  // Contexto incompleto
  // ───────────────────────────────────────────────────

  const hasContext = Boolean(academicYear && educationalLevel);

  // ───────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Matrículas</h1>

          <p className="text-sm text-muted-foreground">
            Gestiona las matrículas correspondientes al contexto académico
            seleccionado.
          </p>
        </div>

        {hasContext && (
          <Button asChild>
            <Link to="/admin/enrollments/new">
              <Plus className="size-4" />
              Nueva matrícula
            </Link>
          </Button>
        )}
      </div>

      {/* Sin contexto */}

      {!hasContext ? (
        <Alert>
          <AlertCircle className="size-4" />

          <AlertTitle>Selecciona el contexto académico</AlertTitle>

          <AlertDescription>
            Debes contar con un año académico y un nivel educativo seleccionados
            para gestionar matrículas.
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader className="space-y-4">
            <div>
              <CardTitle>Matrículas</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Consulta y administra los estudiantes matriculados en el
                contexto académico actual.
              </p>
            </div>

            {/* Contexto informativo */}

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
                <CalendarDays className="size-3.5" />
                Año lectivo:
                <span className="font-semibold">{academicYear?.name}</span>
              </Badge>

              <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
                <BookOpen className="size-3.5" />
                Nivel:
                <span className="font-semibold">{educationalLevel?.name}</span>
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <EnrollmentFilters
              search={searchInput}
              gradeId={gradeId}
              classroomId={classroomId}
              status={status}
              grades={grades}
              classrooms={classrooms.map((classroom) => ({
                id: classroom.id,

                name: [classroom.section.name, classroom.shift].join(" · "),
              }))}
              statuses={statuses}
              onSearchChange={setSearchInput}
              onGradeChange={handleGradeChange}
              onClassroomChange={handleClassroomChange}
              onStatusChange={handleStatusChange}
              onClear={handleClear}
            />

            {isLoading && <EnrollmentTableSkeleton />}

            {!isLoading && isError && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />

                <AlertTitle>No se pudieron cargar las matrículas</AlertTitle>

                <AlertDescription>
                  Ocurrió un problema al consultar las matrículas. Intenta
                  nuevamente.
                </AlertDescription>
              </Alert>
            )}

            {!isLoading && !isError && data && (
              <>
                <EnrollmentTable enrollments={data.data} />

                {data.meta.total > 0 && (
                  <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {data.meta.from ?? 0}
                      {" - "}
                      {data.meta.to ?? 0}
                      {" de "}
                      {data.meta.total}
                      {" matrículas"}
                    </p>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={data.meta.current_page <= 1}
                        onClick={() =>
                          handlePageChange(data.meta.current_page - 1)
                        }
                      >
                        Anterior
                      </Button>

                      <span className="text-sm text-muted-foreground">
                        Página {data.meta.current_page} de {data.meta.last_page}
                      </span>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={data.meta.current_page >= data.meta.last_page}
                        onClick={() =>
                          handlePageChange(data.meta.current_page + 1)
                        }
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
      )}
    </div>
  );
}
