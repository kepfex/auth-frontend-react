import {
  Building2,
  CalendarOff,
  Clock3,
  Pencil,
  School,
  University,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { AttendanceCalendarException } from "../types/attendance-schedule.types";

interface Props {
  exception: AttendanceCalendarException;

  onEdit: (exception: AttendanceCalendarException) => void;
}

export function AttendanceCalendarExceptionCard({ exception, onEdit }: Props) {
  const ScopeIcon =
    exception.scope === "institution"
      ? University
      : exception.scope === "level"
        ? School
        : Building2;

  const scopeLabel =
    exception.scope === "institution"
      ? "Toda la institución"
      : exception.scope === "level"
        ? "Nivel educativo"
        : "Aula específica";

  const schedule = exception.override_schedule;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {exception.type === "non_working" ? (
            <CalendarOff className="size-5 text-muted-foreground" />
          ) : (
            <Clock3 className="size-5 text-muted-foreground" />
          )}

          <CardTitle>{exception.name}</CardTitle>
        </div>

        <CardDescription className="flex flex-wrap gap-2">
          <Badge
            variant={exception.type === "non_working" ? "secondary" : "outline"}
          >
            {exception.type_label}
          </Badge>

          <Badge variant="outline">{exception.date}</Badge>

          <Badge variant={exception.is_active ? "secondary" : "outline"}>
            {exception.is_active ? "Activo" : "Inactivo"}
          </Badge>
        </CardDescription>

        <CardAction>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit(exception)}
          >
            <Pencil className="size-4" />
            Editar
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <ScopeIcon className="size-4 text-muted-foreground" />

          <span>{scopeLabel}</span>
        </div>

        {exception.reason && (
          <p className="text-sm text-muted-foreground">{exception.reason}</p>
        )}

        {schedule && (
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="font-medium">{schedule.name}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {[...schedule.events]
                .sort((a, b) => a.sequence - b.sequence)
                .map((event) => (
                  <Badge key={event.id} variant="outline">
                    {event.expected_time} ·{" "}
                    {event.event_type === "entry" ? "Entrada" : "Salida"}
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
