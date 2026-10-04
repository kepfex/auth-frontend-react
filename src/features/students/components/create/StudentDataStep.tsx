import { useState, } from "react";
import { AlertCircle, CheckCircle2, Loader2, UserRound, } from "lucide-react";
import { useForm, useWatch, } from "react-hook-form";
import { zodResolver, } from "@hookform/resolvers/zod";
import { toast, } from "sonner";
import { Alert, AlertDescription, AlertTitle, } from "@/components/ui/alert";
import { Button, } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Input, } from "@/components/ui/input";
import { Label, } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Separator, } from "@/components/ui/separator";
import { useCreateStudent, } from "../../hooks/useStudents";
import { STUDENT_CREATE_DEFAULT_VALUES, studentCreateSchema, } from "../../schemas/student-create.schema";
import type { StudentCreateFormValues, } from "../../schemas/student-create.schema";
import type { DocumentType, Person, } from "../../types/person.types";
import type { CreateStudentRequest, Student, } from "../../types/student.types";
import { getApiErrorMessage, } from "@/utils/api-error";
import { PersonDocumentSearch, } from "./PersonDocumentSearch";
import { PersonFormFields, } from "./PersonFormFields";
import { useFindPersonByDocument } from "../../hooks/usePersonSearch";

interface StudentDataStepProps {
  onStudentCreated: (
    student: Student,
  ) => void;
}

type PersonSearchState =
  | "idle"
  | "new"
  | "existing"
  | "already-student";

