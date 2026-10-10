import { useMutation } from "@tanstack/react-query";

import { attendanceScanApi } from "../api/attendance-scan.api";

export const useAttendanceScan = () => {
  return useMutation({
    mutationFn: attendanceScanApi.scan,
  });
};
