import {
  Eye,
  MoreHorizontal,
  Pencil,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { StudentStatusBadge } from "./StudentStatusBadge";

import type {
  Student,
} from "../types/student.types";

interface StudentTableProps {
  students: Student[];

  onView: (
    student: Student,
  ) => void;

  onEdit: (
    student: Student,
  ) => void;
}

const getFullName = (
  student: Student,
): string => {
  const { person } = student;

  return [
    person.paternal_surname,
    person.maternal_surname,
    person.first_names,
  ]
    .filter(Boolean)
    .join(" ");
};

export const StudentTable = ({
  students,
  onView,
  onEdit,
}: StudentTableProps) => {
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              Código
            </TableHead>

            <TableHead>
              Estudiante
            </TableHead>

            <TableHead>
              Documento
            </TableHead>

            <TableHead>
              Estado
            </TableHead>

            <TableHead className="w-17.5 text-right">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {students.map((student) => (
            <TableRow
              key={student.id}
              className="cursor-pointer"
              onClick={() =>
                onView(student)
              }
            >
              <TableCell className="font-medium">
                {student.student_code}
              </TableCell>

              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {getFullName(student)}
                  </span>

                  {student.person.email && (
                    <span className="text-sm text-muted-foreground">
                      {student.person.email}
                    </span>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex flex-col">
                  <span>
                    {
                      student.person
                        .document_number
                    }
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {
                      student.person
                        .document_type
                    }
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <StudentStatusBadge
                  status={student.status}
                />
              </TableCell>

              <TableCell
                className="text-right"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                    >
                      <MoreHorizontal className="size-4" />

                      <span className="sr-only">
                        Abrir acciones
                      </span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                  >
                    <DropdownMenuItem
                      onClick={() =>
                        onView(student)
                      }
                    >
                      <Eye className="size-4" />
                      Ver detalle
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() =>
                        onEdit(student)
                      }
                    >
                      <Pencil className="size-4" />
                      Editar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};