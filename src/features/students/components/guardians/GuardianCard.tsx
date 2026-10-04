import { Bell, MoreHorizontal, Star, UserRound, } from "lucide-react";
import { Badge, } from "@/components/ui/badge";
import { Button, } from "@/components/ui/button";
import { Card, CardContent, } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import type { StudentGuardian, } from "../../types/guardian.types";

interface GuardianCardProps {
    relation: StudentGuardian;

    onEdit: (
        relation: StudentGuardian,
    ) => void;

    onRemove: (
        relation: StudentGuardian,
    ) => void;
}

export const GuardianCard = ({
    relation,
    onEdit,
    onRemove,
}: GuardianCardProps) => {
    const person =
        relation.guardian.person;

    const fullName = [
        person.first_names,
        person.paternal_surname,
        person.maternal_surname,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <Card>
            <CardContent className="flex items-start gap-4 p-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                    <UserRound className="size-5 text-muted-foreground" />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">
                            {fullName}
                        </p>

                        <Badge variant="secondary">
                            {
                                relation.relationship_label
                            }
                        </Badge>

                        {relation.is_primary && (
                            <Badge>
                                <Star className="size-3" />
                                Principal
                            </Badge>
                        )}
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {person.document_type}{" "}
                        {person.document_number}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                        {relation.guardian
                            .occupation && (
                                <span>
                                    {
                                        relation.guardian
                                            .occupation
                                    }
                                </span>
                            )}

                        {person.phone && (
                            <span>
                                {person.phone}
                            </span>
                        )}

                        {relation
                            .receives_notifications && (
                                <span className="flex items-center gap-1">
                                    <Bell className="size-3" />
                                    Recibe notificaciones
                                </span>
                            )}
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger
                        asChild
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                        >
                            <MoreHorizontal className="size-4" />

                            <span className="sr-only">
                                Acciones
                            </span>
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                    >
                        <DropdownMenuItem
                            onClick={() =>
                                onEdit(relation)
                            }
                        >
                            Editar relación
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() =>
                                onRemove(relation)
                            }
                        >
                            Desvincular
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
        </Card>
    );
};