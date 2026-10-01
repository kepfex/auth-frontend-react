import {
  useState,
} from "react";

import {
  AlertCircle,
  RefreshCw,
  UserPlus,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


import {
  useDebounce,
} from "@/hooks/useDebounce";
import type { Student, StudentStatus } from "@/features/students/types/student.types";
import { useStudents } from "@/features/students/hooks/useStudents";
import { StudentFilters } from "@/features/students/components/StudentFilters";
import { StudentTableSkeleton } from "@/features/students/components/StudentTableSkeleton";
import { StudentsEmptyState } from "@/features/students/components/StudentsEmptyState";
import { StudentTable } from "@/features/students/components/StudentTable";
import { StudentPagination } from "@/features/students/components/StudentPagination";


type StatusFilter =
  | StudentStatus
  | "all";

const DEFAULT_PER_PAGE = 15;

export const StudentsPage = () => {
  const navigate = useNavigate();

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<StatusFilter>("all");

  const [page, setPage] =
    useState(1);

  const debouncedSearch =
    useDebounce(search, 400);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useStudents({
    page,
    per_page: DEFAULT_PER_PAGE,

    search:
      debouncedSearch.trim() ||
      undefined,

    status:
      status === "all"
        ? undefined
        : status,
  });

  const handleSearchChange = (
    value: string,
  ) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (
    value: StatusFilter,
  ) => {
    setStatus(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("all");
    setPage(1);
  };

  const handleCreate = () => {
    navigate("/admin/students/new");
  };

  const handleView = (
    student: Student,
  ) => {
    navigate(
      `/admin/students/${student.id}`,
    );
  };

  const handleEdit = (
    student: Student,
  ) => {
    navigate(
      `/admin/students/${student.id}/edit`,
    );
  };

  const hasFilters =
    search.trim() !== "" ||
    status !== "all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Estudiantes
          </h1>

          <p className="text-sm text-muted-foreground">
            Gestiona la información de los estudiantes registrados.
          </p>
        </div>

        <Button
          onClick={handleCreate}
        >
          <UserPlus className="size-4" />
          Nuevo estudiante
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Estudiantes registrados
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <StudentFilters
            search={search}
            status={status}
            onSearchChange={
              handleSearchChange
            }
            onStatusChange={
              handleStatusChange
            }
            onClear={
              handleClearFilters
            }
          />

          {isLoading ? (
            <StudentTableSkeleton />
          ) : isError ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <AlertCircle className="mb-3 size-8 text-muted-foreground" />

              <h3 className="font-semibold">
                No se pudieron cargar los estudiantes
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Ocurrió un problema al consultar la información.
              </p>

              <Button
                variant="outline"
                className="mt-4"
                onClick={() =>
                  refetch()
                }
              >
                <RefreshCw className="size-4" />
                Reintentar
              </Button>
            </div>
          ) : !data ||
            data.data.length === 0 ? (
            <StudentsEmptyState
              hasFilters={
                hasFilters
              }
              onCreate={
                handleCreate
              }
              onClearFilters={
                handleClearFilters
              }
            />
          ) : (
            <>
              <div className="relative">
                {isFetching && (
                  <div className="absolute inset-x-0 top-0 z-10 h-0.5 animate-pulse bg-primary" />
                )}

                <StudentTable
                  students={data.data}
                  onView={
                    handleView
                  }
                  onEdit={
                    handleEdit
                  }
                />
              </div>

              <StudentPagination
                currentPage={
                  data.meta.current_page
                }
                lastPage={
                  data.meta.last_page
                }
                from={data.meta.from}
                to={data.meta.to}
                total={data.meta.total}
                onPageChange={
                  setPage
                }
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};