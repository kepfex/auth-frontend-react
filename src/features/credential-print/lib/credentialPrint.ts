import type { CredentialStudent } from "../types/credential-print.types";

export const isCredentialEligible = (student: CredentialStudent): boolean =>
  student.student_status === "activo" && student.qr?.is_active === true;

export function hasCredentialChanged(a: CredentialStudent, b: CredentialStudent): boolean {
  return a.enrollment_id !== b.enrollment_id || a.student_code !== b.student_code ||
    a.full_name !== b.full_name || a.student_status !== b.student_status ||
    a.qr?.uuid !== b.qr?.uuid || a.qr?.is_active !== b.qr?.is_active;
}

export const CARDS_PER_PAGE = 8;
export function paginateCards<T>(items: T[]): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += CARDS_PER_PAGE) pages.push(items.slice(i, i + CARDS_PER_PAGE));
  return pages;
}

export function getPrintUrl(yearId: number, classroomId: number, ids: number[], yearName: string): string {
  const q = new URLSearchParams({
    year: String(yearId), classroom: String(classroomId), students: ids.join(","), yearName,
  });
  return `/admin/credentials/print?${q.toString()}`;
}
