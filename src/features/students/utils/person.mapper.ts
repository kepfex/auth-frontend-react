import type {
    CreatePersonRequest,
    PersonFormValues,
} from "../types/person.types";

export const mapPersonFormToRequest = (
    person: PersonFormValues,
): CreatePersonRequest => ({
    document_type:
        person.document_type,

    document_number:
        person.document_number.trim(),

    first_names:
        person.first_names.trim(),

    paternal_surname:
        person.paternal_surname.trim(),

    maternal_surname:
        person.maternal_surname?.trim() ||
        null,

    phone:
        person.phone?.trim() ||
        null,

    email:
        person.email?.trim() ||
        null,

    birth_date:
        person.birth_date ||
        null,

    address:
        person.address?.trim() ||
        null,

    sex:
        person.sex ?? null,

    is_active:
        person.is_active ?? true,
});