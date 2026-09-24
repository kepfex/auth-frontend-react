import type {
  EducationalLevel,
  Grade,
} from "@/features/academic-structure/types/academic-structure.types";
import type { Classroom } from "../types/classroom.types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { GradeClassrooms } from "./GradeClassrooms";
import { sortClassrooms } from "../utils/classroom.utils";

interface ClassroomsByLevelProps {
  levels: EducationalLevel[];
  grades: Grade[];
  classroomsByGrade: Map<number, Classroom[]>;

  onCreate: (grade: Grade) => void;

  onEdit: (classroom: Classroom) => void;
}

export const ClassroomByLevel = ({
  levels,
  grades,
  classroomsByGrade,
  onCreate,
  onEdit,
}: ClassroomsByLevelProps) => {
  return (
    <Accordion
      type="multiple"
      defaultValue={levels.map((level) => String(level.id))}
      className="space-y-4"
    >
      {levels.map((level) => {
        const levelGrades = grades
          .filter((grade) => grade.educational_level_id === level.id)
          .sort((a, b) => a.order - b.order);

        const classroomCount = levelGrades.reduce(
          (total, grade) =>
            total + (classroomsByGrade.get(grade.id) ?? []).length,
          0,
        );

        return (
          <AccordionItem
            key={level.id}
            value={String(level.id)}
            className="rounded-lg border px-4"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <p className="font-semibold">{level.name}</p>

                  <p className="text-xs text-muted-foreground">
                    {levelGrades.length} grados
                  </p>
                </div>

                <Badge variant="secondary">{classroomCount} aulas</Badge>
              </div>
            </AccordionTrigger>

            <AccordionContent>
              <div className="space-y-8 pt-2">
                {levelGrades.map((grade) => (
                  <GradeClassrooms
                    key={grade.id}
                    grade={grade}
                    classrooms={sortClassrooms(
                      classroomsByGrade.get(grade.id) ?? [],
                    )}
                    onCreate={onCreate}
                    onEdit={onEdit}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
