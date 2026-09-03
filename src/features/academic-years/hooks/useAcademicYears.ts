import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { academicYearsApi } from "../api/academic-years.api"
import type { CreateAcademicYearRequest, UpdateAcademicYearRequest } from "../types/academic-year.types"
import { toast } from "sonner"
import type { AxiosError } from "axios";
import { useAuthStore } from "@/features/auth/store/auth.store";

// Query key como constante — evita typos en invalidaciones futuras
// export const ACADEMIC_YEARS_KEY = ['academic-years'] as const

// Define la estructura que responde tu servidor en caso de error
interface ErrorResponse {
    message?: string;
    error?: string;
}

export const ACADEMIC_YEARS_KEY = {
    all: ['academic-years'] as const,
    list: (page: number) => ['academic-years', 'list', page] as const,
}

// -- GET Lista paginada
export const useAcademicYears = (page = 1) => {
    return useQuery({
        queryKey: ACADEMIC_YEARS_KEY.list(page),
        queryFn: () => academicYearsApi.getAll(page),
        staleTime: 1000 * 60 * 5, // 5 min — los años académicos no cambian seguido
        placeholderData: (prev) => prev, // matiene datos anteriores al cambiar de página
    })
}

// -- GET lista completa (para el selector del Navbar) — no se cachea, se hace una sola vez al cargar la app
export const useAcademicYearsAll = () => {
    return useQuery({
        queryKey: ACADEMIC_YEARS_KEY.all,
        queryFn: () => academicYearsApi.getAll(1).then((res) => res.data),
        staleTime: 1000 * 60 * 30, // 30 min — los años académicos no cambian seguido
    })
}

// -- POST Crear un nuevo año académico
export const useCreateAcademicYear= () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: CreateAcademicYearRequest) => 
            academicYearsApi.create(payload),
        onSuccess: (newYear) => {
            // Invalida la lista para que se recargue
            queryClient.invalidateQueries({queryKey: ACADEMIC_YEARS_KEY.all})
            toast.success(`Año académico ${newYear.name} creado correctamente`, {toasterId: 'canvas'})
        },
        onError: (error: AxiosError<ErrorResponse>) => {
            const msg = 
                error?.response?.data?.message ??
                error?.response?.data?.error ??
                'Error al crear el año académico';
            toast.error(msg, {toasterId: 'canvas'})
        }
    })
}

// -- PUT Actualizar un año académico
export const useUpdateAcademicYear = () => {
    const queryClient = useQueryClient()
    const setAcademicYear = useAuthStore((state) => state.setAcademicYear)
    const currentAcademicYear = useAuthStore((state) => state.academicYear)

    return useMutation({
        mutationFn: ({id, payload}: {id: number, payload: UpdateAcademicYearRequest}) => 
            academicYearsApi.update(id, payload),
        onSuccess: (updated) => {
            queryClient.invalidateQueries({queryKey: ACADEMIC_YEARS_KEY.all})
            // Si el año académico actualizado es el mismo de la sesión actual, actualizarlo en el store
            if (currentAcademicYear?.id === updated.id) {
                setAcademicYear(updated)
            }
            toast.success(`Año académico ${updated.name} actualizado`, {toasterId: 'canvas'})
        },
        onError: (error: AxiosError<ErrorResponse>) => {
            const msg = 
                error?.response?.data?.message ??
                error?.response?.data?.error ??
                'Error al actualizar el año académico';
            toast.error(msg, {toasterId: 'canvas'})
        },
    })
}

// -- DELETE Eliminar un año académico
export const useDeleteAcademicYear = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => academicYearsApi.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ACADEMIC_YEARS_KEY.all})
            toast.success('Año académico eliminado', {toasterId: 'canvas'})
        },
        onError: (error: AxiosError<ErrorResponse>) => {
            const msg = 
                error?.response?.data?.message ??
                error?.response?.data?.error ??
                'No se puede eliminar este año académico';
            toast.error(msg, {toasterId: 'canvas'})
        }
    })
}