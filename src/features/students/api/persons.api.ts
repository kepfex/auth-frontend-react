import { apiClient } from "@/api/client";
import type {
  CreatePersonRequest,
  Person,
  PersonSearchParams,
  UpdatePersonRequest,
} from "../types/person.types";

const BASE_URL = "/persons";

export const personsApi = {
  findByDocument: async (
    params: PersonSearchParams,
  ): Promise<Person | null> => {
    const { data } = await apiClient.get<{ data: Person | null }>(BASE_URL, {
      params,
    });

    return data.data;
  },

  getById: async (id: number): Promise<Person> => {
    const { data } = await apiClient.get<{ data: Person }>(`${BASE_URL}/${id}`);

    return data.data;
  },

  create: async (payload: CreatePersonRequest): Promise<Person> => {
    const { data } = await apiClient.post<{ data: Person }>(BASE_URL, payload);

    return data.data;
  },

  update: async (id: number, payload: UpdatePersonRequest): Promise<Person> => {
    const { data } = await apiClient.patch<{
      data: Person;
    }>(`${BASE_URL}/${id}`, payload);

    return data.data;
  },
};
