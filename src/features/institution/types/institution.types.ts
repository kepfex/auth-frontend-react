export interface InstitutionSetting {
  id: number;
  name: string;
  abbreviation: string;
  modular_code: string | null;
  local_code: string | null;
  ugel: string | null;
  dre: string | null;
  address: string | null;
  phone: string | null;
  contact_email: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export type InstitutionPayload = Pick<InstitutionSetting, 'name' | 'abbreviation' | 'modular_code' | 'local_code' | 'ugel' | 'dre' | 'address' | 'phone' | 'contact_email'>;
