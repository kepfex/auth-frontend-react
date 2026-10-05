import { AlertCircle, CalendarDays, ClipboardCheck, Loader2, UserRound, UsersRound, } from "lucide-react";
import { Navigate, useParams, useSearchParams, } from "react-router-dom";
import { Button, } from "@/components/ui/button";
import { Card, CardContent, } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs";
import { parsePositiveIntParam, } from "@/shared/utils/route-params";
import { useStudent } from "@/features/students/hooks/useStudents";
import { StudentDetailHeader } from "@/features/students/components/detail/StudentDetailHeader";
import { StudentInfoTab } from "@/features/students/components/detail/StudentInfoTab";
import { GuardianManager } from "@/features/students/components/guardians/GuardianManager";
import { StudentEmptyTab } from "@/features/students/components/detail/StudentEmptyTab";

const STUDENT_TABS = [
    "information",
    "guardians",
    "enrollments",
    "attendance",
] as const;



export const StudentDetailPage = () => {
    const [
        searchParams,
        setSearchParams,
    ] = useSearchParams();

    type StudentTab =
        (typeof STUDENT_TABS)[number];

    const isStudentTab = (
        value: string,
    ): value is StudentTab =>
        STUDENT_TABS.includes(
            value as StudentTab,
        );

    const tabParam =
        searchParams.get("tab");

    const currentTab: StudentTab =
        tabParam &&
            isStudentTab(tabParam)
            ? tabParam
            : "information";

    const {
        studentId: studentIdParam,
    } = useParams<{
        studentId: string;
    }>();

    const studentId =
        parsePositiveIntParam(
            studentIdParam,
        );

    const {
        data: student,
        isLoading,
        isError,
        refetch,
    } = useStudent(
        studentId ?? undefined,
    );

    if (studentId === null) {
        return (
            <Navigate
                to="/admin/students"
                replace
            />
        );
    }

    if (isLoading) {
        return (
            <div className="flex min-h-100 items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="size-6 animate-spin" />

                    <p className="text-sm">
                        Cargando estudiante...
                    </p>
                </div>
            </div>
        );
    }

    if (isError || !student) {
        return (
            <Card>
                <CardContent className="flex min-h-87.5 flex-col items-center justify-center text-center">
                    <AlertCircle className="mb-3 size-8 text-destructive" />

                    <h2 className="font-semibold">
                        No se pudo cargar el estudiante
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Verifica que el estudiante exista e intenta nuevamente.
                    </p>

                    <Button
                        variant="outline"
                        className="mt-5"
                        onClick={() =>
                            refetch()
                        }
                    >
                        Reintentar
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <StudentDetailHeader
                student={student}
            />

            <Tabs
                value={currentTab}
                onValueChange={(value) => {
                    if (!isStudentTab(value)) {
                        return;
                    }

                    if (value === "information") {
                        setSearchParams(
                            {},
                            {
                                replace: true,
                            },
                        );

                        return;
                    }

                    setSearchParams(
                        {
                            tab: value,
                        },
                        {
                            replace: true,
                        },
                    );
                }}
                className="space-y-6"
            >
                <TabsList>
                    <TabsTrigger value="information">
                        <UserRound className="size-4" />
                        Información
                    </TabsTrigger>

                    <TabsTrigger value="guardians">
                        <UsersRound className="size-4" />
                        Apoderados
                    </TabsTrigger>

                    <TabsTrigger value="enrollments">
                        <CalendarDays className="size-4" />
                        Matrículas
                    </TabsTrigger>

                    <TabsTrigger value="attendance">
                        <ClipboardCheck className="size-4" />
                        Asistencia
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="information">
                    <StudentInfoTab
                        student={student}
                    />
                </TabsContent>

                <TabsContent value="guardians">
                    <GuardianManager
                        studentId={student.id}
                    />
                </TabsContent>

                <TabsContent value="enrollments">
                    <StudentEmptyTab
                        icon={CalendarDays}
                        title="Sin gestión de matrículas"
                        description="La gestión e historial de matrículas se implementará en el siguiente módulo."
                    />
                </TabsContent>

                <TabsContent value="attendance">
                    <StudentEmptyTab
                        icon={ClipboardCheck}
                        title="Asistencia"
                        description="Aquí se mostrará posteriormente el historial de asistencia, tardanzas y faltas del estudiante."
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};