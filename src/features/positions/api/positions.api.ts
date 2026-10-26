import { apiClient } from "@/api/client";
import type { Position } from "../types/position.types";

export const positionsApi = {
  getAll: async (): Promise<Position[]> => {
    const { data } = await apiClient.get<{ data: Position[] }>("/positions");
    return data.data;
  },
};
