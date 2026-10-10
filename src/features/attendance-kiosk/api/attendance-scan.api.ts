import { apiClient } from "@/api/client";

import type {
  AttendanceScanResponse,
  ScanAttendanceQrRequest,
} from "../types/attendance-scan.types";

export const attendanceScanApi = {
  scan: async (
    payload: ScanAttendanceQrRequest,
  ): Promise<AttendanceScanResponse> => {
    const { data } = await apiClient.post<{
      data: AttendanceScanResponse;
    }>("/attendance/scan", payload);

    return data.data;
  },
};
