import { useAuthStore } from "@/features/auth/store/auth.store";
import { useClassrooms } from "@/features/classrooms/hooks/useClassrooms";

export const ClassroomsPage = () => {
  const academicYear = useAuthStore(
    (state) => state.academicYear
  );

  const {
    data: classrooms,
    isLoading,
    isError,
  } = useClassrooms();

  if (!academicYear) {
    return (
      <div>
        No existe un año académico seleccionado.
      </div>
    );
  }

  if (isLoading) {
    return <div>Cargando aulas...</div>;
  }

  if (isError) {
    return (
      <div>
        No se pudieron cargar las aulas.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Aulas y Secciones
        </h1>

        <p className="text-sm text-muted-foreground">
          Año académico {academicYear.name}
        </p>
      </div>

      <pre className="text-xs">
        {JSON.stringify(classrooms, null, 2)}
      </pre>
    </div>
  );
};