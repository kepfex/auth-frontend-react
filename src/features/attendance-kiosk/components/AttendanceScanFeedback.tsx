import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  LogIn,
  LogOut,
  ScanLine,
  UserRound,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { cn } from "@/lib/utils";

import type { AttendanceScanResponse } from "../types/attendance-scan.types";

interface AttendanceScanFeedbackProps {
  result: AttendanceScanResponse | null;

  processing?: boolean;

  error?: string | null;
}

export function AttendanceScanFeedback({
  result,
  processing = false,
  error = null,
}: AttendanceScanFeedbackProps) {
  if (processing) {
    return (
      <Card className="flex min-h-80 items-center justify-center">
        <CardContent className="flex flex-col items-center gap-4 text-center">
          <ScanLine className="size-14 animate-pulse text-muted-foreground" />

          <div>
            <p className="text-xl font-semibold">Verificando asistencia</p>

            <p className="mt-1 text-muted-foreground">Espera un momento...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex min-h-80 items-center justify-center border-destructive">
        <CardContent className="flex flex-col items-center gap-4 text-center">
          <XCircle className="size-16 text-destructive" />

          <div>
            <p className="text-xl font-semibold">No se pudo conectar</p>

            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {error}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="flex min-h-80 items-center justify-center">
        <CardContent className="flex flex-col items-center gap-4 text-center">
          <ScanLine className="size-16 text-muted-foreground" />

          <div>
            <p className="text-xl font-semibold">Esperando código QR</p>

            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Acerca el carnet del estudiante a la cámara para registrar su
              asistencia.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const attendance = result.attendance;

  const student = result.student;

  const isAccepted = result.accepted;

  const isWarning =
    attendance?.status === "late" ||
    attendance?.status === "early" ||
    result.result === "duplicate";

  const ResultIcon = isAccepted
    ? isWarning
      ? AlertTriangle
      : CheckCircle2
    : result.result === "duplicate"
      ? AlertTriangle
      : XCircle;

  const EventIcon = attendance?.event_type === "exit" ? LogOut : LogIn;

  const fullName = student
    ? [student.first_names, student.paternal_surname, student.maternal_surname]
        .filter(Boolean)
        .join(" ")
    : null;

  return (
    <Card
      className={cn(
        "min-h-80 overflow-hidden",
        isAccepted && !isWarning && "border-emerald-500/60",
        isWarning && "border-amber-500/60",
        !isAccepted && !isWarning && "border-destructive/60",
      )}
    >
      <CardHeader className="text-center">
        <div
          className={cn(
            "mx-auto mb-2 flex size-20 items-center justify-center rounded-full",
            isAccepted && !isWarning && "bg-emerald-500/10 text-emerald-600",
            isWarning && "bg-amber-500/10 text-amber-600",
            !isAccepted && !isWarning && "bg-destructive/10 text-destructive",
          )}
        >
          <ResultIcon className="size-11" />
        </div>

        <CardTitle className="text-2xl">{result.message}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {student && (
          <div className="flex items-center gap-4 rounded-xl bg-muted/40 p-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-background">
              <UserRound className="size-6" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{fullName}</p>

              {student.student_code && (
                <p className="text-sm text-muted-foreground">
                  {student.student_code}
                </p>
              )}
            </div>
          </div>
        )}

        {attendance && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Marcación
              </p>

              <div className="mt-2 flex items-center gap-2">
                <EventIcon className="size-5" />

                <span className="text-lg font-semibold">
                  {attendance.event_type_label}
                </span>
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Estado
              </p>

              <div className="mt-2 flex items-center gap-2">
                <Clock3 className="size-5" />

                <Badge
                  variant={
                    attendance.status === "on_time" ? "secondary" : "outline"
                  }
                >
                  {attendance.status_label}
                </Badge>
              </div>
            </div>

            {attendance.expected_time && (
              <div className="rounded-xl border p-4">
                <p className="text-xs text-muted-foreground">Hora esperada</p>

                <p className="mt-1 text-xl font-semibold">
                  {attendance.expected_time}
                </p>
              </div>
            )}

            <div className="rounded-xl border p-4">
              <p className="text-xs text-muted-foreground">Diferencia</p>

              <p className="mt-1 text-xl font-semibold">
                {attendance.difference_minutes === null
                  ? "—"
                  : `${attendance.difference_minutes > 0 ? "+" : ""}${
                      attendance.difference_minutes
                    } min`}
              </p>
            </div>
          </div>
        )}

        {!result.accepted && result.reason && (
          <p className="text-center text-xs text-muted-foreground">
            Código: {result.reason}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
