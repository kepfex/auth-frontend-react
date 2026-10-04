import { AlertCircle, Loader2, } from "lucide-react";
import { Navigate, useNavigate, useParams, } from "react-router-dom";
import { Button, } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { parsePositiveIntParam, } from "@/shared/utils/route-params";
import { useStudent } from "@/features/students/hooks/useStudents";
import { StudentRegistrationHeader } from "@/features/students/components/create/StudentRegistrationHeader";
import { GuardianManager } from "@/features/students/components/guardians/GuardianManager";

export const StudentGuardianSetupPage = () => {
    const navigate = useNavigate();
    const { studentId: studentIdParam, } = useParams<{ studentId: string; }>();
    const studentId = parsePositiveIntParam(studentIdParam,);

    const { data: student, isLoading, isError, refetch, } = useStudent(studentId ?? undefined,);

    if (studentId === null) {
        return (
            <Navigate
                to="/admin/students"
                replace
            />
        );
    }

    return (
        <div className="space-y-6">
            <StudentRegistrationHeader
                currentStep={2}
            />

            {isLoading ? (
                <div className="flex min-h-75 items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Loader2 className="size-6 animate-spin" />

                        <p className="text-sm">
                            Recuperando información del estudiante...
                        </p>
                    </div>
                </div>
            ) : isError ? (
                <Card>
                    <CardContent className="flex min-h-70 flex-col items-center justify-center text-center">
                        <AlertCircle className="mb-3 size-8 text-destructive" />

                        <h2 className="font-semibold">
                            No se pudo cargar el estudiante
                        </h2>

                        <p className="mt-1 max-w-md text-sm text-muted-foreground">
                            El estudiante no existe o no fue posible recuperar su información.
                        </p>

                        <div className="mt-5 flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    refetch()
                                }
                            >
                                Reintentar
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={() =>
                                    navigate(
                                        "/admin/students",
                                    )
                                }
                            >
                                Volver
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : student ? (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Apoderados del estudiante
                            </CardTitle>

                            <CardDescription>
                                El estudiante ya fue registrado correctamente.
                                Ahora puedes asociar sus apoderados.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="rounded-lg border bg-muted/30 p-4">
                                <p className="font-medium">{[student.person.first_names, student.person.paternal_surname, student.person.maternal_surname].filter(Boolean).join(" ")}</p>
                                <p className="text-sm text-muted-foreground">{student.person.document_type} {student.person.document_number} · Código: {student.student_code}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <GuardianManager studentId={student.id} />

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button variant="outline" onClick={() => navigate("/admin/students", { replace: true })}>Finalizar más tarde</Button>
                        <Button onClick={() => navigate("/admin/students", { replace: true })}>Finalizar registro</Button>
                    </div>
                </>
            ) : null}
        </div>
    );
};