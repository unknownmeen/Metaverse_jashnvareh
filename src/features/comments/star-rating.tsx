import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
}

export function StarRating({ value, onChange, readonly = false, size = "md" }: StarRatingProps) {
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((item) => (
        <button
          className={cn(
            "rounded-full p-1 text-amber-300 transition hover:scale-105",
            readonly && "pointer-events-none",
            value >= item && "text-amber-500",
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
