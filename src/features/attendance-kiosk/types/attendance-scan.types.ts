export type QrScanResult = "accepted" | "rejected" | "duplicate" | "invalid";

export type AttendanceMarkStatus = "on_time" | "late" | "early" | "unmatched";

export type AttendanceEventType = "entry" | "exit";

export interface AttendanceScanStudent {
  id: number;

  student_code: string | null;

  first_names: string;

  paternal_surname: string;

  maternal_surname: string | null;
}

export interface AttendanceScanMark {
  attendance_day_id: number;

  attendance_mark_id: number;

  date: string | null;

  day_status: string | null;

  event_type: AttendanceEventType;

  event_type_label: string;

  expected_time: string | null;

  recorded_at: string;

  status: AttendanceMarkStatus;

  status_label: string;

  difference_minutes: number | null;
}

export interface AttendanceScanResponse {
  id: number;

  accepted: boolean;

  result: QrScanResult;

  result_label: string;

  reason: string | null;

  message: string;

  scanned_at: string;

  student: AttendanceScanStudent | null;

  attendance: AttendanceScanMark | null;
}

export interface ScanAttendanceQrRequest {
  qr: string;
}
