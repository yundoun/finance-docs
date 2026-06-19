import { cn } from "@/lib/utils";

const CONFIG = {
  beginner: { label: "입문", className: "bg-secondary-50 text-secondary-700 border-secondary-200" },
  intermediate: { label: "중급", className: "bg-sky-50 text-sky-700 border-sky-200" },
  advanced: { label: "심화", className: "bg-purple-50 text-purple-700 border-purple-200" },
} as const;

interface DifficultyBadgeProps {
  difficulty: keyof typeof CONFIG;
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const { label, className } = CONFIG[difficulty];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {label}
    </span>
  );
}
