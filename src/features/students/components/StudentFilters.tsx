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

import type {
  StudentStatus,
} from "../types/student.types";

type StatusFilter =
  | StudentStatus
  | "all";

interface StudentFiltersProps {
  search: string;
  status: StatusFilter;

  onSearchChange: (
    value: string,
  ) => void;

  onStatusChange: (
    value: StatusFilter,
  ) => void;

  onClear: () => void;
}

export const StudentFilters = ({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onClear,
}: StudentFiltersProps) => {
  const hasFilters =
    search.trim() !== "" ||
    status !== "all";

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search
          className="
            absolute left-3 top-1/2
            size-4
            -translate-y-1/2
            text-muted-foreground
          "
        />

        <Input
          value={search}
          onChange={(event) =>
            onSearchChange(
              event.target.value,
            )
          }
          placeholder="Buscar por documento, nombres o código..."
          className="pl-9"
        />
      </div>

      <Select
        value={status}
        onValueChange={(value) =>
          onStatusChange(
            value as StatusFilter,
          )
        }
      >
        <SelectTrigger className="w-full md:w-45">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            Todos
          </SelectItem>

          <SelectItem value="activo">
            Activos
          </SelectItem>

          <SelectItem value="inactivo">
            Inactivos
          </SelectItem>

          <SelectItem value="egresado">
            Egresados
          </SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          type="button"
          variant="ghost"
          onClick={onClear}
        >
          <X className="size-4" />
          Limpiar
        </Button>
      )}
    </div>
  );
};