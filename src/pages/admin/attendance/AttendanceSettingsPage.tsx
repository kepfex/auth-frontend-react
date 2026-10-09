import {
  useState,
} from "react";

import {
  AlertCircle,
  CalendarClock,
  Plus,
} from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Skeleton,
} from "@/components/ui/skeleton";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  AttendanceScheduleCard,
} from "@/features/attendance-schedules/components/AttendanceScheduleCard";

import {
  AttendanceScheduleFormSheet,
} from "@/features/attendance-schedules/components/AttendanceScheduleFormSheet";

import {
  useAttendanceSchedules,
} from "@/features/attendance-schedules/hooks/useAttendanceSchedules";

import type {
  AttendanceSchedule,
} from "@/features/attendance-schedules/types/attendance-schedule.types";

import {
  useAppContextStore,
} from "@/store/app-context.store";

export function AttendanceSettingsPage() {
  const academicYear =
    useAppContextStore(
      (state) =>
        state.academicYear,
    );

  const educationalLevel =
    useAppContextStore(
      (state) =>
        state.educationalLevel,
    );

  const [
    sheetOpen,
    setSheetOpen,
  ] =
    useState(
      false,
    );

  const [
    editingSchedule,
    setEditingSchedule,
  ] =
    useState<
      AttendanceSchedule | null
    >(
      null,
    );

  const {
    data,
    isLoading,
    isError,
  } =
    useAttendanceSchedules({
      academic_year_id:
        academicYear?.id,

      educational_level_id:
        educationalLevel?.id,

      schedule_type:
        "regular",

      per_page:
        100,
    });

  const schedules =
    data?.data ??
    [];

  const levelSchedules =
    schedules.filter(
      (
        schedule,
      ) =>
        schedule.grade_section_id ===
        null,
    );

  const classroomSchedules =
    schedules.filter(
      (
        schedule,
      ) =>
        schedule.grade_section_id !==
        null,
    );

  const handleCreate =
    () => {
      setEditingSchedule(
        null,
      );

      setSheetOpen(
        true,
      );
    };

  const handleEdit =
    (
      schedule: AttendanceSchedule,
    ) => {
      setEditingSchedule(
        schedule,
      );

      setSheetOpen(
        true,
      );
    };

  const handleSheetChange =
    (
      open: boolean,
    ) => {
      setSheetOpen(
        open,
      );

      if (!open) {
        setEditingSchedule(
          null,
        );
      }
    };

  const hasContext =
    Boolean(
      academicYear &&
        educationalLevel,
    );

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarClock className="size-6" />

            <h1 className="text-2xl font-semibold tracking-tight">
              Configuración de asistencia
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Administra horarios, jornadas y excepciones
            del calendario de asistencia.
          </p>

          {hasContext && (
            <p className="mt-2 text-sm font-medium">
              {academicYear?.name}
              {" · "}
              {educationalLevel?.name}
            </p>
          )}
        </div>

        <Button
          type="button"
          disabled={
            !hasContext
          }
          onClick={
            handleCreate
          }
        >
          <Plus className="size-4" />
          Nuevo horario
        </Button>
      </div>

      {/* Sin contexto */}

      {!hasContext ? (
        <Alert>
          <AlertCircle className="size-4" />

          <AlertTitle>
            Selecciona año y nivel educativo
          </AlertTitle>

          <AlertDescription>
            Utiliza los selectores del contexto de
            trabajo para administrar los horarios
            correspondientes.
          </AlertDescription>
        </Alert>
      ) : (
        <Tabs
          defaultValue="schedules"
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="schedules">
              Horarios
            </TabsTrigger>

            {/*
             * Se habilitará en 7H-3.
             */}
            <TabsTrigger
              value="exceptions"
              disabled
            >
              Calendario y excepciones
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="schedules"
            className="space-y-8"
          >
            {/* Error */}

            {isError && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />

                <AlertTitle>
                  No se pudieron cargar los horarios
                </AlertTitle>

                <AlertDescription>
                  Intenta nuevamente o verifica la
                  conexión con el servidor.
                </AlertDescription>
              </Alert>
            )}

            {/* Loading */}

            {isLoading && (
              <div className="grid gap-4 lg:grid-cols-2">
                <Skeleton className="h-64 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
              </div>
            )}

            {!isLoading &&
              !isError && (
                <>
                  {/* Horarios generales */}

                  <section className="space-y-4">
                    <div>
                      <h2 className="text-lg font-semibold">
                        Horario general del nivel
                      </h2>

                      <p className="text-sm text-muted-foreground">
                        Se aplica a las aulas que no
                        tengan un horario específico.
                      </p>
                    </div>

                    {levelSchedules.length >
                    0 ? (
                      <div className="grid gap-4 xl:grid-cols-2">
                        {levelSchedules.map(
                          (
                            schedule,
                          ) => (
                            <AttendanceScheduleCard
                              key={
                                schedule.id
                              }
                              schedule={
                                schedule
                              }
                              onEdit={
                                handleEdit
                              }
                            />
                          ),
                        )}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                          <CalendarClock className="mb-4 size-10 text-muted-foreground" />

                          <h3 className="font-medium">
                            Sin horario general
                          </h3>

                          <p className="mt-1 max-w-md text-sm text-muted-foreground">
                            Todavía no existe un horario
                            regular para{" "}
                            {
                              educationalLevel?.name
                            }{" "}
                            en{" "}
                            {
                              academicYear?.name
                            }.
                          </p>

                          <Button
                            type="button"
                            className="mt-5"
                            onClick={
                              handleCreate
                            }
                          >
                            <Plus className="size-4" />
                            Crear horario
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </section>

                  {/* Horarios por aula */}

                  <section className="space-y-4">
                    <div>
                      <h2 className="text-lg font-semibold">
                        Horarios específicos por aula
                      </h2>

                      <p className="text-sm text-muted-foreground">
                        Estos horarios tienen prioridad
                        sobre el horario general del nivel.
                      </p>
                    </div>

                    {classroomSchedules.length >
                    0 ? (
                      <div className="grid gap-4 xl:grid-cols-2">
                        {classroomSchedules.map(
                          (
                            schedule,
                          ) => (
                            <AttendanceScheduleCard
                              key={
                                schedule.id
                              }
                              schedule={
                                schedule
                              }
                              onEdit={
                                handleEdit
                              }
                            />
                          ),
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed p-8 text-center">
                        <p className="text-sm text-muted-foreground">
                          No existen horarios específicos
                          por aula. Todas utilizarán el
                          horario general correspondiente.
                        </p>
                      </div>
                    )}
                  </section>
                </>
              )}
          </TabsContent>
        </Tabs>
      )}

      <AttendanceScheduleFormSheet
        open={
          sheetOpen
        }
        onOpenChange={
          handleSheetChange
        }
        schedule={
          editingSchedule
        }
      />
    </div>
  );
}