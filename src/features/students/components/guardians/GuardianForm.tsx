import { useState, type ComponentProps } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getApiError } from "@/shared/utils/api-error";
import { PersonDocumentSearch } from "../person/PersonDocumentSearch";
import { GuardianRelationForm } from "./GuardianRelationForm";
import { useFindPersonByDocument } from "../../hooks/usePersonSearch";
import { useAttachGuardianToStudent, useCreateGuardian } from "../../hooks/useGuardians";
import { mapPersonFormToRequest } from "../../utils/person.mapper";
import type { DocumentType, Person } from "../../types/person.types";
import type { GuardianRelationshipOption } from "../../types/catalog.types";
import { GUARDIAN_CREATE_DEFAULT_VALUES, guardianCreateSchema, type GuardianCreateFormValues } from "../../schemas/guardian-create.schema";

interface GuardianFormProps {
  studentId: number;
  relationshipOptions: GuardianRelationshipOption[];
  hasPrimaryGuardian: boolean;
  existingGuardianIds: number[];
  onSuccess: () => void;
  onCancel: () => void;
}

type PersonSearchState =
  | "idle"
  | "new"
  | "existing"
  | "existing-guardian"
  | "already-linked";

export const GuardianForm = ({
  studentId,
  relationshipOptions,
  hasPrimaryGuardian,
  existingGuardianIds,
  onSuccess,
  onCancel,
}: GuardianFormProps) => {
  const [searchState, setSearchState] = useState<PersonSearchState>("idle");
  const [existingPerson, setExistingPerson] = useState<Person | null>(null);

  const findPerson = useFindPersonByDocument();
  const createGuardian = useCreateGuardian();
  const attachGuardian = useAttachGuardianToStudent(studentId);

  const form = useForm<GuardianCreateFormValues>({
    resolver: zodResolver(guardianCreateSchema),
    defaultValues: {
      ...GUARDIAN_CREATE_DEFAULT_VALUES,
      relation: {
        ...GUARDIAN_CREATE_DEFAULT_VALUES.relation,
        is_primary: !hasPrimaryGuardian,
      },
    },
  });

  const documentType = useWatch({ control: form.control, name: "person.document_type" });
  const documentNumber = useWatch({ control: form.control, name: "person.document_number" });

  const resetPersonDetails = () => {
    form.setValue("person.first_names", "");
    form.setValue("person.paternal_surname", "");
    form.setValue("person.maternal_surname", "");
    form.setValue("person.phone", "");
    form.setValue("person.email", "");
    form.setValue("person.birth_date", "");
    form.setValue("person.address", "");
    form.setValue("person.sex", undefined);
    form.setValue("guardian.occupation", "");
  };

  const fillPerson = (person: Person) => {
    form.setValue("person.first_names", person.first_names);
    form.setValue("person.paternal_surname", person.paternal_surname);
    form.setValue("person.maternal_surname", person.maternal_surname ?? "");
    form.setValue("person.phone", person.phone ?? "");
    form.setValue("person.email", person.email ?? "");
    form.setValue("person.birth_date", person.birth_date ?? "");
    form.setValue("person.address", person.address ?? "");
    form.setValue("person.sex", person.sex ?? undefined);
  };

  const resetSearchResult = () => {
    resetPersonDetails();
    setExistingPerson(null);
    setSearchState("idle");
  };

  const handleDocumentTypeChange = (value: DocumentType) => {
    form.setValue("person.document_type", value);
    form.setValue("person.document_number", "");
    resetSearchResult();
  };

  const handleDocumentNumberChange = (value: string) => {
    form.setValue("person.document_number", value);
    resetPersonDetails();
    setExistingPerson(null);
    setSearchState("idle");
  };

  const handleSearch = async () => {
    const valid = await form.trigger(["person.document_type", "person.document_number"]);
    if (!valid) return;

    try {
      const person = await findPerson.mutateAsync({
        document_type: documentType,
        document_number: documentNumber.trim(),
      });

      if (!person) {
        resetPersonDetails();
        setExistingPerson(null);
        setSearchState("new");
        return;
      }

      fillPerson(person);
      setExistingPerson(person);

      if (person.guardian_id != null) {
        if (existingGuardianIds.includes(person.guardian_id)) {
          setSearchState("already-linked");
          return;
        }
        setSearchState("existing-guardian");
        return;
      }

      setSearchState("existing");
    } catch (error) {
      const apiError = getApiError(error, "No se pudo buscar la persona");
      toast.error(apiError.message);
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    if (searchState === "idle") {
      toast.error("Primero busca el documento del apoderado");
      return;
    }
    if (searchState === "already-linked") return;

    try {
      let guardianId: number;

      if (searchState === "existing-guardian") {
        if (existingPerson?.guardian_id == null) return;
        guardianId = existingPerson.guardian_id;
      } else if (searchState === "existing" && existingPerson) {
        const guardian = await createGuardian.mutateAsync({
          person_id: existingPerson.id,
          occupation: values.guardian.occupation?.trim() || null,
          is_active: true,
        });
        guardianId = guardian.id;
      } else {
        const guardian = await createGuardian.mutateAsync({
          person: mapPersonFormToRequest(values.person),
          occupation: values.guardian.occupation?.trim() || null,
          is_active: true,
        });
        guardianId = guardian.id;
      }

      await attachGuardian.mutateAsync({
        guardian_id: guardianId,
        relationship: values.relation.relationship,
        is_primary: values.relation.is_primary,
        receives_notifications: values.relation.receives_notifications,
      });

      toast.success("Apoderado vinculado correctamente");
      onSuccess();
    } catch (error) {
      const apiError = getApiError(error, "No se pudo vincular el apoderado");
      toast.error(apiError.message);
    }
  });

  const canShowDetails = ["new", "existing", "existing-guardian"].includes(searchState);
  const isExistingPerson = searchState === "existing" || searchState === "existing-guardian";
  const isPending = createGuardian.isPending || attachGuardian.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label>Documento del apoderado</Label>
        <PersonDocumentSearch
          documentType={documentType}
          documentNumber={documentNumber}
          isSearching={findPerson.isPending}
          disabled={isPending}
          onDocumentTypeChange={handleDocumentTypeChange}
          onDocumentNumberChange={handleDocumentNumberChange}
          onSearch={handleSearch}
        />
        {form.formState.errors.person?.document_number?.message && (
          <p className="text-sm text-destructive">{form.formState.errors.person.document_number.message}</p>
        )}
      </div>

      {searchState === "new" && <SearchAlert title="Persona no registrada" description="Completa sus datos para crearla como apoderado." />}
      {searchState === "existing" && <SearchAlert title="Persona encontrada" description="La persona existente será registrada como apoderado y vinculada al estudiante." />}
      {searchState === "existing-guardian" && <SearchAlert title="Apoderado existente" description="Este apoderado ya existe. Solo crearemos la relación con el estudiante." />}
      {searchState === "already-linked" && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Apoderado ya vinculado</AlertTitle>
          <AlertDescription>Esta persona ya está registrada como apoderado de este estudiante.</AlertDescription>
        </Alert>
      )}

      {canShowDetails && (
        <>
          <Separator />
          <section className="space-y-4">
            <div>
              <h3 className="font-medium">Información personal</h3>
              <p className="text-sm text-muted-foreground">Datos personales del apoderado.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <TextField label="Nombres *" readOnly={isExistingPerson} error={form.formState.errors.person?.first_names?.message} {...form.register("person.first_names")} />
              <TextField label="Apellido paterno *" readOnly={isExistingPerson} error={form.formState.errors.person?.paternal_surname?.message} {...form.register("person.paternal_surname")} />
              <TextField label="Apellido materno" readOnly={isExistingPerson} error={form.formState.errors.person?.maternal_surname?.message} {...form.register("person.maternal_surname")} />

              <div className="space-y-2">
                <Label>Sexo</Label>
                <Controller
                  control={form.control}
                  name="person.sex"
                  render={({ field, fieldState }) => (
                    <>
                      <Select value={field.value ?? undefined} disabled={isExistingPerson} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculino</SelectItem>
                          <SelectItem value="F">Femenino</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                    </>
                  )}
                />
              </div>

              <TextField label="Fecha de nacimiento" type="date" readOnly={isExistingPerson} error={form.formState.errors.person?.birth_date?.message} {...form.register("person.birth_date")} />
              <TextField label="Teléfono" readOnly={isExistingPerson} error={form.formState.errors.person?.phone?.message} {...form.register("person.phone")} />
              <TextField label="Correo electrónico" type="email" readOnly={isExistingPerson} error={form.formState.errors.person?.email?.message} {...form.register("person.email")} />
              <TextField label="Dirección" readOnly={isExistingPerson} error={form.formState.errors.person?.address?.message} {...form.register("person.address")} />
            </div>
          </section>

          <Separator />
          <section className="space-y-4">
            <div>
              <h3 className="font-medium">Datos del apoderado</h3>
              <p className="text-sm text-muted-foreground">Información propia del rol de apoderado.</p>
            </div>
            <TextField
              label="Ocupación"
              placeholder="Ej. Docente, comerciante..."
              disabled={searchState === "existing-guardian"}
              error={form.formState.errors.guardian?.occupation?.message}
              {...form.register("guardian.occupation")}
            />
          </section>

          <Separator />
          <section className="space-y-4">
            <div>
              <h3 className="font-medium">Relación con el estudiante</h3>
              <p className="text-sm text-muted-foreground">Define el parentesco y las preferencias de contacto.</p>
            </div>
            <GuardianRelationForm control={form.control} options={relationshipOptions} />
          </section>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Vincular apoderado
            </Button>
          </div>
        </>
      )}
    </form>
  );
};

const SearchAlert = ({ title, description }: { title: string; description: string }) => (
  <Alert>
    <CheckCircle2 className="size-4" />
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>{description}</AlertDescription>
  </Alert>
);

interface TextFieldProps extends ComponentProps<typeof Input> {
  label: string;
  error?: string;
}

const TextField = ({ label, error, ...props }: TextFieldProps) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Input {...props} />
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
);
