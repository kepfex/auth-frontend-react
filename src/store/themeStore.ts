import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = 'light' | 'dark' | 'system';

interface ThemeStore {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set) => ({
            theme: 'light',
            setTheme: (theme: Theme) => set({ theme }),
        }),
        {
            name: 'theme-storage', // se guarda en localStorage con este nombre
        }
    )
)