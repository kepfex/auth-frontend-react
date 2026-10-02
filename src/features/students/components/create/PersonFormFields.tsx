import type {
  UseFormReturn,
} from "react-hook-form";

import {
  Input,
} from "@/components/ui/input";

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

import type {
  StudentCreateFormValues,
} from "../../schemas/student-create.schema";

interface PersonFormFieldsProps {
  form: UseFormReturn<StudentCreateFormValues>;
  readOnly?: boolean;
}

export const PersonFormFields = ({
  form,
  readOnly = false,
}: PersonFormFieldsProps) => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const sex = watch("person.sex");

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field>
        <Label htmlFor="first_names">
          Nombres *
        </Label>

        <Input
          id="first_names"
          readOnly={readOnly}
          {...register(
            "person.first_names",
          )}
        />

        <FieldError
          message={
            errors.person
              ?.first_names?.message
          }
        />
      </Field>

      <Field>
        <Label htmlFor="paternal_surname">
          Apellido paterno *
        </Label>

        <Input
          id="paternal_surname"
          readOnly={readOnly}
          {...register(
            "person.paternal_surname",
          )}
        />

        <FieldError
          message={
            errors.person
              ?.paternal_surname
              ?.message
          }
        />
      </Field>

      <Field>
        <Label htmlFor="maternal_surname">
          Apellido materno
        </Label>

        <Input
          id="maternal_surname"
          readOnly={readOnly}
          {...register(
            "person.maternal_surname",
          )}
        />

        <FieldError
          message={
            errors.person
              ?.maternal_surname
              ?.message
          }
        />
      </Field>

      <Field>
        <Label>Sexo</Label>

        <Select
          value={sex}
          disabled={readOnly}
          onValueChange={(value) =>
            setValue(
              "person.sex",
              value as "M" | "F",
              {
                shouldValidate: true,
              },
            )
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="M">
              Masculino
            </SelectItem>

            <SelectItem value="F">
              Femenino
            </SelectItem>
          </SelectContent>
        </Select>

        <FieldError
          message={
            errors.person?.sex?.message
          }
        />
      </Field>

      <Field>
        <Label htmlFor="birth_date">
          Fecha de nacimiento
        </Label>

        <Input
          id="birth_date"
          type="date"
          readOnly={readOnly}
          {...register(
            "person.birth_date",
          )}
        />

        <FieldError
          message={
            errors.person
              ?.birth_date?.message
          }
        />
      </Field>

      <Field>
        <Label htmlFor="phone">
          Teléfono
        </Label>

        <Input
          id="phone"
          readOnly={readOnly}
          {...register(
            "person.phone",
          )}
        />

        <FieldError
          message={
            errors.person?.phone?.message
          }
        />
      </Field>

      <Field>
        <Label htmlFor="email">
          Correo electrónico
        </Label>

        <Input
          id="email"
          type="email"
          readOnly={readOnly}
          {...register(
            "person.email",
          )}
        />

        <FieldError
          message={
            errors.person?.email?.message
          }
        />
      </Field>

      <Field>
        <Label htmlFor="address">
          Dirección
        </Label>

        <Input
          id="address"
          readOnly={readOnly}
          {...register(
            "person.address",
          )}
        />

        <FieldError
          message={
            errors.person
              ?.address?.message
          }
        />
      </Field>
    </div>
  );
};

const Field = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    {children}
  </div>
);

const FieldError = ({
  message,
}: {
  message?: string;
}) => {
  if (!message) {
    return null;
  }

  return (
    <p className="text-sm text-destructive">
      {message}
    </p>
  );
};