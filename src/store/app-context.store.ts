import type { EducationalLevel } from "@/features/academic-structure/types/academic-structure.types";
import type { AcademicYear } from "@/features/academic-years/types/academic-year.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppContextState {
    academicYear: AcademicYear | null;
    educationalLevel: EducationalLevel | null;

    setAcademicYear: (academicYear: AcademicYear | null) => void;

    setEducationalLevel: (educationalLevel: EducationalLevel | null) => void;

    clearContext: () => void;
}

export const useAppContextStore = create<AppContextState>()(
    persist(set => ({
        academicYear: null,
        educationalLevel: null,

        setAcademicYear: (academicYear) => set({ academicYear }),

        setEducationalLevel: (educationalLevel) => set({ educationalLevel }),

        clearContext: () => set({
            academicYear: null,
            educationalLevel: null,
        })
    }), {
        name: "app-context-storage",
        partialize: (state) => ({
            academicYear: state.academicYear,
            educationalLevel: state.educationalLevel,
        }),
    }
    )
)
