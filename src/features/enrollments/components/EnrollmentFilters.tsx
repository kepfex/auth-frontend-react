import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { EnrollmentStatusOption } from "../types/enrollment-catalog.types";

interface FilterOption {
  id: number;
  name: string;
}

interface EnrollmentFiltersProps {
  search: string;

  gradeId?: number;
  classroomId?: number;
  status?: string;

  grades: FilterOption[];
  classrooms: FilterOption[];

  statuses: EnrollmentStatusOption[];

  onSearchChange: (value: string) => void;

  onGradeChange: (value?: number) => void;

  onClassroomChange: (value?: number) => void;

  onStatusChange: (value?: string) => void;

  onClear: () => void;
}

export function EnrollmentFilters({
  search,

  gradeId,
  classroomId,
  status,

  grades,
  classrooms,
  statuses,

  onSearchChange,
  onGradeChange,
  onClassroomChange,
  onStatusChange,
  onClear,
}: EnrollmentFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por DNI, código, nombres o apellidos..."
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={gradeId?.toString() ?? "all"}
          onValueChange={(value) =>
            onGradeChange(value === "all" ? undefined : Number(value))
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Grado" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Todos los grados</SelectItem>

            {grades.map((grade) => (
              <SelectItem key={grade.id} value={grade.id.toString()}>
                {grade.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={classroomId?.toString() ?? "all"}
          disabled={!gradeId}
          onValueChange={(value) =>
            onClassroomChange(value === "all" ? undefined : Number(value))
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Aula" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Todas las aulas</SelectItem>

            {classrooms.map((classroom) => (
              <SelectItem key={classroom.id} value={classroom.id.toString()}>
                {classroom.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status ?? "all"}
          onValueChange={(value) =>
            onStatusChange(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>

            {statuses.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="button" variant="ghost" onClick={onClear}>
          <X className="size-4" />
          Limpiar
        </Button>
      </div>
    </div>
  );
}
