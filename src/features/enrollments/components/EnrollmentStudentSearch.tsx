import { Search, UserRound } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import { useDebounce } from "@/hooks/useDebounce";

import { useStudents } from "@/features/students/hooks/useStudents";

import type { Student } from "@/features/students/types/student.types";

interface EnrollmentStudentSearchProps {
  search: string;

  selectedStudent: Student | null;

  disabled?: boolean;

  onSearchChange: (value: string) => void;

  onSelect: (student: Student) => void;

  onClear: () => void;
}

export function EnrollmentStudentSearch({
  search,
  selectedStudent,
  disabled = false,
  onSearchChange,
  onSelect,
  onClear,
}: EnrollmentStudentSearchProps) {
  const debouncedSearch = useDebounce(search.trim(), 400);

  const canSearch = debouncedSearch.length >= 2;

  const { data, isLoading, isFetching } = useStudents(
    {
      search: debouncedSearch,
      page: 1,
      per_page: 8,
    },
    canSearch && !selectedStudent,
  );

  // ───────────────────────────────────────────────────
  // Estudiante seleccionado
  // ───────────────────────────────────────────────────

  if (selectedStudent) {
    const person = selectedStudent.person;

    const fullName = [
      person.paternal_surname,
      person.maternal_surname,
      person.first_names,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <UserRound className="size-5 text-primary" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{fullName}</p>

                <Badge
                  variant={
                    selectedStudent.status === "activo"
                      ? "default"
                      : "secondary"
                  }
                >
                  {selectedStudent.status}
                </Badge>
              </div>

              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>
                  {person.document_type}: {person.document_number}
                </span>

                <span>Código: {selectedStudent.student_code}</span>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={onClear}
          >
            Cambiar estudiante
          </Button>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────
  // Buscador
  // ───────────────────────────────────────────────────

  const students = data?.data ?? [];

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={search}
          disabled={disabled}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por DNI, código, nombres o apellidos..."
          className="pl-9"
        />
      </div>

      {search.trim().length > 0 && search.trim().length < 2 && (
        <p className="text-xs text-muted-foreground">
          Escribe al menos 2 caracteres para buscar.
        </p>
      )}

      {canSearch && (isLoading || isFetching) && (
        <div className="space-y-2">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      )}

      {canSearch && !isLoading && !isFetching && students.length === 0 && (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <UserRound className="mx-auto mb-2 size-8 text-muted-foreground" />

          <p className="text-sm font-medium">No se encontraron estudiantes</p>

          <p className="mt-1 text-xs text-muted-foreground">
            Intenta con DNI, código, nombres o apellidos.
          </p>
        </div>
      )}

      {canSearch && !isLoading && !isFetching && students.length > 0 && (
        <div className="divide-y rounded-lg border">
          {students.map((student) => {
            const person = student.person;

            const fullName = [
              person.paternal_surname,
              person.maternal_surname,
              person.first_names,
            ]
              .filter(Boolean)
              .join(" ");

            const canSelect = student.status === "activo";

            return (
              <button
                key={student.id}
                type="button"
                disabled={!canSelect || disabled}
                onClick={() => onSelect(student)}
                className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{fullName}</p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {person.document_type} {person.document_number}
                    {" · "}
                    {student.student_code}
                  </p>
                </div>

                <Badge variant={canSelect ? "outline" : "secondary"}>
                  {student.status}
                </Badge>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
