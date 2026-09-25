import { useGrades, useLevels } from "@/features/academic-structure/hooks/useAcademicStructure";
import type { Grade } from "@/features/academic-structure/types/academic-structure.types";
import { ClassroomByLevel } from "@/features/classrooms/components/ClassroomByLevel";
import { ClassroomFormSheet } from "@/features/classrooms/components/ClassroomFormSheet";
import { useClassrooms } from "@/features/classrooms/hooks/useClassrooms";
import type { Classroom } from "@/features/classrooms/types/classroom.types";
import { groupClassroomsByGrade } from "@/features/classrooms/utils/classroom.utils";
import { useAppContextStore } from "@/store/app-context.store";
import { Building2 } from "lucide-react";
import { useMemo, useState } from "react";

export const ClassroomsPage = () => {
  const academicYear = useAppContextStore((state) => state.academicYear);

  const educationalLevel = useAppContextStore(
    (state) => state.educationalLevel,
  );

  const { data: levels = [], isLoading: isLoadingLevels } = useLevels();

  const { data: grades = [], isLoading: isLoadingGrades } = useGrades();

  const {
    data: classrooms = [],
    isLoading: isLoadingClassrooms,
    isError,
  } = useClassrooms();

  const [sheetOpen, setSheetOpen] = useState(false);

  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);

  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(
    null,
  );

  const visibleLevels = useMemo(() => {
    if (!educationalLevel) {
      return levels;
    }

    return levels.filter((level) => level.id === educationalLevel.id);
  }, [levels, educationalLevel]);

  const classroomsByGrade = useMemo(
    () => groupClassroomsByGrade(classrooms),
    [classrooms],
  );

  const handleCreate = (grade: Grade) => {
    setSelectedGrade(grade);
    setEditingClassroom(null);
    setSheetOpen(true);
  };

  const handleEdit = (classroom: Classroom) => {
    setSelectedGrade(classroom.grade);

    setEditingClassroom(classroom);

    setSheetOpen(true);
  };

  const handleSheetChange = (open: boolean) => {
    setSheetOpen(open);

    if (!open) {
      setSelectedGrade(null);
      setEditingClassroom(null);
    }
  };

  const isLoading = isLoadingLevels || isLoadingGrades || isLoadingClassrooms;

  if (!academicYear) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        Selecciona un año académico para gestionar las aulas.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Cargando aulas...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/50 p-6">
        No se pudieron cargar las aulas.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />

            <h1 className="text-2xl font-semibold">Aulas y Secciones</h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona las aulas habilitadas para{" "}
            <strong>{academicYear.name}</strong>
            {" · "}
            {educationalLevel?.name ?? "Todos los niveles"}
          </p>
        </div>
      </div>

      <ClassroomByLevel
        levels={visibleLevels}
        grades={grades}
        classroomsByGrade={classroomsByGrade}
        onCreate={handleCreate}
        onEdit={handleEdit}
      />

      <ClassroomFormSheet
        open={sheetOpen}
        onOpenChange={handleSheetChange}
        grade={selectedGrade}
        classroom={editingClassroom}
      />
    </div>
  );
};
