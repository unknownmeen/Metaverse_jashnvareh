import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
  max?: number;
  color?: "amber" | "purple";
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
  max = 5,
  color = "amber",
}: StarRatingProps) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5 sm:h-4 sm:w-4" : "h-4 w-4 sm:h-5 sm:w-5";
  const buttonPadding = size === "sm" ? "p-0.5 sm:p-1" : "p-1";
  const baseColor = color === "purple" ? "text-violet-200" : "text-amber-300";
  const activeColor = color === "purple" ? "text-violet-500" : "text-amber-500";

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, index) => index + 1).map((item) => (
        <button
          className={cn(
            `rounded-full transition hover:scale-105 ${buttonPadding} ${baseColor}`,
            readonly && "pointer-events-none",
            value >= item && activeColor,
          )}
          key={item}
          onClick={() => onChange?.(item)}
          type="button"
        >
          <Star className={cn(iconSize, value >= item && "fill-current")} />
        </button>
      ))}
    </div>
  );
}
