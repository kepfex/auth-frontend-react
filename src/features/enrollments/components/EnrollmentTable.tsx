import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Enrollment } from "../types/enrollment.types";

import { EnrollmentStatusBadge } from "./EnrollmentStatusBadge";

interface EnrollmentTableProps {
  enrollments: Enrollment[];

  onEdit: (enrollment: Enrollment) => void;
}

export function EnrollmentTable({ enrollments, onEdit }: EnrollmentTableProps) {
  if (enrollments.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        No se encontraron matrículas con los filtros seleccionados.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Estudiante</TableHead>

          <TableHead>Documento</TableHead>

          <TableHead>Año</TableHead>

          <TableHead>Grado / Aula</TableHead>

          <TableHead>Fecha</TableHead>

          <TableHead>Estado</TableHead>

          <TableHead className="w-20 text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {enrollments.map((enrollment) => {
          const person = enrollment.student.person;

          const grade = enrollment.grade_section.grade;

          const section = enrollment.grade_section.section;

          return (
            <TableRow key={enrollment.id}>
              <TableCell>
                <div className="font-medium">
                  {person.paternal_surname} {person.maternal_surname},{" "}
                  {person.first_names}
                </div>

                <div className="text-xs text-muted-foreground">
                  {enrollment.student.student_code}
                </div>
              </TableCell>

              <TableCell>
                <div>{person.document_number}</div>

                <div className="text-xs text-muted-foreground">
                  {person.document_type}
                </div>
              </TableCell>

              <TableCell>{enrollment.academic_year.name}</TableCell>

              <TableCell>
                <div className="font-medium">
                  {grade.name} {section.name}
                </div>

                <div className="text-xs text-muted-foreground">
                  {grade.educational_level?.name}
                  {" · "}
                  {enrollment.grade_section.shift}
                </div>
              </TableCell>

              <TableCell>
                {new Intl.DateTimeFormat("es-PE").format(
                  new Date(`${enrollment.enrollment_date}T00:00:00`),
                )}
              </TableCell>

              <TableCell>
                <EnrollmentStatusBadge
                  status={enrollment.status}
                  label={enrollment.status_label}
                />
              </TableCell>

              <TableCell className="text-right">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  title="Gestionar matrícula"
                  onClick={() => onEdit(enrollment)}
                >
                  <Pencil className="size-4" />

                  <span className="sr-only">Gestionar matrícula</span>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
