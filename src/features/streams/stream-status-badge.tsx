import { cn } from "@/lib/utils";
import type { StreamStatus } from "@/types/models";

const statusMap: Record<StreamStatus, { label: string; dotColor: string; textColor: string; bgColor: string }> = {
  opened: { label: "باز", dotColor: "bg-emerald-500", textColor: "text-emerald-700", bgColor: "bg-emerald-50" },
  finished: { label: "پایان یافته", dotColor: "bg-amber-500", textColor: "text-amber-700", bgColor: "bg-amber-50" },
  not_opened: { label: "هنوز باز نشده", dotColor: "bg-rose-500", textColor: "text-rose-700", bgColor: "bg-rose-50" },
};

export function StreamStatusBadge({ status, size = "md" }: { status: StreamStatus; size?: "sm" | "md" }) {
  const item = statusMap[status];
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold",
        item.textColor,
        item.bgColor,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
      )}
    >
      <span className={cn("rounded-full", item.dotColor, size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2")} />
      {item.label}
    </div>
  );
}
