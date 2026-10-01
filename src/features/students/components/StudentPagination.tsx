import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

interface StudentPaginationProps {
  currentPage: number;
  lastPage: number;
  from: number | null;
  to: number | null;
  total: number;

  onPageChange: (
    page: number,
  ) => void;
}

export const StudentPagination = ({
  currentPage,
  lastPage,
  from,
  to,
  total,
  onPageChange,
}: StudentPaginationProps) => {
  if (total === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Mostrando{" "}
        <span className="font-medium">
          {from}
        </span>{" "}
        a{" "}
        <span className="font-medium">
          {to}
        </span>{" "}
        de{" "}
        <span className="font-medium">
          {total}
        </span>{" "}
        estudiantes
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() =>
            onPageChange(
              currentPage - 1,
            )
          }
        >
          <ChevronLeft className="size-4" />
          Anterior
        </Button>

        <span className="min-w-20 text-center text-sm">
          {currentPage} de {lastPage}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={
            currentPage >= lastPage
          }
          onClick={() =>
            onPageChange(
              currentPage + 1,
            )
          }
        >
          Siguiente
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
};