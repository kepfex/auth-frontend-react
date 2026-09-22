import { NotepadTextDashed, type LucideIcon } from "lucide-react"

interface EmptyStateProps {
    icon?: LucideIcon
    title: string
    description?: string
    actionLabel?: string
    actionIcon?: LucideIcon
    onAction?: () => void
}

export const EmptyState = ({
    icon: Icon = NotepadTextDashed,
    title,
    description,
    actionLabel,
    actionIcon: ActionIcon,
    onAction,
}: EmptyStateProps) => {
    return (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl py-14 px-6 text-center bg-slate-50/50 hover:bg-slate-50 transition">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
                <Icon />
            </div>

            <h3 className="text-sm font-semibold text-slate-800">
                {title}
            </h3>

            {description && (
                <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
                    {description}
                </p>
            )}

            {actionLabel && onAction && (
                <div className="mt-5">
                    <button
                        type="button"
                        onClick={onAction}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3.5 py-2 rounded-lg transition"
                    >
                        {ActionIcon && <ActionIcon />}
                        {actionLabel}
                    </button>
                </div>
            )}
        </div>
    )
}