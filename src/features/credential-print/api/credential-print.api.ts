import { apiClient } from "@/api/client";

import type { ClassroomCredentialData } from "../types/credential-print.types";

export const credentialPrintApi = {
  getStudents: async (
    academicYearId: number,
    classroomId: number,
  ): Promise<ClassroomCredentialData> => {
    const { data } = await apiClient.get<{
      data: ClassroomCredentialData;
    }>("/credential-print/students", {
      params: {
        academic_year_id: academicYearId,
        grade_section_id: classroomId,
      },
    });

    return data.data;
  },
};
