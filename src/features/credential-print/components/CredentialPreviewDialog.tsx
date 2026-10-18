import { useState } from "react";
import { ChevronLeft, ChevronRight, Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { credentialPrintApi } from "../api/credential-print.api";
import type { ClassroomCredentialData, CredentialStudent } from "../types/credential-print.types";
import { SchoolCredential } from "./SchoolCredential";
import { getPrintUrl, hasCredentialChanged, isCredentialEligible, paginateCards } from "../lib/credentialPrint";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ClassroomCredentialData;
  students: CredentialStudent[];
  academicYearName: string;
  onInvalidated: () => void;
};

export function CredentialPreviewDialog(props: Props) {
  const { open, onOpenChange, data, students, academicYearName, onInvalidated } = props;
  const [mode, setMode] = useState<"individual" | "a4">("individual");
  const [index, setIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();
  const pages = paginateCards(students);
  const safeIndex = Math.min(index, Math.max(students.length - 1, 0));
  const safePage = Math.min(page, Math.max(pages.length - 1, 0));

  async function checkAndPrint() {
    if (checking || !students.length) return;
    setChecking(true);
    try {
      const latest = await credentialPrintApi.getStudents(data.academic_year_id, data.grade_section_id);
      const byId = new Map(latest.students.map(s => [s.student_id, s]));
      const invalid = latest.grade !== data.grade || latest.section !== data.section || latest.level !== data.level ||
        students.some(s => { const current = byId.get(s.student_id); return !current || !isCredentialEligible(current) || hasCredentialChanged(s, current); });
      if (invalid) {
        onOpenChange(false);
        onInvalidated();
        toast.warning("Los datos de las credenciales cambiaron. Revisa la selección antes de imprimir.");
        return;
      }
      onOpenChange(false);
      navigate(getPrintUrl(data.academic_year_id, data.grade_section_id, students.map(s => s.student_id), academicYearName));
    } catch {
      toast.error("No fue posible verificar las credenciales con Laravel. La impresión se canceló.");
    } finally {
      setChecking(false);
    }
  }

  function card(student: CredentialStudent) {
    return <SchoolCredential key={student.student_id} student={student} academicYear={academicYearName}
      level={data.level} grade={data.grade} section={data.section} />;
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!checking) onOpenChange(v); }}>
      <DialogContent className="flex max-h-[92dvh] w-[min(1100px,calc(100vw-2rem))] max-w-none flex-col overflow-hidden p-0 sm:max-w-none">
        <DialogHeader className="m-0 px-6 pt-5">
          <DialogTitle>Vista previa de credenciales</DialogTitle>
          <DialogDescription>{students.length} estudiante(s) · {data.grade} {data.section} · {data.level} · {academicYearName}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 px-6">
          <Button size="sm" variant={mode === "individual" ? "default" : "outline"} onClick={() => setMode("individual")}>Individual</Button>
          <Button size="sm" variant={mode === "a4" ? "default" : "outline"} onClick={() => setMode("a4")}>Hoja A4</Button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-muted/50 px-4 py-6">
          {mode === "individual" ? (
            <div className="flex justify-center overflow-x-auto py-4">{students[safeIndex] && card(students[safeIndex])}</div>
          ) : (
            <div className="mx-auto box-border grid gap-[5mm] bg-white p-[10mm] shadow" style={{ width: "210mm", minHeight: "297mm", gridTemplateColumns: "repeat(2, 85.6mm)", gridAutoRows: "54mm", alignContent: "start" }}>
              {(pages[safePage] ?? []).map(card)}
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-4 px-6">
          <Button size="sm" variant="outline" disabled={mode === "individual" ? safeIndex === 0 : safePage === 0} onClick={() => mode === "individual" ? setIndex(i => i - 1) : setPage(p => p - 1)}><ChevronLeft className="size-4"/> Anterior</Button>
          <span className="text-sm text-muted-foreground">{mode === "individual" ? `${safeIndex + 1} de ${students.length}` : `Página ${safePage + 1} de ${pages.length}`}</span>
          <Button size="sm" variant="outline" disabled={mode === "individual" ? safeIndex >= students.length - 1 : safePage >= pages.length - 1} onClick={() => mode === "individual" ? setIndex(i => i + 1) : setPage(p => p + 1)}>Siguiente <ChevronRight className="size-4"/></Button>
        </div>
        <DialogFooter className="border-t p-4 sm:px-6">
          <Button variant="outline" disabled={checking} onClick={() => onOpenChange(false)}>Cerrar</Button>
          <Button disabled={checking || students.length === 0} onClick={() => void checkAndPrint()}>
            {checking ? <Loader2 className="size-4 animate-spin"/> : <Printer className="size-4"/>}
            {checking ? "Verificando..." : "Ir a impresión"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
