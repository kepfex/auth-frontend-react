// src/features/academic-years/components/AcademicYearSelector.tsx
import { CalendarDays, Check, ChevronDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useAcademicYears } from '../hooks/useAcademicYears'
import { cn } from '@/lib/utils'
import type { AcademicYear } from '../types/academic-year.types'

export const AcademicYearSelector = () => {
    // Año actualmente seleccionado en la sesión
    const academicYear = useAuthStore((state) => state.academicYear)
    const setAcademicYear = useAuthStore((state) => state.setAcademicYear)

    // Lista de todos los años desde la API (cacheada 30 min)
    const { data: years, isLoading } = useAcademicYears()

    const handleSelect = (year: AcademicYear) => {
        if (year.id === academicYear?.id) return // ya está seleccionado
        setAcademicYear(year) // actualiza Zustand + localStorage (persist)
        // TanStack Query invalidará automáticamente las queries que usen academicYearId
        // porque el queryKey incluye el id: ['students', academicYearId]
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    
                    className={cn(
                        'gap-2 px-3',
                        'border-phoenix-gold/40 text-phoenix-gold',
                        'hover:bg-phoenix-gold/10 hover:border-phoenix-gold',
                        'dark:border-phoenix-gold/30 dark:hover:bg-phoenix-gold/10',
                        'transition-all duration-200'
                    )}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <CalendarDays className="h-6 w-6" />
                    )}

                    <span>
                        {academicYear 
                        ? <div className='flex flex-col leading-none'>
                            <span className='text-sm font-medium leading-none'>{academicYear.name}</span>
                            <span className='text-[11px] text-gray-500'>Año Escolar </span>
                        </div> 
                        : 'Sin año'}
                    </span>

                    <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                    Seleccionar año académico
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {isLoading && (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                )}

                {years?.map((year) => (
                    <DropdownMenuItem
                        key={year.id}
                        onClick={() => handleSelect(year)}
                        className="cursor-pointer justify-between"
                    >
                        <div className="flex items-center gap-2">
                            {/* Badge de activo — el año marcado como is_active en BD */}
                            {year.is_active && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            )}
                            <span className={cn(!year.is_active && 'pl-3.5')}>
                                {year.name}
                            </span>
                            {year.is_active && (
                                <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                    activo
                                </span>
                            )}
                        </div>

                        {/* Check en el año actualmente seleccionado en sesión */}
                        {year.id === academicYear?.id && (
                            <Check className="h-4 w-4 text-phoenix-gold shrink-0" />
                        )}
                    </DropdownMenuItem>
                ))}

                {!isLoading && !years?.length && (
                    <p className="text-xs text-muted-foreground text-center py-3">
                        No hay años registrados
                    </p>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}