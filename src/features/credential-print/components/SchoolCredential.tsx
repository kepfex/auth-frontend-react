import { QRCodeSVG } from "qrcode.react";
import { UserRound } from "lucide-react";
import type { CredentialStudent } from "../types/credential-print.types";

type Props = {
  student: CredentialStudent;
  academicYear: string;
  level: string;
  grade: string;
  section: string;
};

/** Componente puramente de presentación. Su código QR es siempre el UUID devuelto por Laravel. */
export function SchoolCredential({
  student,
  academicYear,
  level,
  grade,
  section,
}: Props) {
  if (!student.qr) return null;
  return (
    <article
      className="credential-card box-border flex shrink-0 flex-col overflow-hidden border border-slate-300 bg-white text-slate-900"
      style={{ width: "85.6mm", height: "54mm" }}
    >
      <header className="flex h-[12mm] shrink-0 items-center gap-2 bg-[#163c70] px-[3mm] text-white">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/60 text-[10px] font-bold">
          6099
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold leading-tight">
            I.E. 6099 PERÚ ESPAÑA
          </p>
          <p className="text-[8px] text-blue-100">
            CREDENCIAL ESCOLAR · {academicYear}
          </p>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 items-center gap-[2mm] px-[3mm] py-[2mm]">
        <div
          className="flex h-[29mm] w-[19mm] shrink-0 items-center justify-center rounded-sm border border-slate-200 bg-slate-100"
          aria-label="Fotografía predeterminada"
        >
          <UserRound className="size-9 text-slate-400" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1 space-y-[2mm]">
          <div>
            <p className="text-[7px] text-slate-500">ESTUDIANTE</p>
            <p className="wrap-break-word text-[9px] font-bold uppercase leading-tight">
              {student.full_name}
            </p>
          </div>
          <div>
            <p className="text-[7px] text-slate-500">GRADO Y SECCIÓN</p>
            <p className="text-[9px] leading-tight">
              {grade} {section} · {level}
            </p>
          </div>
          <p className="text-[8px] text-slate-600">{student.student_code}</p>
        </div>
        <div className="shrink-0 bg-white p-[1mm]">
          <QRCodeSVG
            value={student.qr.uuid}
            level="M"
            size={110}
            marginSize={1}
            style={{ width: "24mm", height: "24mm" }}
            aria-label={`Código QR de ${student.full_name}`}
          />
        </div>
      </div>
      <footer className="flex h-[5mm] shrink-0 items-center justify-center bg-slate-100 text-[7px] text-slate-600">
        Identificación escolar · Control de asistencia
      </footer>
    </article>
  );
}
