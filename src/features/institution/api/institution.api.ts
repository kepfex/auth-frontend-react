import { apiClient } from '@/api/client';
import type { InstitutionPayload, InstitutionSetting } from '../types/institution.types';

const BASE = '/institution-settings';

export const institutionApi = {
  get: async (): Promise<InstitutionSetting | null> => {
    const { data } = await apiClient.get<{ data: InstitutionSetting | null }>(BASE);
    return data.data;
  },
  save: async (payload: InstitutionPayload): Promise<InstitutionSetting> => {
    const { data } = await apiClient.put<{ data: InstitutionSetting }>(BASE, payload);
    return data.data;
  },
};
