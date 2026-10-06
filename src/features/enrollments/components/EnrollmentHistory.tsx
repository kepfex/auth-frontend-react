import { CalendarDays, School } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useStudentEnrollments } from "../hooks/useEnrollments";

import { EnrollmentStatusBadge } from "./EnrollmentStatusBadge";

interface EnrollmentHistoryProps {
  studentId: number;
}

export function EnrollmentHistory({ studentId }: EnrollmentHistoryProps) {
  const {
    data: enrollments = [],
    isLoading,
    isError,
  } = useStudentEnrollments(studentId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({
          length: 3,
        }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No se pudo cargar el historial</AlertTitle>

        <AlertDescription>
          Ocurrió un problema al consultar las matrículas del estudiante.
        </AlertDescription>
      </Alert>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-12 text-center">
        <CalendarDays className="mx-auto mb-3 size-8 text-muted-foreground" />

        <h3 className="font-medium">Sin matrículas registradas</h3>

        <p className="mt-1 text-sm text-muted-foreground">
          El estudiante todavía no cuenta con historial de matrículas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {enrollments.map((enrollment) => {
        const classroom = enrollment.grade_section;

        const grade = classroom.grade;

        const section = classroom.section;

        return (
          <Card key={enrollment.id} className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    Año {enrollment.academic_year.name}
                  </Badge>

                  <EnrollmentStatusBadge
                    status={enrollment.status}
                    label={enrollment.status_label}
                  />
                </div>

                <div className="flex items-start gap-3">
                  <School className="mt-0.5 size-5 text-muted-foreground" />

                  <div>
                    <p className="font-medium">
                      {grade.educational_level?.name}
                      {" · "}
                      {grade.name} {section.name}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Turno: {classroom.shift}
                    </p>
                  </div>
                </div>

                {enrollment.observations && (
                  <p className="text-sm text-muted-foreground">
                    {enrollment.observations}
                  </p>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4" />

                  {new Intl.DateTimeFormat("es-PE").format(
                    new Date(`${enrollment.enrollment_date}T00:00:00`),
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
