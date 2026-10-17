export interface QrCard {
  id: number;
  student_id: number;

  uuid: string;
  qr_value: string;

  is_active: boolean;

  created_at: string;
  updated_at: string;
}

export interface UpdateQrCardStatusRequest {
  is_active: boolean;
}
