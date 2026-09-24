import type { Grade } from "@/features/academic-structure/types/academic-structure.types";
import type { Classroom } from "../types/classroom.types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ClassroomCard } from "./ClassroomCard";

interface GradeClassroomsProps {
  grade: Grade;
  classrooms: Classroom[];

  onCreate: (grade: Grade) => void;

  onEdit: (classroom: Classroom) => void;
}

export const GradeClassrooms = ({
  grade,
  classrooms,
  onCreate,
  onEdit,
}: GradeClassroomsProps) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold">{grade.name}</h3>

          <p className="text-sm text-muted-foreground">
            {classrooms.length === 1
              ? "1 aula habilitada"
              : `${classrooms.length} aulas habilitadas`}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => onCreate(grade)}>
          <Plus className="mr-2 h-4 w-4" />
          Habilitar sección
        </Button>
      </div>

      {classrooms.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No hay aulas habilitadas para este grado.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {classrooms.map((classroom) => (
            <ClassroomCard
              key={classroom.id}
              classroom={classroom}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </section>
  );
};
