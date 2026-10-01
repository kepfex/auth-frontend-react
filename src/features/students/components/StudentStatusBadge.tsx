import { Badge } from "@/components/ui/badge";

import type { StudentStatus } from "../types/student.types";

interface StudentStatusBadgeProps {
  status: StudentStatus;
}

const STATUS_LABELS: Record<StudentStatus, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
  egresado: "Egresado",
};

export const StudentStatusBadge = ({ status }: StudentStatusBadgeProps) => {
  return (
    <Badge variant={status === "activo" ? "default" : "secondary"}>
      {STATUS_LABELS[status]}
    </Badge>
  );
};
