import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PersonSearchParams, UpdatePersonRequest } from "../types/person.types";
import { personsApi } from "../api/persons.api";

export const PERSON_KEYS = {
  all: ["persons"] as const,

  details: () => [...PERSON_KEYS.all, "detail"] as const,

  detail: (id: number) => [...PERSON_KEYS.details(), id] as const,

  searches: () => [...PERSON_KEYS.all, "search"] as const,

  search: (params: PersonSearchParams) =>
    [
      ...PERSON_KEYS.searches(),
      params.document_type,
      params.document_number,
    ] as const,
};

export const useFindPersonByDocument = () => {
  return useMutation({
    mutationFn: (
      params: PersonSearchParams,
    ) =>
      personsApi.findByDocument(params),
  });
};

export const usePersonSearch = (params: PersonSearchParams, enabled = true) => {
  const documentNumber = params.document_number.trim();

  return useQuery({
    queryKey: PERSON_KEYS.search({
      ...params,
      document_number: documentNumber,
    }),

    queryFn: () =>
      personsApi.findByDocument({
        ...params,
        document_number: documentNumber,
      }),

    enabled:
      enabled && Boolean(params.document_type) && documentNumber.length > 0,

    staleTime: 1000 * 60 * 5,
  });
};

export const usePerson = (
  id: number,
  enabled = true,
) => {
  return useQuery({
    queryKey: PERSON_KEYS.detail(id),
    queryFn: () => personsApi.getById(id),
    enabled: enabled && id > 0,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdatePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdatePersonRequest;
    }) =>
      personsApi.update(id, payload),

    onSuccess: (person) => {
      queryClient.setQueryData(
        PERSON_KEYS.detail(person.id),
        person,
      );

      queryClient.invalidateQueries({
        queryKey: PERSON_KEYS.searches(),
      });
    },
  });
};
