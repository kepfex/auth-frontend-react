import "../../../credential-print.css";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { credentialPrintApi } from "@/features/credential-print/api/credential-print.api";
import { SchoolCredential } from "@/features/credential-print/components/SchoolCredential";
import { isCredentialEligible, paginateCards } from "@/features/credential-print/lib/credentialPrint";

export function CredentialsPrintPage() {
  const [params] = useSearchParams();
  const year = Number(params.get("year"));
  const yearLabel = params.get("yearName") || String(year);
  const classroom = Number(params.get("classroom"));
  const ids = useMemo(() => (params.get("students") ?? "").split(",").map(Number).filter(n => Number.isSafeInteger(n) && n > 0).slice(0, 200), [params]);
  const validInput = Number.isSafeInteger(year) && year > 0 && Number.isSafeInteger(classroom) && classroom > 0 && ids.length > 0 && ids.length === new Set(ids).size;
  const [busy, setBusy] = useState(false);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["credential-print", "print", year, classroom, ids],
    queryFn: () => credentialPrintApi.getStudents(year, classroom),
    enabled: validInput,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
  const byId = new Map(data?.students.map(s => [s.student_id, s]) ?? []);
  const students = ids.map(id => byId.get(id)).filter((s): s is NonNullable<typeof s> => !!s && isCredentialEligible(s));
  const allValid = validInput && !!data && students.length === ids.length && data.academic_year_id === year && data.grade_section_id === classroom;
  const pages = paginateCards(students);

  async function print() {
    if (busy || !allValid) return;
    setBusy(true);
    try {
      const result = await refetch();
      const latest = result.data;
      if (!latest || result.isError || latest.grade !== data?.grade || latest.section !== data?.section || latest.level !== data?.level) {
        toast.error("No se pudo verificar el aula para impresión.");
        return;
      }
      const latestById = new Map(latest.students.map(s => [s.student_id, s]));
      const unchanged = students.every(s => {
        const next = latestById.get(s.student_id);
        return next && isCredentialEligible(next) &&
          next.enrollment_id === s.enrollment_id && next.full_name === s.full_name &&
          next.student_code === s.student_code && next.qr?.uuid === s.qr?.uuid;
      });
      if (!unchanged) {
        toast.warning("Alguna credencial cambió. Regresa y prepara otra vista previa.");
        return;
      }
      window.print();
    } catch {
      toast.error("No se pudo conectar con Laravel. No se abrió la impresión.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-900 print:bg-white print:p-0">
      <div className="mx-auto mb-5 flex max-w-5xl flex-wrap items-center justify-between gap-3 print:hidden">
        <Link className="inline-flex items-center gap-2 text-sm underline" to="/admin/credentials"><ArrowLeft className="size-4"/> Regresar a credenciales</Link>
        <Button disabled={!allValid || busy} onClick={() => void print()}><Printer className="size-4"/> {busy ? "Verificando..." : "Imprimir en A4"}</Button>
      </div>
      {!validInput ? <p className="text-center print:hidden">Parámetros de impresión inválidos.</p> :
       isPending ? <p className="text-center print:hidden">Cargando credenciales...</p> :
       isError ? <p className="text-center print:hidden">No se pudieron consultar las credenciales.</p> :
       !allValid ? <p className="text-center print:hidden">El lote contiene alumnos no elegibles o que ya no pertenecen al aula. Regresa a seleccionarlos.</p> : (
        <div id="credential-print-document" className="mx-auto flex flex-col items-center gap-5 print:block">
          {pages.map((items, i) => (
            <section className="credential-a4-page" key={i}>
              <div className="credential-a4-grid">
                {items.map(student => <SchoolCredential key={student.student_id} student={student}
                  academicYear={yearLabel} grade={data!.grade} section={data!.section} level={data!.level} />)}
              </div>
            </section>
          ))}
        </div>
       )}
    </main>
  );
}
