import { z } from "zod";

import {
    personSchema,
} from "./person.schema";

export const guardianRelationshipSchema =
    z.enum([
        "padre",
        "madre",
        "abuelo",
        "abuela",
        "tío",
        "tía",
        "hermano/a",
        "tutor_legal",
        "otro",
    ]);
export const guardianCreateSchema =
    z.object({
        person: personSchema,

        guardian: z.object({
            occupation: z
                .string()
                .max(
                    100,
                    "La ocupación no puede superar los 100 caracteres",
                )
                .optional(),

            is_active:
                z.boolean(),
        }),

        relation: z.object({
            relationship:
                guardianRelationshipSchema,

            is_primary:
                z.boolean(),

            receives_notifications:
                z.boolean(),
        }),
    });

export type GuardianCreateFormValues =
    z.infer<
        typeof guardianCreateSchema
    >;

export const GUARDIAN_CREATE_DEFAULT_VALUES:
    GuardianCreateFormValues = {
    person: {
        document_type: "DNI",
        document_number: "",
        first_names: "",
        paternal_surname: "",
        maternal_surname: "",
        phone: "",
        email: "",
        birth_date: "",
        address: "",
        sex: undefined,
        is_active: true,
    },

    guardian: {
        occupation: "",
        is_active: true,
    },

    relation: {
        relationship: guardianRelationshipSchema.options[0],
        is_primary: false,
        receives_notifications: true,
    },
};