import { Ban, CheckCircle2, CircleHelp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { StudentQrStatus } from "../types/student.types";

interface Props {
  status?: StudentQrStatus;
}

export function StudentQrStatusBadge({ status }: Props) {
  if (status === "active") {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-emerald-300 text-emerald-700 dark:text-emerald-400"
      >
        <CheckCircle2 className="size-3" />
        Activo
      </Badge>
    );
  }

  if (status === "inactive") {
    return (
      <Badge variant="destructive" className="gap-1">
        <Ban className="size-3" />
        Inactivo
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1">
      <CircleHelp className="size-3" />
      {status === "missing" ? "Sin QR" : "No disponible"}
    </Badge>
  );
}
