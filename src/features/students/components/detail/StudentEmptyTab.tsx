import type {
  LucideIcon,
} from "lucide-react";

interface StudentEmptyTabProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const StudentEmptyTab = ({
  icon: Icon,
  title,
  description,
}: StudentEmptyTabProps) => {
  return (
    <div className="rounded-lg border border-dashed px-6 py-16 text-center">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </div>

      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
};