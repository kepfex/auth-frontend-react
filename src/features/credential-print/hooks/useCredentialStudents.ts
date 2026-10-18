import { useQuery } from "@tanstack/react-query";

import { credentialPrintApi } from "../api/credential-print.api";

export const credentialPrintKeys = {
  classroom: (academicYearId: number, classroomId: number) =>
    ["credential-print", academicYearId, classroomId] as const,
};

export function useCredentialStudents(
  academicYearId?: number,
  classroomId?: number,
) {
  return useQuery({
    queryKey: credentialPrintKeys.classroom(
      academicYearId ?? 0,
      classroomId ?? 0,
    ),

    queryFn: () =>
      credentialPrintApi.getStudents(academicYearId!, classroomId!),

    enabled: Boolean(academicYearId && classroomId),

    // Consultar nuevamente al entrar a preparar impresión
    // para evitar utilizar estados QR antiguos.
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}
