import { Building2, CalendarRange, Clock3, Pencil, School } from "lucide-react";

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

import type { AttendanceSchedule } from "../types/attendance-schedule.types";

interface AttendanceScheduleCardProps {
  schedule: AttendanceSchedule;

  onEdit: (schedule: AttendanceSchedule) => void;
}

export function AttendanceScheduleCard({
  schedule,
  onEdit,
}: AttendanceScheduleCardProps) {
  const groupedEvents = schedule.events.reduce<
    Map<number, AttendanceSchedule["events"]>
  >((groups, event) => {
    const current = groups.get(event.day_of_week) ?? [];

    current.push(event);

    groups.set(event.day_of_week, current);

    return groups;
  }, new Map());

  const orderedDays = Array.from(groupedEvents.entries()).sort(
    ([dayA], [dayB]) => dayA - dayB,
  );

  const classroom = schedule.grade_section;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {classroom ? (
            <Building2 className="size-4 text-muted-foreground" />
          ) : (
            <School className="size-4 text-muted-foreground" />
          )}

          <CardTitle>{schedule.name}</CardTitle>
        </div>

        <CardDescription className="flex flex-wrap items-center gap-2 pt-1">
          <Badge variant={schedule.is_active ? "secondary" : "outline"}>
            {schedule.is_active ? "Activo" : "Inactivo"}
          </Badge>

          <Badge variant="outline">
            {classroom ? "Horario de aula" : "Horario general"}
          </Badge>
        </CardDescription>

        <CardAction>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit(schedule)}
          >
            <Pencil className="size-4" />
            Editar
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Scope */}

        <div className="grid gap-3 rounded-lg bg-muted/40 p-4 text-sm sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">Aplicación</span>

            <p className="mt-1 font-medium">
              {classroom
                ? `${classroom.grade.name} · ${classroom.section.name}`
                : (schedule.educational_level?.name ?? "Nivel educativo")}
            </p>

            {classroom && (
              <p className="text-xs text-muted-foreground">
                Turno {classroom.shift}
              </p>
            )}
          </div>

          <div>
            <span className="text-muted-foreground">Vigencia</span>

            <div className="mt-1 flex items-center gap-2 font-medium">
              <CalendarRange className="size-4 text-muted-foreground" />

              {schedule.valid_from}
              {" → "}
              {schedule.valid_until}
            </div>
          </div>
        </div>

        {/* Eventos */}

        <div className="space-y-3">
          {orderedDays.map(([day, events]) => {
            const ordered = [...events].sort((a, b) => a.sequence - b.sequence);

            return (
              <div
                key={day}
                className="grid gap-2 border-b pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[120px_1fr]"
              >
                <span className="font-medium">{ordered[0]?.day_label}</span>

                <div className="flex flex-wrap gap-2">
                  {ordered.map((event) => (
                    <Badge
                      key={event.id}
                      variant="outline"
                      className="gap-1.5 py-1"
                    >
                      <Clock3 className="size-3" />

                      {event.expected_time}

                      <span className="text-muted-foreground">
                        {event.event_type === "entry" ? "Entrada" : "Salida"}
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}

          {orderedDays.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Este horario todavía no tiene eventos configurados.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
