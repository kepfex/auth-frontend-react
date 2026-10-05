import {
  CalendarDays,
  Contact,
  Home,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type {
  Student,
} from "../../types/student.types";

interface StudentInfoTabProps {
  student: Student;
}

export const StudentInfoTab = ({
  student,
}: StudentInfoTabProps) => {
  const person = student.person;

  const fullName = [
    person.first_names,
    person.paternal_surname,
    person.maternal_surname,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>
            Información personal
          </CardTitle>

          <CardDescription>
            Datos de identificación del estudiante.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <InfoItem
            icon={UserRound}
            label="Nombre completo"
            value={fullName}
          />

          <InfoItem
            icon={Contact}
            label="Documento"
            value={`${person.document_type} ${person.document_number}`}
          />

          <InfoItem
            icon={CalendarDays}
            label="Fecha de nacimiento"
            value={
              person.birth_date ??
              "No registrada"
            }
          />

          <InfoItem
            icon={UserRound}
            label="Sexo"
            value={
              person.sex === "M"
                ? "Masculino"
                : person.sex === "F"
                  ? "Femenino"
                  : "No registrado"
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Contacto
          </CardTitle>

          <CardDescription>
            Información de contacto y residencia.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <InfoItem
            icon={Phone}
            label="Teléfono"
            value={
              person.phone ??
              "No registrado"
            }
          />

          <InfoItem
            icon={Mail}
            label="Correo electrónico"
            value={
              person.email ??
              "No registrado"
            }
          />

          <InfoItem
            icon={Home}
            label="Dirección"
            value={
              person.address ??
              "No registrada"
            }
          />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            Información académica
          </CardTitle>

          <CardDescription>
            Información propia del registro del estudiante.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5 sm:grid-cols-2">
          <InfoItem
            icon={Contact}
            label="Código de estudiante"
            value={student.student_code}
          />

          <InfoItem
            icon={UserRound}
            label="Estado"
            value={getStatusLabel(
              student.status,
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
};

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

const InfoItem = ({
  icon: Icon,
  label,
  value,
}: InfoItemProps) => (
  <div className="flex gap-3">
    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
      <Icon className="size-4 text-muted-foreground" />
    </div>

    <div className="min-w-0">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="wrap-break-word font-medium">
        {value}
      </p>
    </div>
  </div>
);

const getStatusLabel = (
  status: Student["status"],
) => {
  switch (status) {
    case "activo":
      return "Activo";

    case "inactivo":
      return "Inactivo";

    case "egresado":
      return "Egresado";
  }
};