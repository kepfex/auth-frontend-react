import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Classroom } from "../types/classroom.types";
import { MoreVertical, Pencil, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ClassroomCardProps {
  classroom: Classroom;
  onEdit: (classroom: Classroom) => void;
}

export const ClassroomCard = ({ classroom, onEdit }: ClassroomCardProps) => {
  return (
    <Card className={!classroom.is_active ? "opacity-60" : undefined}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base">
              Sección {classroom.section.name}
            </CardTitle>

            <Badge variant={classroom.is_active ? "default" : "secondary"}>
              {classroom.is_active ? "Activa" : "Inactiva"}
            </Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(classroom)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar aula
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Turno</span>

          <span className="capitalize font-medium">{classroom.shift}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-4 w-4" />
            Capacidad
          </span>

          <span className="font-medium">{classroom.capacity}</span>
        </div>
      </CardContent>
    </Card>
  );
};
