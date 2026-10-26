import { useQuery } from "@tanstack/react-query";
import { positionsApi } from "../api/positions.api";

export const POSITION_KEYS = { all: ["positions"] as const };
export const usePositions = () => useQuery({
  queryKey: POSITION_KEYS.all,
  queryFn: positionsApi.getAll,
  select: (positions) => positions.filter((position) => position.is_active),
  staleTime: 5 * 60_000,
});
