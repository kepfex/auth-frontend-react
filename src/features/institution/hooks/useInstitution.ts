import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { institutionApi } from '../api/institution.api';
import type { InstitutionPayload } from '../types/institution.types';

export const INSTITUTION_KEY = ['institution-settings'] as const;

export function useInstitution() {
  return useQuery({ queryKey: INSTITUTION_KEY, queryFn: institutionApi.get, staleTime: 60_000 });
}

export function useSaveInstitution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InstitutionPayload) => institutionApi.save(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: INSTITUTION_KEY }),
  });
}
