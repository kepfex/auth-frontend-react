import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  gradesApi,
  levelsApi,
  sectionsApi,
} from "../api/academic-structure.api";
import { toast } from "sonner";
import type {
  CreateGradeRequest,
  CreateSectionRequest,
  UpdateGradeRequest,
  UpdateLevelRequest,
  UpdateSectionRequest,
} from "../types/academic-structure.types";
import type { ErrorResponse } from "@/shared/types/shared.types";
import type { AxiosError } from "axios";
import { getApiError } from "@/shared/utils/api-error";

export const STRUCTURE_KEYS = {
  levels: ["educational-levels"] as const,
  grades: ["grades"] as const,
  sections: ["sections"] as const,
};

// ── NIVELES ───────────────────────────────────────────
export const useLevels = () =>
  useQuery({
    queryKey: STRUCTURE_KEYS.levels,
    queryFn: levelsApi.getAll,
    staleTime: 1000 * 60 * 30,
  });

// -- POST Crear un nuevo nivel educativo
export const useCreateLevel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: levelsApi.create,
    onSuccess: (l) => {
      qc.invalidateQueries({ queryKey: STRUCTURE_KEYS.levels });
      toast.success(`Nivel "${l.name}" creado`);
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Error al crear nivel"),
  });
};

export const useUpdateLevel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateLevelRequest;
    }) => levelsApi.update(id, payload),
    onSuccess: (l) => {
      qc.invalidateQueries({ queryKey: STRUCTURE_KEYS.levels });
      toast.success(`Nivel "${l.name}" actualizado`);
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Error al actualizar"),
  });
};

export const useDeleteLevel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: levelsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STRUCTURE_KEYS.levels });
      toast.success("Nivel eliminado");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const msg =
        error?.response?.data?.message ??
        error?.response?.data?.error ??
        "No se puede eliminar — tiene grados asociados";
      toast.error(msg);
      console.log(error?.response?.data);
    },
  });
};

// ── GRADOS ────────────────────────────────────────────
export const useGrades = () =>
  useQuery({
    queryKey: STRUCTURE_KEYS.grades,
    queryFn: gradesApi.getAll,
    staleTime: 1000 * 60 * 30,
  });

export const useCreateGrade = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: CreateGradeRequest) => gradesApi.create(p),
    onSuccess: (g) => {
      qc.invalidateQueries({ queryKey: STRUCTURE_KEYS.grades });
      qc.invalidateQueries({ queryKey: STRUCTURE_KEYS.levels });
      toast.success(`Grado "${g.name}" creado`);
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Error al crear grado"),
  });
};

export const useUpdateGrade = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateGradeRequest;
    }) => gradesApi.update(id, payload),
    onSuccess: (g) => {
      qc.invalidateQueries({ queryKey: STRUCTURE_KEYS.grades });
      qc.invalidateQueries({ queryKey: STRUCTURE_KEYS.levels });
      toast.success(`Grado "${g.name}" actualizado`);
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Error al actualizar"),
  });
};

export const useDeleteGrade = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: gradesApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STRUCTURE_KEYS.grades });
      qc.invalidateQueries({ queryKey: STRUCTURE_KEYS.levels });
      toast.success("Grado eliminado");
    },
    onError: (error: AxiosError<ErrorResponse>) => {    
      const apiError = getApiError(
        error,
        "No se puedo eliminar el grado"
      );

      toast.error(apiError.message, {
        description: apiError.details
      })
    }
  });
};

// ── SECCIONES ─────────────────────────────────────────
export const useSections = () =>
  useQuery({
    queryKey: STRUCTURE_KEYS.sections,
    queryFn: sectionsApi.getAll,
    staleTime: 1000 * 60 * 30,
  });

export const useCreateSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: CreateSectionRequest) => sectionsApi.create(p),
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: STRUCTURE_KEYS.sections });
      toast.success(`Sección "${s.name}" creada`);
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Error al crear sección"),
  });
};

export const useUpdateSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateSectionRequest;
    }) => sectionsApi.update(id, payload),
    onSuccess: (g) => {
      qc.invalidateQueries({ queryKey: STRUCTURE_KEYS.sections });
      toast.success(`Sección "${g.name}" actualizado`);
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Error al actualizar"),
  });
};

export const useDeleteSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sectionsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STRUCTURE_KEYS.sections });
      toast.success("Sección eliminada");
    },
    onError: (error: AxiosError<ErrorResponse>) =>{
      const apiError = getApiError(
        error,
        "No se puedo eliminar la sección"
      );

      toast.error(apiError.message, {
        description: apiError.details
      })
    }
  });
};
