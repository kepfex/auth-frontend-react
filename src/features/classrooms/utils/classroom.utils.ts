import type { Classroom } from "../types/classroom.types";

export const groupClassroomsByGrade = (
  classrooms: Classroom[],
): Map<number, Classroom[]> => {
  const grouped = new Map<number, Classroom[]>();

  for (const classroom of classrooms) {
    const gradeId = classroom.grade.id;

    const current = grouped.get(gradeId) ?? [];

    current.push(classroom);

    grouped.set(gradeId, current);
  }

  return grouped;
};

export const sortClassrooms = (classrooms: Classroom[]): Classroom[] =>
  [...classrooms].sort((a, b) => {
    const sectionCompare = a.section.name.localeCompare(b.section.name, "es", {
      numeric: true,
    });

    if (sectionCompare !== 0) {
      return sectionCompare;
    }

    return a.shift.localeCompare(b.shift, "es");
  });
