import * as React from "react"
import { cn } from "@/lib/utils"

interface InputWithIconProps extends React.ComponentProps<"input"> {
  icon?: React.ElementType | React.ReactNode
}

function InputWithIcon({ icon: Icon, className, type, ...props }: InputWithIconProps) {
  return (
    <div className="relative group">
      {Icon && (
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-zinc-500 transition-colors group-focus-within:text-phoenix-gold">
          {React.isValidElement(Icon) ? (
            Icon
          ) : (
            // @ts-expect-error Render dinámico de icono
            <Icon className="size-4 shrink-0" />
          )}
        </span>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          "placeholder:opacity-40 h-8 w-full min-w-0 rounded-lg border border-zinc-400 dark:border-lead-gray bg-white px-2.5 py-1 text-base transition-colors outline-none",
          "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50",
          "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm",
          "dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          Icon && "pl-8",
          className
        )}
        {...props}
      />
    </div>
  )
}

export { InputWithIcon }