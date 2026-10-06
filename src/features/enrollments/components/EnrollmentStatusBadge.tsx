import { Badge } from "@/components/ui/badge";

import type { EnrollmentStatus } from "../types/enrollment.types";

interface EnrollmentStatusBadgeProps {
  status: EnrollmentStatus;
  label: string;
}

export function EnrollmentStatusBadge({
  status,
  label,
}: EnrollmentStatusBadgeProps) {
  const variant =
    status === "matriculado"
      ? "default"
      : status === "culminado"
        ? "secondary"
        : "outline";

  return <Badge variant={variant}>{label}</Badge>;
}
