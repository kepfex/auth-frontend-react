import { ArrowLeft, } from "lucide-react"
import { useNavigate, } from "react-router-dom";
import { Button, } from "@/components/ui/button";
import { StudentWizardSteps, } from "./StudentWizardSteps";

interface StudentRegistrationHeaderProps {
    currentStep: 1 | 2;
}

export const StudentRegistrationHeader = ({
    currentStep,
}: StudentRegistrationHeaderProps) => {
    const navigate = useNavigate();

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
                        Volver a estudiantes
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
                currentStep={currentStep}
            />
        </div>
    );
};