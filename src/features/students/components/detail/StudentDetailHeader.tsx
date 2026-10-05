import { useNavigate } from "react-router-dom";
import type { Student } from "../../types/student.types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import { StudentStatusBadge } from "../StudentStatusBadge";

interface StudentDetailHeaderProps {
  student: Student;
  onEdit?: () => void;
}

export const StudentDetailHeader = ({
  student,
  onEdit,
}: StudentDetailHeaderProps) => {
  const navigate = useNavigate();

  const person = student.person;

  const fullName = [
    person.first_names,
    person.paternal_surname,
    person.maternal_surname,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="ghost"
        className="px-0"
        onClick={() =>
          navigate("/admin/students")
        }
      >
        <ArrowLeft className="size-4" />

        Volver a estudiantes
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {fullName}
            </h1>

            <StudentStatusBadge
              status={student.status}
            />
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>
              {person.document_type}{" "}
              {person.document_number}
            </span>

            <span>·</span>

            <span>
              Código: {student.student_code}
            </span>
          </div>
        </div>

        {onEdit && (
          <Button
            variant="outline"
            onClick={onEdit}
          >
            <Pencil className="size-4" />

            Editar
          </Button>
        )}
      </div>
    </div>
  );
};