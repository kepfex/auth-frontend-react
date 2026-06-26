import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeStore, type Theme } from "@/store/themeStore";
import { Monitor, Moon, Palette, Sun } from "lucide-react";
import { cn } from "@/lib/utils";


const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Claro", icon: <Sun className="mr-2 h-4 w-4" /> },
  { value: "dark", label: "Oscuro", icon: <Moon className="mr-2 h-4 w-4" /> },
  {
    value: "system",
    label: "Sistema",
    icon: <Monitor className="mr-2 h-4 w-4" />,
  },
];

export const ThemeToggle = () => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="h-4 w-4" />
          Tema
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={cn(
              "cursor-pointer",
              theme === option.value && "bg-accent font-medium"
            )}
          >
            {option.icon}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
