import { useState } from "react";

import { AlertCircle, CalendarOff, Plus } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";

import { useAppContextStore } from "@/store/app-context.store";

import { AttendanceCalendarExceptionCard } from "./AttendanceCalendarExceptionCard";

import { AttendanceCalendarExceptionFormSheet } from "./AttendanceCalendarExceptionFormSheet";

import { useAttendanceCalendarExceptions } from "../hooks/useAttendanceCalendarExceptions";

import type { AttendanceCalendarException } from "../types/attendance-schedule.types";

export function AttendanceCalendarExceptionsPanel() {
  const academicYear = useAppContextStore((state) => state.academicYear);

  const educationalLevel = useAppContextStore(
    (state) => state.educationalLevel,
  );

  const [sheetOpen, setSheetOpen] = useState(false);

  const [editingException, setEditingException] =
    useState<AttendanceCalendarException | null>(null);

  /*
   * Consultamos todas las excepciones del año
   * para poder incluir también las institucionales.
   */
  const { data, isLoading, isError } = useAttendanceCalendarExceptions({
    academic_year_id: academicYear?.id,

    per_page: 100,
  });

  const exceptions = (data?.data ?? [])
    .filter(
      (exception) =>
        exception.educational_level_id === null ||
        exception.educational_level_id === educationalLevel?.id,
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  const handleCreate = () => {
    setEditingException(null);

    setSheetOpen(true);
  };

  const handleEdit = (exception: AttendanceCalendarException) => {
    setEditingException(exception);

    setSheetOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setSheetOpen(open);

    if (!open) {
      setEditingException(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Calendario y excepciones</h2>

          <p className="text-sm text-muted-foreground">
            Gestiona feriados, suspensiones y horarios extraordinarios sin
            modificar los horarios regulares.
          </p>
        </div>

        <Button type="button" onClick={handleCreate}>
          <Plus className="size-4" />
          Nueva excepción
        </Button>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />

          <AlertTitle>No se pudieron cargar las excepciones</AlertTitle>

          <AlertDescription>
            Verifica la conexión con el servidor.
          </AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-52 rounded-xl" />
          <Skeleton className="h-52 rounded-xl" />
        </div>
      )}

      {!isLoading && !isError && exceptions.length > 0 && (
        <div className="grid gap-4 xl:grid-cols-2">
          {exceptions.map((exception) => (
            <AttendanceCalendarExceptionCard
              key={exception.id}
              exception={exception}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {!isLoading && !isError && exceptions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarOff className="mb-4 size-10 text-muted-foreground" />

            <h3 className="font-medium">Sin excepciones registradas</h3>

            <p className="mt-1 max-w-lg text-sm text-muted-foreground">
              El calendario utilizará exclusivamente los horarios regulares
              mientras no existan excepciones.
            </p>

            <Button className="mt-5" type="button" onClick={handleCreate}>
              <Plus className="size-4" />
              Crear excepción
            </Button>
          </CardContent>
        </Card>
      )}

      <AttendanceCalendarExceptionFormSheet
        open={sheetOpen}
        onOpenChange={handleOpenChange}
        exception={editingException}
      />
    </div>
  );
}
