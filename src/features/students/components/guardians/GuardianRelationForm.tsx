import {
    Controller,
    type Control,
} from "react-hook-form";

import {
    Label,
} from "@/components/ui/label";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Switch,
} from "@/components/ui/switch";

import type {
    GuardianCreateFormValues,
} from "../../schemas/guardian-create.schema";

import type {
    GuardianRelationshipOption,
} from "../../types/catalog.types";

interface GuardianRelationFormProps {
    control:
    Control<GuardianCreateFormValues>;

    options:
    GuardianRelationshipOption[];
}

export const GuardianRelationForm = ({
    control,
    options,
}: GuardianRelationFormProps) => {
    return (
        <div className="space-y-5">
            <Controller
                control={control}
                name="relation.relationship"
                render={({
                    field,
                    fieldState,
                }) => (
                    <div className="space-y-2">
                        <Label>
                            Parentesco *
                        </Label>

                        <Select
                            value={field.value}
                            onValueChange={
                                field.onChange
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar parentesco" />
                            </SelectTrigger>

                            <SelectContent>
                                {options.map(
                                    (option) => (
                                        <SelectItem
                                            key={
                                                option.value
                                            }
                                            value={
                                                option.value
                                            }
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>

                        {fieldState.error && (
                            <p className="text-sm text-destructive">
                                {
                                    fieldState
                                        .error.message
                                }
                            </p>
                        )}
                    </div>
                )}
            />

            <Controller
                control={control}
                name="relation.is_primary"
                render={({ field }) => (
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label>
                                Apoderado principal
                            </Label>

                            <p className="text-sm text-muted-foreground">
                                Será el contacto principal del estudiante.
                            </p>
                        </div>

                        <Switch
                            checked={field.value}
                            onCheckedChange={
                                field.onChange
                            }
                        />
                    </div>
                )}
            />

            <Controller
                control={control}
                name="relation.receives_notifications"
                render={({ field }) => (
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label>
                                Recibir notificaciones
                            </Label>

                            <p className="text-sm text-muted-foreground">
                                Permite enviar comunicaciones relacionadas con el estudiante.
                            </p>
                        </div>

                        <Switch
                            checked={field.value}
                            onCheckedChange={
                                field.onChange
                            }
                        />
                    </div>
                )}
            />
        </div>
    );
};