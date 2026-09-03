import { Button } from "@/components/ui/button";
import { AcademicYearTable } from "@/features/academic-years/components/AcademicYearTable";
import { useAcademicYears } from "@/features/academic-years/hooks/useAcademicYears";
import type { AcademicYear } from "@/features/academic-years/types/academic-year.types";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";

export const AcademicYearsPage = () => {
  const [page] = useState(1);
  const [, setFormOpen] = useState(false);
  const [, setEditingYear] = useState<AcademicYear | null>(null);
  const [, setDeletingYear] = useState<AcademicYear | null>(null);

  const { data, isLoading, isError } = useAcademicYears(page);

  const handleEdit = (year: AcademicYear) => {
    setEditingYear(year);
    setFormOpen(true);
  };

  // const handleCloseForm = () => {
  //   setFormOpen(false);
  //   setEditingYear(null); // limpia al cerrar
  // };

  return (
    <div className="space-y-6">
      {/* Header de la página */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-phoenix-gold/10">
            <CalendarDays className="h-6 w-6 text-phoenix-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Años Académicos</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona los períodos lectivos del sistema
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setFormOpen(true)}
            className="h-9 px-4 rounded-lg bg-phoenix-gold hover:bg-phoenix-orange text-obsidian text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Nuevo Año
          </Button>
        </div>
      </div>

      {/* Contenido de la página */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-dashed border-border/60 text-muted-foreground gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-phoenix-gold border-t-transparent" />
          <span className="text-xs">Cargando registros...</span>
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center h-48 rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive text-sm font-medium">
          Error al cargar los datos. Intenta de nuevo.
        </div>
      )}

      {data && (
        <>
          <AcademicYearTable
            years={data.data}
            onEdit={handleEdit}
            onDelete={setDeletingYear}
          />

          {/* Paginación */}
          {data.meta.last_page > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Mostrando {data.meta.from}–{data.meta.to} de {data.meta.total}{" "}
                registros
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  disabled={page === 1}
                  // onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-2">
                  {page} / {data.meta.last_page}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  disabled={page === data.meta.last_page}
                  // onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
