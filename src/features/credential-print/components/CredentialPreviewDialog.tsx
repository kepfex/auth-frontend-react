import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, FileDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { credentialPrintApi } from "../api/credential-print.api";
import type {
  ClassroomCredentialData,
  CredentialStudent,
} from "../types/credential-print.types";
import { SchoolCredential } from "./SchoolCredential";
import {
  hasCredentialChanged,
  isCredentialEligible,
  paginateCards,
} from "../lib/credentialPrint";
import { generateCredentialsPdf } from "../lib/generateCredentialsPdf";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ClassroomCredentialData;
  students: CredentialStudent[];
  academicYearName: string;
  onInvalidated: () => void;
};

export function CredentialPreviewDialog(props: Props) {
  const {
    open,
    onOpenChange,
    data,
    students,
    academicYearName,
    onInvalidated,
  } = props;
  const [mode, setMode] = useState<"individual" | "a4">("individual");
  const [index, setIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [checking, setChecking] = useState(false);
  const pages = paginateCards(students);
  const safeIndex = Math.min(index, Math.max(students.length - 1, 0));
  const safePage = Math.min(page, Math.max(pages.length - 1, 0));

  async function handleGeneratePdf() {
    if (checking || students.length === 0) return;

    setChecking(true);

    try {
      // 1. Consultar información actualizada desde Laravel.
      const latest = await credentialPrintApi.getStudents(
        data.academic_year_id,
        data.grade_section_id,
      );

      // 2. Comprobar que seguimos trabajando
      // con el mismo año académico y aula.
      const sameContext =
        latest.academic_year_id === data.academic_year_id &&
        latest.grade_section_id === data.grade_section_id &&
        latest.grade === data.grade &&
        latest.section === data.section &&
        latest.level === data.level;

      if (!sameContext) {
        onOpenChange(false);
        onInvalidated();

        toast.warning("El contexto académico ha cambiado.", {
          description: "Actualiza la selección antes de generar el PDF.",
        });

        return;
      }

      // 3. Buscar los estudiantes seleccionados
      // entre los datos actualizados.
      const latestById = new Map(
        latest.students.map((student) => [student.student_id, student]),
      );

      // 4. Verificar matrícula, UUID, datos y estado.
      const hasChanges = students.some((previous) => {
        const current = latestById.get(previous.student_id);

        return (
          !current ||
          !isCredentialEligible(current) ||
          hasCredentialChanged(previous, current)
        );
      });

      if (hasChanges) {
        onOpenChange(false);
        onInvalidated();

        toast.warning("Las credenciales requieren actualización.", {
          description:
            "Uno o más estudiantes presentan cambios. " +
            "Revisa nuevamente la selección.",
        });

        return;
      }

      // 5. Respetar el orden en que aparecen
      // los estudiantes seleccionados.
      const validatedStudents = students.map(
        (student) => latestById.get(student.student_id)!,
      );

      // 6. Generar y descargar el archivo.
      await generateCredentialsPdf({
        data: latest,
        students: validatedStudents,
        academicYearName,
      });

      toast.success("PDF generado correctamente", {
        description:
          `${validatedStudents.length} credencial(es) ` +
          "preparadas para descargar.",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error al generar las credenciales PDF:", error);

      toast.error("No se pudo generar el PDF", {
        description:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado. Intenta nuevamente.",
      });
    } finally {
      setChecking(false);
    }
  }

  function card(student: CredentialStudent) {
    return (
      <SchoolCredential
        key={student.student_id}
        student={student}
        academicYear={academicYearName}
        level={data.level}
        grade={data.grade}
        section={data.section}
      />
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!checking) onOpenChange(v);
      }}
    >
      <DialogContent className="flex max-h-[92dvh] w-[min(1100px,calc(100vw-2rem))] max-w-none flex-col overflow-hidden p-0 sm:max-w-none">
        <DialogHeader className="m-0 px-6 pt-5">
          <DialogTitle>Vista previa de credenciales</DialogTitle>
          <DialogDescription>
            {students.length} estudiante(s) · {data.grade} {data.section} ·{" "}
            {data.level} · {academicYearName}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 px-6">
          <Button
            size="sm"
            variant={mode === "individual" ? "default" : "outline"}
            onClick={() => setMode("individual")}
          >
            Individual
          </Button>
          <Button
            size="sm"
            variant={mode === "a4" ? "default" : "outline"}
            onClick={() => setMode("a4")}
          >
            Hoja A4
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-muted/50 px-4 py-6">
          {mode === "individual" ? (
            <div className="flex justify-center overflow-x-auto py-4">
              {students[safeIndex] && card(students[safeIndex])}
            </div>
          ) : (
            <div
              className="mx-auto box-border grid gap-[5mm] bg-white p-[10mm] shadow"
              style={{
                width: "210mm",
                minHeight: "297mm",
                gridTemplateColumns: "repeat(2, 85.6mm)",
                gridAutoRows: "54mm",
                alignContent: "start",
              }}
            >
              {(pages[safePage] ?? []).map(card)}
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-4 px-6">
          <Button
            size="sm"
            variant="outline"
            disabled={mode === "individual" ? safeIndex === 0 : safePage === 0}
            onClick={() =>
              mode === "individual"
                ? setIndex((i) => i - 1)
                : setPage((p) => p - 1)
            }
          >
            <ChevronLeft className="size-4" /> Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            {mode === "individual"
              ? `${safeIndex + 1} de ${students.length}`
              : `Página ${safePage + 1} de ${pages.length}`}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={
              mode === "individual"
                ? safeIndex >= students.length - 1
                : safePage >= pages.length - 1
            }
            onClick={() =>
              mode === "individual"
                ? setIndex((i) => i + 1)
                : setPage((p) => p + 1)
            }
          >
            Siguiente <ChevronRight className="size-4" />
          </Button>
        </div>
        <DialogFooter className="border-t p-4 sm:px-6">
          <Button
            variant="outline"
            disabled={checking}
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>

          <Button
            type="button"
            disabled={checking || students.length === 0}
            onClick={() => void handleGeneratePdf()}
          >
            {checking ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FileDown className="size-4" />
            )}

            {checking
              ? "Generando PDF..."
              : `Descargar PDF (${students.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
