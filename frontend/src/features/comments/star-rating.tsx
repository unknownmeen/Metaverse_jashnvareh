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
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const baseColor = color === "purple" ? "text-violet-200" : "text-amber-300";
  const activeColor = color === "purple" ? "text-violet-500" : "text-amber-500";

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, index) => index + 1).map((item) => (
        <button
          className={cn(
            `rounded-full p-1 transition hover:scale-105 ${baseColor}`,
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
