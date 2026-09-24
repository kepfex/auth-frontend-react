import {
  Check,
  ChevronDown,
  GraduationCap,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";

import { useAppContextStore } from "@/store/app-context.store";

import { useLevels } from "../hooks/useAcademicStructure";

import type { EducationalLevel } from "../types/academic-structure.types";

export const EducationalLevelSelector = () => {
  const educationalLevel =
    useAppContextStore(
      (state) => state.educationalLevel
    );

  const setEducationalLevel =
    useAppContextStore(
      (state) => state.setEducationalLevel
    );

  const {
    data: levels,
    isLoading,
  } = useLevels();

  const handleSelect = (
    level: EducationalLevel | null
  ) => {
    if (
      level?.id === educationalLevel?.id
    ) {
      return;
    }

    setEducationalLevel(level);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "gap-2 px-3",
            "border-indigo-500/30",
            "hover:bg-indigo-500/10",
            "transition-all duration-200"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <GraduationCap className="h-5 w-5" />
          )}

          <div className="flex flex-col items-start leading-none">
            <span className="text-sm font-medium">
              {educationalLevel?.name ??
                "Todos"}
            </span>

            <span className="text-[11px] text-muted-foreground">
              Nivel educativo
            </span>
          </div>

          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-56"
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Seleccionar nivel educativo
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() =>
            handleSelect(null)
          }
          className="cursor-pointer justify-between"
        >
          <span>Todos los niveles</span>

          {!educationalLevel && (
            <Check className="h-4 w-4" />
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {isLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}

        {levels?.map((level) => (
          <DropdownMenuItem
            key={level.id}
            onClick={() =>
              handleSelect(level)
            }
            className="cursor-pointer justify-between"
          >
            <div className="flex items-center gap-2">
              <span>
                {level.name}
              </span>

              <span className="text-xs text-muted-foreground">
                {level.code}
              </span>
            </div>

            {educationalLevel?.id ===
              level.id && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};