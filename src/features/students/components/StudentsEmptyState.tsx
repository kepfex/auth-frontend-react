import {
  SearchX,
  UserPlus,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

interface StudentsEmptyStateProps {
  hasFilters: boolean;
  onCreate: () => void;
  onClearFilters: () => void;
}

export const StudentsEmptyState = ({
  hasFilters,
  onCreate,
  onClearFilters,
}: StudentsEmptyStateProps) => {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <SearchX className="size-5 text-muted-foreground" />
      </div>

      <h3 className="font-semibold">
        {hasFilters
          ? "No encontramos estudiantes"
          : "Aún no hay estudiantes registrados"}
      </h3>

      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {hasFilters
          ? "Prueba modificando los criterios de búsqueda o limpiando los filtros."
          : "Registra al primer estudiante para comenzar a gestionar sus datos."}
      </p>

      <div className="mt-5">
        {hasFilters ? (
          <Button
            variant="outline"
            onClick={onClearFilters}
          >
            Limpiar filtros
          </Button>
        ) : (
          <Button onClick={onCreate}>
            <UserPlus className="size-4" />
            Nuevo estudiante
          </Button>
        )}
      </div>
    </div>
  );
};