export const StudentDataStep = ({
  onStudentCreated,
}: StudentDataStepProps) => {
  const [
    searchState,
    setSearchState,
  ] =
    useState<PersonSearchState>(
      "idle",
    );

  const [
    existingPerson,
    setExistingPerson,
  ] =
    useState<Person | null>(null);

  const findPerson = useFindPersonByDocument();

  const createStudent =
    useCreateStudent();

  const form =
    useForm<StudentCreateFormValues>({
      resolver: zodResolver(
        studentCreateSchema,
      ),

      defaultValues:
        STUDENT_CREATE_DEFAULT_VALUES,
    });

  const documentType = useWatch({
    control: form.control,
    name: "person.document_type",
  });

  const documentNumber = useWatch({
    control: form.control,
    name: "person.document_number",
  });

  const studentStatus = useWatch({
    control: form.control,
    name: "student.status",
  });

  const resetPersonDetails = () => {
    form.setValue(
      "person.first_names",
      "",
    );

    form.setValue(
      "person.paternal_surname",
      "",
    );

    form.setValue(
      "person.maternal_surname",
      "",
    );

    form.setValue(
      "person.phone",
      "",
    );

    form.setValue(
      "person.email",
      "",
    );

    form.setValue(
      "person.birth_date",
      "",
    );

    form.setValue(
      "person.address",
      "",
    );

    form.setValue(
      "person.sex",
      undefined,
    );
  };

  const handleDocumentChange = (
    value: string,
  ) => {
    form.setValue(
      "person.document_number",
      value,
    );

    resetPersonDetails();
    setExistingPerson(null);
    setSearchState("idle");
  };

  const handleDocumentTypeChange = (
    value: DocumentType,
  ) => {
    form.setValue(
      "person.document_type",
      value,
    );

    form.setValue(
      "person.document_number",
      "",
    );

    resetPersonDetails();
    setExistingPerson(null);
    setSearchState("idle");
  };

  const fillPerson = (
    person: Person,
  ) => {
    form.setValue(
      "person.first_names",
      person.first_names,
    );

    form.setValue(
      "person.paternal_surname",
      person.paternal_surname,
    );

    form.setValue(
      "person.maternal_surname",
      person.maternal_surname ?? "",
    );

    form.setValue(
      "person.phone",
      person.phone ?? "",
    );

    form.setValue(
      "person.email",
      person.email ?? "",
    );

    form.setValue(
      "person.birth_date",
      person.birth_date ?? "",
    );

    form.setValue(
      "person.address",
      person.address ?? "",
    );

    form.setValue(
      "person.sex",
      person.sex ?? undefined,
    );
  };

  const handleSearch = async () => {
    const validDocument =
      await form.trigger([
        "person.document_type",
        "person.document_number",
      ]);

    if (!validDocument) {
      return;
    }

    try {
      const person =
        await findPerson.mutateAsync({
          document_type:
            documentType,

          document_number:
            documentNumber.trim(),
        });

      if (!person) {
        resetPersonDetails();

        setExistingPerson(null);
        setSearchState("new");

        return;
      }

      fillPerson(person);
      setExistingPerson(person);

      if (person.student_id !== null) {
        setSearchState(
          "already-student",
        );

        return;
      }

      setSearchState("existing");
    } catch (error) {
      setSearchState("idle");

      toast.error(
        getApiErrorMessage(
          error,
          "No se pudo buscar la persona",
        ),
      );
    }
  };

  const handleSubmit =
    form.handleSubmit(
      async (values) => {
        if (
          searchState === "idle"
        ) {
          toast.error(
            "Primero busca el documento de la persona",
          );

          return;
        }

        if (
          searchState ===
          "already-student"
        ) {
          return;
        }

        let payload:
          CreateStudentRequest;

        if (
          searchState ===
          "existing" &&
          existingPerson
        ) {
          payload = {
            person_id:
              existingPerson.id,

            student_code:
              values.student
                .student_code,

            status:
              values.student.status,
          };
        } else {
          payload = {
            person: {
              document_type:
                values.person
                  .document_type,

              document_number:
                values.person
                  .document_number,

              first_names:
                values.person
                  .first_names,

              paternal_surname:
                values.person
                  .paternal_surname,

              maternal_surname:
                values.person
                  .maternal_surname ||
                null,

              phone:
                values.person.phone ||
                null,

              email:
                values.person.email ||
                null,

              birth_date:
                values.person
                  .birth_date ||
                null,

              address:
                values.person
                  .address ||
                null,

              sex:
                values.person.sex ??
                null,

              is_active: true,
            },

            student_code:
              values.student
                .student_code,

            status:
              values.student.status,
          };
        }

        try {
          const student =
            await createStudent.mutateAsync(
              payload,
            );

          toast.success(
            "Estudiante registrado correctamente",
          );

          onStudentCreated(
            student,
          );
        } catch (error) {
          toast.error(
            getApiErrorMessage(
              error,
              "No se pudo registrar el estudiante",
            ),
          );
        }
      },
    );

  const canShowForm =
    searchState === "new" ||
    searchState === "existing";

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Datos del estudiante
        </CardTitle>

        <CardDescription>
          Busca primero a la persona por su documento antes de registrar al estudiante.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="space-y-3">
            <Label>
              Documento de identidad
            </Label>

            <PersonDocumentSearch
              documentType={
                documentType
              }
              documentNumber={
                documentNumber
              }
              isSearching={
                findPerson.isPending
              }
              disabled={
                createStudent.isPending
              }
              onDocumentTypeChange={
                handleDocumentTypeChange
              }
              onDocumentNumberChange={
                handleDocumentChange
              }
              onSearch={
                handleSearch
              }
            />

            {form.formState.errors
              .person
              ?.document_number
              ?.message && (
                <p className="text-sm text-destructive">
                  {
                    form.formState
                      .errors.person
                      .document_number
                      .message
                  }
                </p>
              )}
          </div>

          {searchState ===
            "idle" && (
              <Alert>
                <UserRound className="size-4" />

                <AlertTitle>
                  Busca al estudiante
                </AlertTitle>

                <AlertDescription>
                  La búsqueda evita crear personas duplicadas dentro del sistema.
                </AlertDescription>
              </Alert>
            )}

          {searchState ===
            "new" && (
              <Alert>
                <CheckCircle2 className="size-4" />

                <AlertTitle>
                  Persona no registrada
                </AlertTitle>

                <AlertDescription>
                  Completa sus datos personales para crearla junto con el estudiante.
                </AlertDescription>
              </Alert>
            )}

          {searchState ===
            "existing" && (
              <Alert>
                <CheckCircle2 className="size-4" />

                <AlertTitle>
                  Persona encontrada
                </AlertTitle>

                <AlertDescription>
                  Utilizaremos la persona existente y la registraremos como estudiante.
                </AlertDescription>
              </Alert>
            )}

          {searchState ===
            "already-student" && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />

                <AlertTitle>
                  Estudiante ya registrado
                </AlertTitle>

                <AlertDescription>
                  Esta persona ya se encuentra registrada como estudiante.
                </AlertDescription>
              </Alert>
            )}

          {canShowForm && (
            <>
              <Separator />

              <section className="space-y-4">
                <div>
                  <h3 className="font-medium">
                    Información personal
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Datos generales de la persona.
                  </p>
                </div>

                <PersonFormFields
                  form={form}
                  readOnly={
                    searchState ===
                    "existing"
                  }
                />
              </section>

              <Separator />

              <section className="space-y-4">
                <div>
                  <h3 className="font-medium">
                    Información académica
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Datos propios del estudiante.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="student_code">
                      Código del estudiante *
                    </Label>

                    <Input
                      id="student_code"
                      {...form.register(
                        "student.student_code",
                      )}
                    />

                    {form.formState
                      .errors.student
                      ?.student_code
                      ?.message && (
                        <p className="text-sm text-destructive">
                          {
                            form
                              .formState
                              .errors
                              .student
                              .student_code
                              .message
                          }
                        </p>
                      )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Estado
                    </Label>

                    <Select
                      value={studentStatus}
                      onValueChange={(
                        value,
                      ) =>
                        form.setValue(
                          "student.status",
                          value as
                          | "activo"
                          | "inactivo"
                          | "egresado",
                          {
                            shouldValidate:
                              true,
                          },
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="activo">
                          Activo
                        </SelectItem>

                        <SelectItem value="inactivo">
                          Inactivo
                        </SelectItem>

                        <SelectItem value="egresado">
                          Egresado
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={
                    createStudent.isPending
                  }
                >
                  {createStudent.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    "Guardar y continuar"
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
};