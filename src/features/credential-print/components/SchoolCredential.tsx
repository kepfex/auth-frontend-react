import { QRCodeSVG } from "qrcode.react";

import type { CredentialStudent } from "../types/credential-print.types";

interface Props {
  student: CredentialStudent;
  academicYear: string;
  level: string;
  grade: string;
  section: string;
}

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
      className="credential-card relative box-border flex shrink-0 flex-col overflow-hidden rounded-md border bg-white text-slate-900"
      style={{
        width: "85.6mm",
        height: "54mm",
      }}
    >
      <header className="flex h-[13mm] shrink-0 items-center gap-2 bg-[#163c70] px-3 text-white">
        {/* Aquí podremos incorporar la insignia oficial */}
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/50 text-xs font-bold">
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

      <div className="flex min-h-0 flex-1 items-center gap-2 px-3 py-2">
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="text-[8px] text-slate-500">ESTUDIANTE</p>

            <p className="text-[11px] font-bold uppercase leading-tight wrap-break-word">
              {student.full_name}
            </p>
          </div>

          <div>
            <p className="text-[8px] text-slate-500">GRADO Y SECCIÓN</p>

            <p className="text-[10px] font-medium">
              {grade} {section} · {level}
            </p>
          </div>

          <p className="text-[9px] text-slate-600">{student.student_code}</p>
        </div>

        <div className="shrink-0 rounded-sm bg-white p-1">
          <QRCodeSVG
            value={student.qr.uuid}
            size={126}
            level="M"
            marginSize={1}
            bgColor="#FFFFFF"
            fgColor="#000000"
            title={`QR de ${student.full_name}`}
            style={{
              width: "29mm",
              height: "29mm",
            }}
          />
        </div>
      </div>

      <footer className="flex h-[5mm] shrink-0 items-center justify-center bg-slate-100 px-2 text-center text-[7px] text-slate-600">
        Identificación escolar para registro de asistencia
      </footer>
    </article>
  );
}
