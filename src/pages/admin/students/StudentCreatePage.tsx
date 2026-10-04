import { useNavigate, } from "react-router-dom";
import type { Student } from "@/features/students/types/student.types";
import { StudentDataStep } from "@/features/students/components/create/StudentDataStep";
import { StudentRegistrationHeader } from "@/features/students/components/create/StudentRegistrationHeader";

export const StudentCreatePage = () => {
  const navigate = useNavigate();

  const handleStudentCreated = (
    student: Student,
  ) => {
    navigate(
      `/admin/students/${student.id}/setup/guardians`,
      {replace: true,},
    );
  };

  return (
    <div className="space-y-6">
      <StudentRegistrationHeader
        currentStep={1}
      />

      <StudentDataStep
        onStudentCreated={
          handleStudentCreated
        }
      />
    </div>
  );
};