export interface Position {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  is_active: boolean;
}
