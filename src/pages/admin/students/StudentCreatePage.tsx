import {
  useState,
} from "react";

import {
  ArrowLeft,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Button,
} from "@/components/ui/button";
import type { Student } from "@/features/students/types/student.types";
import { StudentWizardSteps } from "@/features/students/components/create/StudentWizardSteps";
import { StudentDataStep } from "@/features/students/components/create/StudentDataStep";



type WizardStep = 1 | 2;

export const StudentCreatePage = () => {
  const navigate = useNavigate();

  const [
    currentStep,
    setCurrentStep,
  ] =
    useState<WizardStep>(1);

  const [
    createdStudent,
    setCreatedStudent,
  ] =
    useState<Student | null>(
      null,
    );

  const handleStudentCreated = (
    student: Student,
  ) => {
    setCreatedStudent(student);
    setCurrentStep(2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() =>
            navigate(
              "/admin/students",
            )
          }
        >
          <ArrowLeft className="size-4" />

          <span className="sr-only">
            Volver
          </span>
        </Button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Nuevo estudiante
          </h1>

          <p className="text-sm text-muted-foreground">
            Registra la información del estudiante y sus apoderados.
          </p>
        </div>
      </div>

      <StudentWizardSteps
        currentStep={
          currentStep
        }
      />

      {currentStep === 1 && (
        <StudentDataStep
          onStudentCreated={
            handleStudentCreated
          }
        />
      )}

      {currentStep === 2 &&
        createdStudent && (
          <div className="rounded-lg border p-8 text-center">
            <h2 className="font-semibold">
              Estudiante registrado
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Ahora registraremos sus apoderados.
            </p>

            <p className="mt-4 text-sm">
              Student ID:{" "}
              {createdStudent.id}
            </p>
          </div>
        )}
    </div>
  );
};