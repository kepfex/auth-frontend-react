import {
  Check,
  UserRound,
  UsersRound,
} from "lucide-react";

interface StudentWizardStepsProps {
  currentStep: 1 | 2;
}

export const StudentWizardSteps = ({
  currentStep,
}: StudentWizardStepsProps) => {
  return (
    <div className="mx-auto flex w-full max-w-2xl items-center">
      <Step
        number={1}
        title="Estudiante"
        description="Datos personales"
        active={currentStep === 1}
        completed={currentStep > 1}
        icon={<UserRound className="size-4" />}
      />

      <div
        className={`mx-4 h-px flex-1 ${
          currentStep > 1
            ? "bg-primary"
            : "bg-border"
        }`}
      />

      <Step
        number={2}
        title="Apoderados"
        description="Familia y responsables"
        active={currentStep === 2}
        completed={false}
        icon={<UsersRound className="size-4" />}
      />
    </div>
  );
};

interface StepProps {
  number: number;
  title: string;
  description: string;
  active: boolean;
  completed: boolean;
  icon: React.ReactNode;
}

const Step = ({
  number,
  title,
  description,
  active,
  completed,
  icon,
}: StepProps) => {
  return (
    <div className="flex items-center gap-3">
      <div
        className={[
          "flex size-9 shrink-0 items-center justify-center rounded-full border",
          completed || active
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background text-muted-foreground",
        ].join(" ")}
      >
        {completed ? (
          <Check className="size-4" />
        ) : (
          icon
        )}
      </div>

      <div className="hidden sm:block">
        <p
          className={
            active || completed
              ? "text-sm font-medium"
              : "text-sm font-medium text-muted-foreground"
          }
        >
          {number}. {title}
        </p>

        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
};