import {
    UsersRound,
} from "lucide-react";

import {
    GuardianCard,
} from "./GuardianCard";

import type {
    StudentGuardian,
} from "../../types/guardian.types";

interface GuardianListProps {
    guardians:
    StudentGuardian[];

    onEdit: (
        relation: StudentGuardian,
    ) => void;

    onRemove: (
        relation: StudentGuardian,
    ) => void;
}

export const GuardianList = ({
    guardians,
    onEdit,
    onRemove,
}: GuardianListProps) => {
    if (guardians.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center">
                <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
                    <UsersRound className="size-5 text-muted-foreground" />
                </div>

                <p className="font-medium">
                    Sin apoderados vinculados
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                    Agrega al menos un apoderado para asociarlo al estudiante.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {guardians.map(
                (relation) => (
                    <GuardianCard
                        key={relation.id}
                        relation={relation}
                        onEdit={onEdit}
                        onRemove={onRemove}
                    />
                ),
            )}
        </div>
    );
};