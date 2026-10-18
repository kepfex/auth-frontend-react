import { jsPDF } from "jspdf";
import QRCode from "qrcode";

import type {
  ClassroomCredentialData,
  CredentialStudent,
} from "../types/credential-print.types";

import { isCredentialEligible } from "./credentialPrint";

// Medidas físicas en milímetros
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;

const CARD_WIDTH = 85.6;
const CARD_HEIGHT = 54;

const MARGIN_X = 10;
const MARGIN_Y = 10;

const GAP_X = 5;
const GAP_Y = 5;

const CARDS_PER_ROW = 2;
const ROWS_PER_PAGE = 4;
const CARDS_PER_PAGE = CARDS_PER_ROW * ROWS_PER_PAGE;

interface GenerateCredentialsPdfOptions {
  data: ClassroomCredentialData;
  students: CredentialStudent[];
  academicYearName: string;
}

function drawStudentPhotoPlaceholder(pdf: jsPDF, x: number, y: number): void {
  // Espacio reservado para fotografía futura.
  pdf.setFillColor(241, 245, 249);
  pdf.setDrawColor(203, 213, 225);
  pdf.roundedRect(x, y, 19, 28, 1, 1, "FD");

  // Silueta predeterminada.
  pdf.setFillColor(148, 163, 184);

  // Cabeza
  pdf.circle(x + 9.5, y + 9, 4, "F");

  // Hombros / cuerpo
  pdf.ellipse(x + 9.5, y + 21, 7, 6, "F");
}

function drawCredential(
  pdf: jsPDF,
  student: CredentialStudent,
  data: ClassroomCredentialData,
  year: string,
  qrImage: string,
  x: number,
  y: number,
): void {
  // Fondo y borde.
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(203, 213, 225);
  pdf.rect(x, y, CARD_WIDTH, CARD_HEIGHT, "FD");

  // Encabezado institucional.
  pdf.setFillColor(22, 60, 112);
  pdf.rect(x, y, CARD_WIDTH, 12, "F");

  // Insignia provisional.
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.25);
  pdf.circle(x + 7, y + 6, 4, "S");

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.text("6099", x + 7, y + 6.8, {
    align: "center",
  });

  pdf.setFontSize(10);
  pdf.text("I.E. 6099 PERÚ ESPAÑA", x + 13, y + 5.5);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.text(`CREDENCIAL ESCOLAR - ${year}`, x + 13, y + 9);

  // Fotografía predeterminada.
  drawStudentPhotoPlaceholder(pdf, x + 3, y + 15);

  // Información del estudiante.
  const textX = x + 25;
  const textWidth = 32;

  pdf.setTextColor(100, 116, 139);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6);
  pdf.text("ESTUDIANTE", textX, y + 18);

  pdf.setTextColor(15, 23, 42);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.4);

  const nameLines = pdf
    .splitTextToSize(student.full_name.toUpperCase(), textWidth)
    .slice(0, 3) as string[];

  pdf.text(nameLines, textX, y + 22, {
    lineHeightFactor: 1.15,
  });

  pdf.setTextColor(100, 116, 139);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6);
  pdf.text("GRADO Y SECCIÓN", textX, y + 34);

  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(7);

  const classroomText = `${data.grade} ${data.section} · ${data.level}`;

  const classroomLines = pdf
    .splitTextToSize(classroomText, textWidth)
    .slice(0, 2) as string[];

  pdf.text(classroomLines, textX, y + 38, {
    lineHeightFactor: 1.1,
  });

  pdf.setTextColor(100, 116, 139);
  pdf.setFontSize(6.5);
  pdf.text(student.student_code, textX, y + 44);

  // QR generado a partir del UUID almacenado en Laravel.
  pdf.addImage(qrImage, "PNG", x + 60, y + 17, 23, 23);

  // Pie de tarjeta.
  pdf.setFillColor(241, 245, 249);
  pdf.rect(x, y + CARD_HEIGHT - 5, CARD_WIDTH, 5, "F");

  pdf.setTextColor(100, 116, 139);
  pdf.setFontSize(6);
  pdf.text(
    "IDENTIFICACIÓN ESCOLAR - CONTROL DE ASISTENCIA",
    x + CARD_WIDTH / 2,
    y + CARD_HEIGHT - 1.8,
    { align: "center" },
  );
}

export async function generateCredentialsPdf({
  data,
  students,
  academicYearName,
}: GenerateCredentialsPdfOptions): Promise<void> {
  if (students.length === 0) {
    throw new Error("No hay estudiantes seleccionados.");
  }

  // Segunda protección: nunca generar tarjetas sin QR activo.
  if (!students.every(isCredentialEligible)) {
    throw new Error("La selección contiene estudiantes sin QR habilitado.");
  }

  if (!data.grade || !data.section || !data.level || !academicYearName) {
    throw new Error("Faltan datos académicos para el PDF.");
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  // Generar QR antes de comenzar a dibujar.
  // Si falla uno, no se descarga un documento incompleto.
  const qrImages = await Promise.all(
    students.map((student) =>
      QRCode.toDataURL(student.qr!.uuid, {
        errorCorrectionLevel: "M",
        width: 320,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      }),
    ),
  );

  students.forEach((student, index) => {
    if (index > 0 && index % CARDS_PER_PAGE === 0) {
      pdf.addPage();
    }

    const position = index % CARDS_PER_PAGE;

    const column = position % CARDS_PER_ROW;
    const row = Math.floor(position / CARDS_PER_ROW);

    const x = MARGIN_X + column * (CARD_WIDTH + GAP_X);

    const y = MARGIN_Y + row * (CARD_HEIGHT + GAP_Y);

    drawCredential(pdf, student, data, academicYearName, qrImages[index], x, y);
  });

  const safeYear = academicYearName.replace(/[^a-zA-Z0-9_-]/g, "_");

  const filename = `credenciales_${safeYear}_aula_${data.grade_section_id}.pdf`;

  pdf.save(filename);
}
